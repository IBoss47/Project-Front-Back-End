package handlers

import (
	"back-end/config"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// DownloadNoteForAdmin godoc
// @Summary Download note PDF (Admin)
// @Description Admin can download any note's PDF file
// @Tags admin
// @Accept json
// @Produce application/pdf
// @Security BearerAuth
// @Param id path int true "Note ID"
// @Success 200 {file} binary "PDF file"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Note not found"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/admin/notes/{id}/download [get]
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
