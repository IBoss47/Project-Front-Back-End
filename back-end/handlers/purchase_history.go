package handlers

import (
	"back-end/config"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// PurchaseHistoryResponse - โครงสร้างข้อมูลประวัติการซื้อ
type PurchaseHistoryResponse struct {
	BuyedNoteID int      `json:"buyed_note_id"`
	NoteID      int      `json:"note_id"`
	BookTitle   string   `json:"book_title"`
	Price       float64  `json:"price"`
	ExamTerm    string   `json:"exam_term"`
	Description string   `json:"description"`
	PDFFile     string   `json:"pdf_file"`
	CoverImage  string   `json:"cover_image"`
	Images      []string `json:"images"`
	Course      Course   `json:"course"`
	Seller      Seller   `json:"seller"`
	Review      string   `json:"review"`
	IsLiked     *bool    `json:"is_liked"`
}

// GetMyPurchaseHistory godoc
// @Summary Get purchase history
// @Description Get the purchase history of the currently authenticated user
// @Tags purchase
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} PurchaseHistoryResponse "List of purchased notes"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/purchase-history [get]
func GetMyPurchaseHistory(c *gin.Context) {
	// ดึง user_id จาก middleware
	v, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := v.(int)

	query := `
		SELECT 
			bn.id, bn.review, bn.is_liked,
			n.id, n.book_title, n.price, n.exam_term, n.description, n.pdf_file,
			c.id, c.code, c.name, c.year, c.major,
			u.id, u.username, u.fullname
		FROM buyed_note bn
		INNER JOIN notes_for_sale n ON bn.note_id = n.id
		LEFT JOIN courses c ON n.course_id = c.id
		LEFT JOIN users u ON n.seller_id = u.id
		WHERE bn.user_id = $1
		ORDER BY bn.id DESC
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

	purchases := []PurchaseHistoryResponse{}

	for rows.Next() {
		var purchase PurchaseHistoryResponse
		var courseID, sellerID sql.NullInt64
		var courseCode, courseName, courseYear, courseMajor sql.NullString
		var sellerUsername, sellerFullname sql.NullString
		var examTerm, description, review sql.NullString
		var isLiked sql.NullBool

		err := rows.Scan(
			&purchase.BuyedNoteID, &review, &isLiked,
			&purchase.NoteID, &purchase.BookTitle, &purchase.Price, &examTerm, &description, &purchase.PDFFile,
			&courseID, &courseCode, &courseName, &courseYear, &courseMajor,
			&sellerID, &sellerUsername, &sellerFullname,
		)
		if err != nil {
			continue
		}

		// กำหนดค่า review
		if review.Valid {
			purchase.Review = review.String
		}

		// กำหนดค่า is_liked
		if isLiked.Valid {
			liked := isLiked.Bool
			purchase.IsLiked = &liked
		}

		// กำหนดค่า exam_term
		if examTerm.Valid {
			purchase.ExamTerm = examTerm.String
		}

		// กำหนดค่า description
		if description.Valid {
			purchase.Description = description.String
		}

		// กำหนดค่า course
		if courseID.Valid {
			purchase.Course = Course{
				ID:    int(courseID.Int64),
				Code:  courseCode.String,
				Name:  courseName.String,
				Year:  courseYear.String,
				Major: courseMajor.String,
			}
		}

		// กำหนดค่า seller
		if sellerID.Valid {
			purchase.Seller = Seller{
				ID:       int(sellerID.Int64),
				Username: sellerUsername.String,
				Fullname: sellerFullname.String,
			}
		}

		// ดึงรูปปกเท่านั้น (รูปแรก)
		imageQuery := `
			SELECT path FROM note_images 
			WHERE note_id = $1 
			ORDER BY image_order ASC
			LIMIT 1
		`
		var coverImage string
		if err := config.DB.QueryRow(imageQuery, purchase.NoteID).Scan(&coverImage); err == nil {
			purchase.CoverImage = coverImage
			purchase.Images = []string{coverImage}
		}

		purchases = append(purchases, purchase)
	}

	c.JSON(http.StatusOK, purchases)
}

// UpdatePurchaseReviewRequest represents the review update request
type UpdatePurchaseReviewRequest struct {
	Review  string `json:"review" binding:"required"`
	IsLiked bool   `json:"is_liked"`
}

// UpdatePurchaseReview - อัพเดทรีวิวและการกดใจ
func UpdatePurchaseReview(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	buyedNoteID := c.Param("id")

	var req UpdatePurchaseReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format",
		})
		return
	}

	// ตรวจสอบว่า buyed_note นี้เป็นของ user นี้หรือไม่
	var existingReview string
	var existingLiked sql.NullBool
	checkQuery := `
		SELECT review, is_liked 
		FROM buyed_note 
		WHERE id = $1 AND user_id = $2
	`
	err := config.DB.QueryRow(checkQuery, buyedNoteID, userID).Scan(&existingReview, &existingLiked)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Purchase not found",
		})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Database error",
		})
		return
	}

	// ถ้ามี review หรือ is_liked แล้ว ห้ามแก้ไข
	if existingReview != "" || existingLiked.Valid {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Review already submitted and cannot be modified",
		})
		return
	}

	// อัพเดท review และ is_liked
	updateQuery := `
		UPDATE buyed_note 
		SET review = $1, is_liked = $2
		WHERE id = $3 AND user_id = $4
	`
	_, err = config.DB.Exec(updateQuery, req.Review, req.IsLiked, buyedNoteID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update review",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Review updated successfully",
	})
}
