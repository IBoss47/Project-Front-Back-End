package handlers

import (
	"back-end/config"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// PurchaseHistoryResponse - โครงสร้างข้อมูลประวัติการซื้อ
type PurchaseHistoryResponse struct {
	ID          int      `json:"id"`
	NoteID      int      `json:"note_id"`
	BookTitle   string   `json:"book_title"`
	Price       float64  `json:"price"`
	ExamTerm    string   `json:"exam_term"`
	Description string   `json:"description"`
	CoverImage  string   `json:"cover_image"`
	Images      []string `json:"images"`
	Course      Course   `json:"course"`
	Seller      Seller   `json:"seller"`
	Review      string   `json:"review"`
	IsLiked     *bool    `json:"is_liked"`
}

// GetMyPurchaseHistory - ดึงประวัติการซื้อของ user ที่ login อยู่
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
			n.id, n.book_title, n.price, n.exam_term, n.description,
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
		var examTerm, review sql.NullString
		var isLiked sql.NullBool

		err := rows.Scan(
			&purchase.ID, &review, &isLiked,
			&purchase.NoteID, &purchase.BookTitle, &purchase.Price, &examTerm, &purchase.Description,
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

		// ดึงรูปภาพ
		imageQuery := `
			SELECT path FROM note_images 
			WHERE note_id = $1 
			ORDER BY image_order ASC
		`
		imageRows, err := config.DB.Query(imageQuery, purchase.NoteID)
		if err == nil {
			images := []string{}
			for imageRows.Next() {
				var path string
				if err := imageRows.Scan(&path); err == nil {
					images = append(images, path)
				}
			}
			imageRows.Close()

			purchase.Images = images
			if len(images) > 0 {
				purchase.CoverImage = images[0]
			}
		}

		purchases = append(purchases, purchase)
	}

	// ถ้าไม่มีข้อมูล ส่ง array ว่าง
	if purchases == nil {
		purchases = []PurchaseHistoryResponse{}
	}

	c.JSON(http.StatusOK, purchases)
}
