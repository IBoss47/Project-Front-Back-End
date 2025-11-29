package handlers

import (
	"back-end/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

// PurchaseRequest represents the purchase request payload
type PurchaseRequest struct {
	NoteIDs []int `json:"note_ids" binding:"required"`
}

// PurchaseNotes - สร้างรายการซื้อหนังสือ
func PurchaseNotes(c *gin.Context) {
	// ดึง user_id จาก JWT token
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	var req PurchaseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	if len(req.NoteIDs) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Note IDs are required",
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

	// Insert ข้อมูลลง buyed_note สำหรับแต่ละ note
	insertQuery := `
		INSERT INTO buyed_note (user_id, note_id, review, is_liked)
		VALUES ($1, $2, '', NULL)
		ON CONFLICT DO NOTHING
	`

	purchasedCount := 0
	for _, noteID := range req.NoteIDs {
		result, err := tx.Exec(insertQuery, userID, noteID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to create purchase record",
				"details": err.Error(),
			})
			return
		}

		rowsAffected, _ := result.RowsAffected()
		purchasedCount += int(rowsAffected)
	}

	// ลบสินค้าออกจากตะกร้า
	for _, noteID := range req.NoteIDs {
		deleteCartQuery := `DELETE FROM cart WHERE user_id = $1 AND note_id = $2`
		_, err = tx.Exec(deleteCartQuery, userID, noteID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to clear cart",
				"details": err.Error(),
			})
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to complete purchase",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":         true,
		"message":         "Purchase completed successfully",
		"purchased_count": purchasedCount,
		"note_ids":        req.NoteIDs,
	})
}
