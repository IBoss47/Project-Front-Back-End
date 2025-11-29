package handlers

import (
	"back-end/config"
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Review - โครงสร้างข้อมูลรีวิว
type Review struct {
	ID            int            `json:"id"`
	BuyerID       int            `json:"buyer_id"`
	BuyerName     string         `json:"buyer_name"`
	BuyerAvatar   sql.NullString `json:"buyer_avatar"`
	NoteID        int            `json:"note_id"`
	NoteTitle     string         `json:"note_title"`
	CourseCode    sql.NullString `json:"course_code"`
	CourseName    sql.NullString `json:"course_name"`
	Review        string         `json:"review"`
	IsLiked       sql.NullBool   `json:"is_liked"`
	CreatedAt     string         `json:"created_at"`
}

// ReviewStats - สถิติรีวิว
type ReviewStats struct {
	TotalReviews    int     `json:"total_reviews"`
	LikedCount      int     `json:"liked_count"`
	DislikedCount   int     `json:"disliked_count"`
	LikedPercent    float64 `json:"liked_percent"`
	DislikedPercent float64 `json:"disliked_percent"`
}

// GetSellerReviews godoc
// @Summary ดึงรีวิวของ seller
// @Description ดึงรายการรีวิวทั้งหมดของสินค้าที่ seller คนนั้นขาย
// @Tags reviews
// @Accept json
// @Produce json
// @Param id path int true "Seller ID"
// @Success 200 {array} Review "รายการรีวิว"
// @Failure 400 {object} map[string]string "Invalid seller ID"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/sellers/{id}/reviews [get]
func GetSellerReviews(c *gin.Context) {
	sellerIDStr := c.Param("id")
	sellerID, err := strconv.Atoi(sellerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid seller ID"})
		return
	}

	query := `
		SELECT 
			bn.id,
			bn.user_id as buyer_id,
			u.username as buyer_name,
			u.avatar_url as buyer_avatar,
			bn.note_id,
			nfs.book_title as note_title,
			c.code as course_code,
			c.name as course_name,
			bn.review,
			bn.is_liked,
			TO_CHAR(nfs.created_at, 'DD/MM/YYYY HH24:MI') as created_at
		FROM buyed_note bn
		INNER JOIN users u ON bn.user_id = u.id
		INNER JOIN notes_for_sale nfs ON bn.note_id = nfs.id
		LEFT JOIN courses c ON nfs.course_id = c.id
		WHERE nfs.seller_id = $1
		AND bn.review IS NOT NULL
		AND bn.review != ''
		ORDER BY nfs.created_at DESC
	`

	rows, err := config.DB.Query(query, sellerID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}
	defer rows.Close()

	var reviews []map[string]interface{}
	for rows.Next() {
		var review Review
		err := rows.Scan(
			&review.ID,
			&review.BuyerID,
			&review.BuyerName,
			&review.BuyerAvatar,
			&review.NoteID,
			&review.NoteTitle,
			&review.CourseCode,
			&review.CourseName,
			&review.Review,
			&review.IsLiked,
			&review.CreatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Error scanning review",
				"message": err.Error(),
			})
			return
		}

		// แปลงข้อมูลเป็น map เพื่อจัดการ NULL values
		reviewMap := map[string]interface{}{
			"id":         review.ID,
			"buyer_id":   review.BuyerID,
			"buyer_name": review.BuyerName,
			"note_id":    review.NoteID,
			"note_title": review.NoteTitle,
			"review":     review.Review,
			"created_at": review.CreatedAt,
		}

		if review.BuyerAvatar.Valid {
			reviewMap["buyer_avatar"] = review.BuyerAvatar.String
		} else {
			reviewMap["buyer_avatar"] = ""
		}

		if review.CourseCode.Valid {
			reviewMap["course_code"] = review.CourseCode.String
		} else {
			reviewMap["course_code"] = ""
		}

		if review.CourseName.Valid {
			reviewMap["course_name"] = review.CourseName.String
		} else {
			reviewMap["course_name"] = ""
		}

		if review.IsLiked.Valid {
			reviewMap["is_liked"] = review.IsLiked.Bool
		} else {
			reviewMap["is_liked"] = nil
		}

		reviews = append(reviews, reviewMap)
	}

	if reviews == nil {
		reviews = []map[string]interface{}{}
	}

	c.JSON(http.StatusOK, gin.H{"reviews": reviews})
}

// GetSellerReviewStats godoc
// @Summary ดึงสถิติรีวิวของ seller
// @Description ดึงสถิติรีวิว (ชอบ/ไม่ชอบ) ของสินค้าที่ seller คนนั้นขาย
// @Tags reviews
// @Accept json
// @Produce json
// @Param id path int true "Seller ID"
// @Success 200 {object} ReviewStats "สถิติรีวิว"
// @Failure 400 {object} map[string]string "Invalid seller ID"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/sellers/{id}/reviews/stats [get]
func GetSellerReviewStats(c *gin.Context) {
	sellerIDStr := c.Param("id")
	sellerID, err := strconv.Atoi(sellerIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid seller ID"})
		return
	}

	query := `
		SELECT 
			COUNT(*) as total_reviews,
			COUNT(CASE WHEN bn.is_liked = true THEN 1 END) as liked_count,
			COUNT(CASE WHEN bn.is_liked = false THEN 1 END) as disliked_count
		FROM buyed_note bn
		INNER JOIN notes_for_sale nfs ON bn.note_id = nfs.id
		WHERE nfs.seller_id = $1
		AND bn.review IS NOT NULL
		AND bn.review != ''
	`

	var stats ReviewStats
	err = config.DB.QueryRow(query, sellerID).Scan(
		&stats.TotalReviews,
		&stats.LikedCount,
		&stats.DislikedCount,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}

	// คำนวณเปอร์เซ็นต์
	if stats.TotalReviews > 0 {
		stats.LikedPercent = (float64(stats.LikedCount) / float64(stats.TotalReviews)) * 100
		stats.DislikedPercent = (float64(stats.DislikedCount) / float64(stats.TotalReviews)) * 100
	}

	c.JSON(http.StatusOK, stats)
}

// GetNoteReviews godoc
// @Summary ดึงรีวิวของหนังสือ/โน้ต
// @Description ดึงรายการรีวิวทั้งหมดของหนังสือ/โน้ตเล่มนั้น
// @Tags reviews
// @Accept json
// @Produce json
// @Param id path int true "Note ID"
// @Success 200 {array} Review "รายการรีวิว"
// @Failure 400 {object} map[string]string "Invalid note ID"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/notes/{id}/reviews [get]
func GetNoteReviews(c *gin.Context) {
	noteIDStr := c.Param("id")
	noteID, err := strconv.Atoi(noteIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid note ID"})
		return
	}

	query := `
		SELECT 
			bn.id,
			bn.user_id as buyer_id,
			u.username as buyer_name,
			u.avatar_url as buyer_avatar,
			bn.note_id,
			nfs.book_title as note_title,
			c.code as course_code,
			c.name as course_name,
			bn.review,
			bn.is_liked,
			TO_CHAR(nfs.created_at, 'DD/MM/YYYY HH24:MI') as created_at
		FROM buyed_note bn
		INNER JOIN users u ON bn.user_id = u.id
		INNER JOIN notes_for_sale nfs ON bn.note_id = nfs.id
		LEFT JOIN courses c ON nfs.course_id = c.id
		WHERE bn.note_id = $1
		AND bn.review IS NOT NULL
		AND bn.review != ''
		ORDER BY nfs.created_at DESC
	`

	rows, err := config.DB.Query(query, noteID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}
	defer rows.Close()

	var reviews []map[string]interface{}
	for rows.Next() {
		var review Review
		err := rows.Scan(
			&review.ID,
			&review.BuyerID,
			&review.BuyerName,
			&review.BuyerAvatar,
			&review.NoteID,
			&review.NoteTitle,
			&review.CourseCode,
			&review.CourseName,
			&review.Review,
			&review.IsLiked,
			&review.CreatedAt,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Error scanning review",
				"message": err.Error(),
			})
			return
		}

		// แปลงข้อมูลเป็น map เพื่อจัดการ NULL values
		reviewMap := map[string]interface{}{
			"id":         review.ID,
			"buyer_id":   review.BuyerID,
			"buyer_name": review.BuyerName,
			"note_id":    review.NoteID,
			"note_title": review.NoteTitle,
			"review":     review.Review,
			"created_at": review.CreatedAt,
		}

		if review.BuyerAvatar.Valid {
			reviewMap["buyer_avatar"] = review.BuyerAvatar.String
		} else {
			reviewMap["buyer_avatar"] = ""
		}

		if review.CourseCode.Valid {
			reviewMap["course_code"] = review.CourseCode.String
		} else {
			reviewMap["course_code"] = ""
		}

		if review.CourseName.Valid {
			reviewMap["course_name"] = review.CourseName.String
		} else {
			reviewMap["course_name"] = ""
		}

		if review.IsLiked.Valid {
			reviewMap["is_liked"] = review.IsLiked.Bool
		} else {
			reviewMap["is_liked"] = nil
		}

		reviews = append(reviews, reviewMap)
	}

	if reviews == nil {
		reviews = []map[string]interface{}{}
	}

	c.JSON(http.StatusOK, gin.H{"reviews": reviews})
}

// GetNoteReviewStats godoc
// @Summary ดึงสถิติรีวิวของหนังสือ/โน้ต
// @Description ดึงสถิติรีวิว (ชอบ/ไม่ชอบ) ของหนังสือ/โน้ตเล่มนั้น
// @Tags reviews
// @Accept json
// @Produce json
// @Param id path int true "Note ID"
// @Success 200 {object} ReviewStats "สถิติรีวิว"
// @Failure 400 {object} map[string]string "Invalid note ID"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/notes/{id}/reviews/stats [get]
func GetNoteReviewStats(c *gin.Context) {
	noteIDStr := c.Param("id")
	noteID, err := strconv.Atoi(noteIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid note ID"})
		return
	}

	query := `
		SELECT 
			COUNT(*) as total_reviews,
			COUNT(CASE WHEN bn.is_liked = true THEN 1 END) as liked_count,
			COUNT(CASE WHEN bn.is_liked = false THEN 1 END) as disliked_count
		FROM buyed_note bn
		WHERE bn.note_id = $1
		AND bn.review IS NOT NULL
		AND bn.review != ''
	`

	var stats ReviewStats
	err = config.DB.QueryRow(query, noteID).Scan(
		&stats.TotalReviews,
		&stats.LikedCount,
		&stats.DislikedCount,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}

	// คำนวณเปอร์เซ็นต์
	if stats.TotalReviews > 0 {
		stats.LikedPercent = (float64(stats.LikedCount) / float64(stats.TotalReviews)) * 100
		stats.DislikedPercent = (float64(stats.DislikedCount) / float64(stats.TotalReviews)) * 100
	}

	c.JSON(http.StatusOK, stats)
}
