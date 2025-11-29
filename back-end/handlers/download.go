package handlers

import (
	"back-end/config"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// DownloadPurchasedNote godoc
// @Summary Download purchased note PDF
// @Description Download the PDF file of a purchased note
// @Tags download
// @Accept json
// @Produce application/pdf
// @Security BearerAuth
// @Param id path int true "Note ID"
// @Success 200 {file} binary "PDF file"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 403 {object} map[string]string "Not purchased"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/download/{id} [get]
func DownloadPurchasedNote(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	noteID := c.Param("id")

	// ตรวจสอบว่า user ซื้อ note นี้แล้วหรือไม่
	var pdfPath string
	var bookTitle string
	query := `
		SELECT n.pdf_file, n.book_title
		FROM buyed_note bn
		JOIN notes_for_sale n ON bn.note_id = n.id
		WHERE bn.user_id = $1 AND bn.note_id = $2
	`
	err := config.DB.QueryRow(query, userID, noteID).Scan(&pdfPath, &bookTitle)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You have not purchased this note",
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
