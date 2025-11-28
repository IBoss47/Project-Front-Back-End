package handlers

import (
	"back-end/config"
	"database/sql"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// NoteResponse - โครงสร้างข้อมูล note สำหรับ response
type NoteResponse struct {
	ID          int      `json:"id"`
	BookTitle   string   `json:"book_title"`
	Price       float64  `json:"price"`
	ExamTerm    string   `json:"exam_term"`
	Description string   `json:"description"`
	Status      string   `json:"status"`
	CreatedAt   string   `json:"created_at"`
	CoverImage  string   `json:"cover_image"`
	Images      []string `json:"images"`
	Course      Course   `json:"course"`
	Seller      Seller   `json:"seller"`
}

type Course struct {
	ID    int    `json:"id"`
	Code  string `json:"code"`
	Name  string `json:"name"`
	Year  string `json:"year"`
	Major string `json:"major"`
}

type Seller struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
	Fullname string `json:"fullname"`
}

// GetAllNotes - ดึงข้อมูล notes ทั้งหมด (พร้อม filter)
func GetAllNotes(c *gin.Context) {
	// รับ query parameters สำหรับ filter
	major := c.Query("major")
	subject := c.Query("subject")
	year := c.Query("year")
	examTerm := c.Query("exam_term")
	search := c.Query("search")

	// สร้าง query
	query := `
		SELECT 
			n.id, n.book_title, n.price, n.exam_term, n.description, n.status, n.created_at,
			c.id, c.code, c.name, c.year, c.major,
			u.id, u.username, u.fullname
		FROM notes_for_sale n
		LEFT JOIN courses c ON n.course_id = c.id
		LEFT JOIN users u ON n.seller_id = u.id
		WHERE n.status = 'available'
	`

	args := []interface{}{}
	argCount := 1

	// เพิ่ม filters
	if major != "" {
		query += fmt.Sprintf(" AND c.major = $%d", argCount)
		args = append(args, major)
		argCount++
	}
	if subject != "" {
		query += fmt.Sprintf(" AND c.name = $%d", argCount)
		args = append(args, subject)
		argCount++
	}
	if year != "" {
		query += fmt.Sprintf(" AND c.year = $%d", argCount)
		args = append(args, year)
		argCount++
	}
	if examTerm != "" {
		query += fmt.Sprintf(" AND n.exam_term = $%d", argCount)
		args = append(args, examTerm)
		argCount++
	}
	if search != "" {
		query += fmt.Sprintf(" AND (n.book_title ILIKE $%d OR n.description ILIKE $%d)", argCount, argCount)
		args = append(args, "%"+search+"%")
		argCount++
	}

	// เพิ่ม ORDER BY (ไม่มี LIMIT/OFFSET)
	query += ` ORDER BY n.created_at DESC`

	// Execute query
	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}
	defer rows.Close()

	notes := []NoteResponse{}

	for rows.Next() {
		var note NoteResponse
		var courseID, sellerID sql.NullInt64
		var courseCode, courseName, courseYear, courseMajor sql.NullString
		var sellerUsername, sellerFullname sql.NullString
		var examTerm sql.NullString

		err := rows.Scan(
			&note.ID, &note.BookTitle, &note.Price, &examTerm, &note.Description, &note.Status, &note.CreatedAt,
			&courseID, &courseCode, &courseName, &courseYear, &courseMajor,
			&sellerID, &sellerUsername, &sellerFullname,
		)
		if err != nil {
			continue
		}

		// กำหนดค่า exam_term
		if examTerm.Valid {
			note.ExamTerm = examTerm.String
		}

		// กำหนดค่า course
		if courseID.Valid {
			note.Course = Course{
				ID:    int(courseID.Int64),
				Code:  courseCode.String,
				Name:  courseName.String,
				Year:  courseYear.String,
				Major: courseMajor.String,
			}
		}

		// กำหนดค่า seller
		if sellerID.Valid {
			note.Seller = Seller{
				ID:       int(sellerID.Int64),
				Username: sellerUsername.String,
				Fullname: sellerFullname.String,
			}
		}

		// ดึงรูปภาพ
		imageQuery := `
			SELECT path FROM note_images 
			WHERE note_id = $1 
			ORDER BY image_order ASC
		`
		imageRows, err := config.DB.Query(imageQuery, note.ID)
		if err == nil {
			images := []string{}
			for imageRows.Next() {
				var path string
				if err := imageRows.Scan(&path); err == nil {
					images = append(images, path)
				}
			}
			imageRows.Close()

			note.Images = images
			if len(images) > 0 {
				note.CoverImage = images[0] // รูปแรกเป็นหน้าปก
			}
		}

		notes = append(notes, note)
	}

	// ถ้าไม่มีข้อมูล ส่ง array ว่าง
	if notes == nil {
		notes = []NoteResponse{}
	}

	c.JSON(http.StatusOK, notes)
}

// GetNoteByID - ดึงข้อมูล note เดียวตาม ID
func GetNoteByID(c *gin.Context) {
	noteID := c.Param("id")

	query := `
		SELECT 
			n.id, n.book_title, n.price, n.exam_term, n.description, n.status, n.created_at, n.pdf_file,
			c.id, c.code, c.name, c.year, c.major,
			u.id, u.username, u.fullname
		FROM notes_for_sale n
		LEFT JOIN courses c ON n.course_id = c.id
		LEFT JOIN users u ON n.seller_id = u.id
		WHERE n.id = $1
	`

	var note NoteResponse
	var pdfFile string
	var courseID, sellerID sql.NullInt64
	var courseCode, courseName, courseYear, courseMajor sql.NullString
	var sellerUsername, sellerFullname sql.NullString
	var examTerm sql.NullString

	err := config.DB.QueryRow(query, noteID).Scan(
		&note.ID, &note.BookTitle, &note.Price, &examTerm, &note.Description, &note.Status, &note.CreatedAt, &pdfFile,
		&courseID, &courseCode, &courseName, &courseYear, &courseMajor,
		&sellerID, &sellerUsername, &sellerFullname,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Note not found",
		})
		return
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}

	// กำหนดค่า exam_term
	if examTerm.Valid {
		note.ExamTerm = examTerm.String
	}

	// กำหนดค่า course
	if courseID.Valid {
		note.Course = Course{
			ID:    int(courseID.Int64),
			Code:  courseCode.String,
			Name:  courseName.String,
			Year:  courseYear.String,
			Major: courseMajor.String,
		}
	}

	// กำหนดค่า seller
	if sellerID.Valid {
		note.Seller = Seller{
			ID:       int(sellerID.Int64),
			Username: sellerUsername.String,
			Fullname: sellerFullname.String,
		}
	}

	// ดึงรูปภาพ
	imageQuery := `
		SELECT path FROM note_images 
		WHERE note_id = $1 
		ORDER BY image_order ASC
	`
	imageRows, err := config.DB.Query(imageQuery, note.ID)
	if err == nil {
		images := []string{}
		for imageRows.Next() {
			var path string
			if err := imageRows.Scan(&path); err == nil {
				images = append(images, path)
			}
		}
		imageRows.Close()

		note.Images = images
		if len(images) > 0 {
			note.CoverImage = images[0]
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"data": note,
	})
}

// GetNotesByUserID - ดึงข้อมูล notes ทั้งหมดของ user คนใดคนหนึ่ง
func GetNotesByUserID(c *gin.Context) {
	userID := c.Param("id")

	query := `
		SELECT 
			n.id, n.book_title, n.price, n.exam_term, n.description, n.status, n.created_at,
			c.id, c.code, c.name, c.year, c.major,
			u.id, u.username, u.fullname
		FROM notes_for_sale n
		LEFT JOIN courses c ON n.course_id = c.id
		LEFT JOIN users u ON n.seller_id = u.id
		WHERE n.seller_id = $1
		ORDER BY n.created_at DESC
	`

	rows, err := config.DB.Query(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}
	defer rows.Close()

	notes := []NoteResponse{}

	for rows.Next() {
		var note NoteResponse
		var courseID, sellerID sql.NullInt64
		var courseCode, courseName, courseYear, courseMajor sql.NullString
		var sellerUsername, sellerFullname sql.NullString
		var examTerm sql.NullString

		err := rows.Scan(
			&note.ID, &note.BookTitle, &note.Price, &examTerm, &note.Description, &note.Status, &note.CreatedAt,
			&courseID, &courseCode, &courseName, &courseYear, &courseMajor,
			&sellerID, &sellerUsername, &sellerFullname,
		)
		if err != nil {
			continue
		}

		// กำหนดค่า exam_term
		if examTerm.Valid {
			note.ExamTerm = examTerm.String
		}

		// กำหนดค่า course
		if courseID.Valid {
			note.Course = Course{
				ID:    int(courseID.Int64),
				Code:  courseCode.String,
				Name:  courseName.String,
				Year:  courseYear.String,
				Major: courseMajor.String,
			}
		}

		// กำหนดค่า seller
		if sellerID.Valid {
			note.Seller = Seller{
				ID:       int(sellerID.Int64),
				Username: sellerUsername.String,
				Fullname: sellerFullname.String,
			}
		}

		// ดึงรูปภาพ
		imageQuery := `
			SELECT path FROM note_images 
			WHERE note_id = $1 
			ORDER BY image_order ASC
		`
		imageRows, err := config.DB.Query(imageQuery, note.ID)
		if err == nil {
			images := []string{}
			for imageRows.Next() {
				var path string
				if err := imageRows.Scan(&path); err == nil {
					images = append(images, path)
				}
			}
			imageRows.Close()

			note.Images = images
			if len(images) > 0 {
				note.CoverImage = images[0]
			}
		}

		notes = append(notes, note)
	}

	// ถ้าไม่มีข้อมูล ส่ง array ว่าง
	if notes == nil {
		notes = []NoteResponse{}
	}

	c.JSON(http.StatusOK, notes)
}

// GetBestSellingNotes - ดึงหนังสือขายดี (เรียงตามจำนวนการซื้อ)
func GetBestSellingNotes(c *gin.Context) {
	query := `
		SELECT 
			n.id, n.book_title, n.price, n.exam_term, n.description, n.status, n.created_at,
			c.id, c.code, c.name, c.year, c.major,
			u.id, u.username, u.fullname,
			COUNT(b.id) as sold_count
		FROM notes_for_sale n
		LEFT JOIN courses c ON n.course_id = c.id
		LEFT JOIN users u ON n.seller_id = u.id
		LEFT JOIN buyed_note b ON n.id = b.note_id
		WHERE n.status = 'available'
		GROUP BY n.id, c.id, u.id
		HAVING COUNT(b.id) > 0
		ORDER BY sold_count DESC, n.created_at DESC
		LIMIT 5
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}
	defer rows.Close()

	notes := []map[string]interface{}{}

	for rows.Next() {
		var note NoteResponse
		var courseID, sellerID sql.NullInt64
		var courseCode, courseName, courseYear, courseMajor sql.NullString
		var sellerUsername, sellerFullname sql.NullString
		var examTerm sql.NullString
		var soldCount int

		err := rows.Scan(
			&note.ID, &note.BookTitle, &note.Price, &examTerm, &note.Description, &note.Status, &note.CreatedAt,
			&courseID, &courseCode, &courseName, &courseYear, &courseMajor,
			&sellerID, &sellerUsername, &sellerFullname,
			&soldCount,
		)
		if err != nil {
			continue
		}

		// กำหนดค่า exam_term
		if examTerm.Valid {
			note.ExamTerm = examTerm.String
		}

		// กำหนดค่า course
		if courseID.Valid {
			note.Course = Course{
				ID:    int(courseID.Int64),
				Code:  courseCode.String,
				Name:  courseName.String,
				Year:  courseYear.String,
				Major: courseMajor.String,
			}
		}

		// กำหนดค่า seller
		if sellerID.Valid {
			note.Seller = Seller{
				ID:       int(sellerID.Int64),
				Username: sellerUsername.String,
				Fullname: sellerFullname.String,
			}
		}

		// ดึงรูปภาพ
		imageQuery := `
			SELECT path FROM note_images 
			WHERE note_id = $1 
			ORDER BY image_order ASC
		`
		imageRows, err := config.DB.Query(imageQuery, note.ID)
		if err == nil {
			images := []string{}
			for imageRows.Next() {
				var path string
				if err := imageRows.Scan(&path); err == nil {
					images = append(images, path)
				}
			}
			imageRows.Close()

			note.Images = images
			if len(images) > 0 {
				note.CoverImage = images[0]
			}
		}

		noteMap := map[string]interface{}{
			"id":          note.ID,
			"book_title":  note.BookTitle,
			"price":       note.Price,
			"exam_term":   note.ExamTerm,
			"description": note.Description,
			"status":      note.Status,
			"created_at":  note.CreatedAt,
			"cover_image": note.CoverImage,
			"images":      note.Images,
			"course":      note.Course,
			"seller":      note.Seller,
			"sold_count":  soldCount,
		}

		notes = append(notes, noteMap)
	}

	if notes == nil {
		notes = []map[string]interface{}{}
	}

	c.JSON(http.StatusOK, notes)
}

// GetLatestNotes - ดึงหนังสือมาใหม่ล่าสุด
func GetLatestNotes(c *gin.Context) {
	query := `
		SELECT 
			n.id, n.book_title, n.price, n.exam_term, n.description, n.status, n.created_at,
			c.id, c.code, c.name, c.year, c.major,
			u.id, u.username, u.fullname
		FROM notes_for_sale n
		LEFT JOIN courses c ON n.course_id = c.id
		LEFT JOIN users u ON n.seller_id = u.id
		WHERE n.status = 'available'
		ORDER BY n.created_at DESC
		LIMIT 5
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}
	defer rows.Close()

	notes := []NoteResponse{}

	for rows.Next() {
		var note NoteResponse
		var courseID, sellerID sql.NullInt64
		var courseCode, courseName, courseYear, courseMajor sql.NullString
		var sellerUsername, sellerFullname sql.NullString
		var examTerm sql.NullString

		err := rows.Scan(
			&note.ID, &note.BookTitle, &note.Price, &examTerm, &note.Description, &note.Status, &note.CreatedAt,
			&courseID, &courseCode, &courseName, &courseYear, &courseMajor,
			&sellerID, &sellerUsername, &sellerFullname,
		)
		if err != nil {
			continue
		}

		// กำหนดค่า exam_term
		if examTerm.Valid {
			note.ExamTerm = examTerm.String
		}

		// กำหนดค่า course
		if courseID.Valid {
			note.Course = Course{
				ID:    int(courseID.Int64),
				Code:  courseCode.String,
				Name:  courseName.String,
				Year:  courseYear.String,
				Major: courseMajor.String,
			}
		}

		// กำหนดค่า seller
		if sellerID.Valid {
			note.Seller = Seller{
				ID:       int(sellerID.Int64),
				Username: sellerUsername.String,
				Fullname: sellerFullname.String,
			}
		}

		// ดึงรูปภาพ
		imageQuery := `
			SELECT path FROM note_images 
			WHERE note_id = $1 
			ORDER BY image_order ASC
		`
		imageRows, err := config.DB.Query(imageQuery, note.ID)
		if err == nil {
			images := []string{}
			for imageRows.Next() {
				var path string
				if err := imageRows.Scan(&path); err == nil {
					images = append(images, path)
				}
			}
			imageRows.Close()

			note.Images = images
			if len(images) > 0 {
				note.CoverImage = images[0]
			}
		}

		notes = append(notes, note)
	}

	if notes == nil {
		notes = []NoteResponse{}
	}

	c.JSON(http.StatusOK, notes)
}
