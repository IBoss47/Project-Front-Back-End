package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"back-end/config"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// GetSliderImages godoc
// @Summary Get slider images
// @Description Get all slider images ordered by display order
// @Tags slider
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "List of slider images"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/slider [get]
func GetSliderImages(c *gin.Context) {
	rows, err := config.DB.Query(`
		SELECT id, image_path, display_order, link_url
		FROM slider_images
		ORDER BY display_order ASC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch slider images",
			"error":   err.Error(),
		})
		return
	}
	defer rows.Close()

	type SliderImage struct {
		ID           int            `json:"id"`
		ImagePath    string         `json:"image_path"`
		DisplayOrder int            `json:"display_order"`
		LinkURL      sql.NullString `json:"link_url"`
	}

	var images []SliderImage
	for rows.Next() {
		var img SliderImage
		if err := rows.Scan(&img.ID, &img.ImagePath, &img.DisplayOrder, &img.LinkURL); err != nil {
			continue
		}
		images = append(images, img)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    images,
	})
}

// UploadSliderImage godoc
// @Summary Upload slider image
// @Description Upload a new image for the homepage slider (Admin only)
// @Tags slider
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param image formData file true "Image file (jpg, jpeg, png, gif, webp)"
// @Param link_url formData string false "Link URL for navigation"
// @Success 200 {object} map[string]interface{} "Upload successful with image info"
// @Failure 400 {object} map[string]string "Invalid file"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Server error"
// @Router /api/admin/slider [post]
func UploadSliderImage(c *gin.Context) {
	// รับไฟล์จาก form
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "No image file provided",
			"error":   err.Error(),
		})
		return
	}

	// รับ link_url จาก form (optional)
	linkURL := c.PostForm("link_url")

	// ตรวจสอบประเภทไฟล์
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".gif": true, ".webp": true}
	if !allowedExts[ext] {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid file type. Only jpg, jpeg, png, gif, webp allowed",
		})
		return
	}

	// สร้างชื่อไฟล์ unique
	uniqueFilename := fmt.Sprintf("slider_%s%s", uuid.New().String(), ext)
	uploadDir := "./uploads/images"
	
	// สร้างโฟลเดอร์ถ้ายังไม่มี
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to create upload directory",
			"error":   err.Error(),
		})
		return
	}

	filePath := filepath.Join(uploadDir, uniqueFilename)

	// บันทึกไฟล์
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to save image file",
			"error":   err.Error(),
		})
		return
	}

	// หา display_order ล่าสุด
	var maxOrder sql.NullInt64
	err = config.DB.QueryRow("SELECT MAX(display_order) FROM slider_images").Scan(&maxOrder)
	if err != nil && err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to get max order",
			"error":   err.Error(),
		})
		return
	}

	nextOrder := 0
	if maxOrder.Valid {
		nextOrder = int(maxOrder.Int64) + 1
	}

	// บันทึกข้อมูลลงฐานข้อมูล
	var imageID int
	var query string
	var args []interface{}

	if linkURL != "" {
		query = `
			INSERT INTO slider_images (image_path, display_order, link_url)
			VALUES ($1, $2, $3)
			RETURNING id
		`
		args = []interface{}{filePath, nextOrder, linkURL}
	} else {
		query = `
			INSERT INTO slider_images (image_path, display_order)
			VALUES ($1, $2)
			RETURNING id
		`
		args = []interface{}{filePath, nextOrder}
	}

	err = config.DB.QueryRow(query, args...).Scan(&imageID)

	if err != nil {
		// ลบไฟล์ถ้าบันทึก DB ไม่สำเร็จ
		os.Remove(filePath)
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to save image info to database",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Image uploaded successfully",
		"data": gin.H{
			"id":            imageID,
			"image_path":    filePath,
			"display_order": nextOrder,
			"link_url":      linkURL,
		},
	})
}

// UpdateSliderOrder godoc
// @Summary Update slider order
// @Description Update the display order of slider images (Admin only)
// @Tags slider
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body []object{id=int,order=int} true "Array of id and order pairs"
// @Success 200 {object} map[string]interface{} "Order updated successfully"
// @Failure 400 {object} map[string]string "Invalid request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/admin/slider/order [put]
func UpdateSliderOrder(c *gin.Context) {
	type OrderUpdate struct {
		ID      int     `json:"id"`
		Order   int     `json:"order"`
		LinkURL *string `json:"link_url,omitempty"`
	}

	var updates []OrderUpdate
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	
	// Validate that we have data
	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "No order updates provided",
		})
		return
	}

	// เริ่ม transaction
	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to start transaction",
			"error":   err.Error(),
		})
		return
	}

	// อัปเดตลำดับแต่ละรายการ
	for _, update := range updates {
		var err error
		if update.LinkURL != nil {
			// Update both order and link
			_, err = tx.Exec(`
				UPDATE slider_images 
				SET display_order = $1, link_url = $2
				WHERE id = $3
			`, update.Order, *update.LinkURL, update.ID)
		} else {
			// Update only order
			_, err = tx.Exec(`
				UPDATE slider_images 
				SET display_order = $1
				WHERE id = $2
			`, update.Order, update.ID)
		}
		
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Failed to update order",
				"error":   err.Error(),
			})
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to commit transaction",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Slider order updated successfully",
	})
}

// DeleteSliderImage godoc
// @Summary Delete slider image
// @Description Delete a slider image by ID (Admin only)
// @Tags slider
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Slider image ID"
// @Success 200 {object} map[string]interface{} "Image deleted successfully"
// @Failure 400 {object} map[string]string "Invalid image ID"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Image not found"
// @Failure 500 {object} map[string]string "Server error"
// @Router /api/admin/slider/{id} [delete]
func DeleteSliderImage(c *gin.Context) {
	idStr := c.Param("id")
	imageID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "Invalid image ID",
		})
		return
	}

	// ดึงข้อมูลรูปเพื่อลบไฟล์
	var imagePath string
	err = config.DB.QueryRow("SELECT image_path FROM slider_images WHERE id = $1", imageID).Scan(&imagePath)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"message": "Image not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to fetch image info",
			"error":   err.Error(),
		})
		return
	}

	// ลบข้อมูลจากฐานข้อมูล
	_, err = config.DB.Exec("DELETE FROM slider_images WHERE id = $1", imageID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Failed to delete image from database",
			"error":   err.Error(),
		})
		return
	}

	// ลบไฟล์จริง
	if err := os.Remove(imagePath); err != nil {
		// ไม่ return error ถ้าลบไฟล์ไม่สำเร็จ (อาจถูกลบไปแล้ว)
		fmt.Printf("Warning: Failed to delete image file: %v\n", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Image deleted successfully",
	})
}


