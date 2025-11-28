package handlers

import (
	"back-end/config"
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"
	"github.com/gin-gonic/gin"
)

// CreateNote - สร้างโน้ตขาย พร้อมรูปภาพและ PDF
func CreateNote(c *gin.Context) {
	// ดึง user_id จาก JWT token
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// รับข้อมูลจาก form
	bookTitle := c.PostForm("title")
	description := c.PostForm("description")
	priceStr := c.PostForm("price")
	faculty := c.PostForm("faculty")
	subject := c.PostForm("subject")
	year := c.PostForm("year")
	examTerm := c.PostForm("exam_term")

	// Validate required fields
	if bookTitle == "" || priceStr == "" || faculty == "" || subject == "" || year == "" || examTerm == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing required fields",
		})
		return
	}

	// แปลงราคาเป็น float
	price, err := strconv.ParseFloat(priceStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid price format",
		})
		return
	}

	// ดึงไฟล์ PDF
	pdfFile, err := c.FormFile("pdf")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "PDF file is required",
			"message": err.Error(),
		})
		return
	}

	// ตรวจสอบว่าเป็นไฟล์ PDF
	if filepath.Ext(pdfFile.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are allowed",
		})
		return
	}

	// ดึงรูปภาพ
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to parse form data",
		})
		return
	}

	images := form.File["images"]
	if len(images) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "At least one image is required",
		})
		return
	}

	// สร้างโฟลเดอร์สำหรับเก็บไฟล์ (ถ้ายังไม่มี)
	uploadsDir := "./uploads"
	pdfDir := filepath.Join(uploadsDir, "pdfs")
	imageDir := filepath.Join(uploadsDir, "images")

	os.MkdirAll(pdfDir, 0755)
	os.MkdirAll(imageDir, 0755)

	// บันทึกไฟล์ PDF
	timestamp := time.Now().Unix()
	pdfFilename := fmt.Sprintf("%d_%s", timestamp, filepath.Base(pdfFile.Filename))
	pdfPath := filepath.Join(pdfDir, pdfFilename)

	if err := c.SaveUploadedFile(pdfFile, pdfPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save PDF file",
			"message": err.Error(),
		})
		return
	}

	// เริ่ม transaction
	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		return
	}
	defer tx.Rollback()

	// ค้นหา course_id (หรือสร้างใหม่ถ้ายังไม่มี)
	var courseID sql.NullInt64
	courseQuery := `
		SELECT id FROM courses 
		WHERE major = $1 AND name = $2 AND year = $3
	`
	err = tx.QueryRow(courseQuery, faculty, subject, year).Scan(&courseID)
	if err == sql.ErrNoRows {
		// สร้าง course ใหม่
		insertCourseQuery := `
			INSERT INTO courses (code, name, year, major)
			VALUES ($1, $2, $3, $4)
			RETURNING id
		`
		courseCode := fmt.Sprintf("%s-%s-%s", faculty, subject, year)
		err = tx.QueryRow(insertCourseQuery, courseCode, subject, year, faculty).Scan(&courseID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to create course",
				"message": err.Error(),
			})
			return
		}
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		return
	}

	// Insert ข้อมูลลง notes_for_sale
	var noteID int
	insertNoteQuery := `
		INSERT INTO notes_for_sale 
		(course_id, seller_id, book_title, price, exam_term, description, pdf_file, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, 'available', NOW())
		RETURNING id
	`
	err = tx.QueryRow(
		insertNoteQuery,
		courseID,
		userID,
		bookTitle,
		price,
		examTerm,
		description,
		pdfPath,
	).Scan(&noteID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create note",
			"message": err.Error(),
		})
		return
	}

	// บันทึกรูปภาพและ insert ลง note_images
	for order, imageFile := range images {
		// สร้างชื่อไฟล์ใหม่
		imageFilename := fmt.Sprintf("%d_note_%d_img_%d%s", timestamp, noteID, order, filepath.Ext(imageFile.Filename))
		imagePath := filepath.Join(imageDir, imageFilename)

		// บันทึกไฟล์รูปภาพ
		src, err := imageFile.Open()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to open image file",
				"message": err.Error(),
			})
			return
		}
		defer src.Close()

		dst, err := os.Create(imagePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to create image file",
				"message": err.Error(),
			})
			return
		}
		defer dst.Close()

		if _, err = io.Copy(dst, src); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to save image file",
				"message": err.Error(),
			})
			return
		}

		// Insert ข้อมูลรูปภาพลง database
		insertImageQuery := `
			INSERT INTO note_images (note_id, image_order, path, created_at)
			VALUES ($1, $2, $3, NOW())
		`
		_, err = tx.Exec(insertImageQuery, noteID, order, imagePath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to save image data",
				"message": err.Error(),
			})
			return
		}
	}

	// เพิ่ม role "seller" ให้ user อัตโนมัติ (ถ้ายังไม่มี)
	addSellerRoleQuery := `
		INSERT INTO user_roles (user_id, role_id)
		SELECT $1, r.id FROM roles r
		WHERE r.name = 'seller'
		AND NOT EXISTS (
			SELECT 1 FROM user_roles ur 
			WHERE ur.user_id = $1 AND ur.role_id = r.id
		)
	`
	_, err = tx.Exec(addSellerRoleQuery, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to assign seller role",
			"message": err.Error(),
		})
		return
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to commit transaction",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Note created successfully",
		"note_id":  noteID,
		"images":   len(images),
		"pdf_path": pdfPath,
	})
}
