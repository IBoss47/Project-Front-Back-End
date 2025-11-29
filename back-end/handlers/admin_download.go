package handlers

import (
	"back-end/config"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// DownloadNoteForAdmin - Admin สามารถดาวน์โหลด PDF ของ note ใดๆ ได้
func DownloadNoteForAdmin(c *gin.Context) {
	noteID := c.Param("id")

	// ดึงข้อมูล PDF path และชื่อหนังสือ
	var pdfPath string
	var bookTitle string
	query := `
		SELECT pdf_file, book_title
		FROM notes_for_sale
		WHERE id = $1
	`
	err := config.DB.QueryRow(query, noteID).Scan(&pdfPath, &bookTitle)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Note not found",
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		return
	}

	// ตั้งค่า headers สำหรับการดาวน์โหลด
	c.Header("Content-Description", "File Transfer")
	c.Header("Content-Transfer-Encoding", "binary")
	c.Header("Content-Disposition", "attachment; filename="+bookTitle+".pdf")
	c.Header("Content-Type", "application/pdf")

	// ส่งไฟล์
	c.File(pdfPath)
}
