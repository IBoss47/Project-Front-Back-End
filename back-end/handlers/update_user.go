package handlers

import (
	"back-end/config"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// UpdateUserRequest - ข้อมูลสำหรับอัปเดตโปรไฟล์
type UpdateUserRequest struct {
	Username string `json:"username"`
	FullName string `json:"fullname"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
}

// UpdateUserProfile godoc
// @Summary อัปเดตข้อมูลโปรไฟล์ผู้ใช้
// @Description อัปเดตข้อมูลส่วนตัวของผู้ใช้ที่ล็อกอินอยู่
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body UpdateUserRequest true "ข้อมูลที่ต้องการอัปเดต"
// @Success 200 {object} map[string]interface{} "อัปเดตสำเร็จ"
// @Failure 400 {object} map[string]string "ข้อมูลไม่ถูกต้อง"
// @Failure 401 {object} map[string]string "ไม่ได้เข้าสู่ระบบ"
// @Failure 409 {object} map[string]string "Username หรือ Email ซ้ำ"
// @Failure 500 {object} map[string]string "เกิดข้อผิดพลาด"
// @Router /api/update-profile [put]
func UpdateUserProfile(c *gin.Context) {
	// ตรวจสอบว่า user ได้ login หรือไม่
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDInterface.(int)

	// รับข้อมูลจาก request
	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"message": err.Error(),
		})
		return
	}

	// ตรวจสอบว่า username ไม่ซ้ำกับผู้อื่น
	if req.Username != "" {
		var existingID int
		err := config.DB.QueryRow(
			"SELECT id FROM users WHERE username = $1 AND id != $2",
			req.Username, userID,
		).Scan(&existingID)
		
		if err == nil {
			c.JSON(http.StatusConflict, gin.H{
				"error": "Username already taken",
			})
			return
		} else if err != sql.ErrNoRows {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"message": err.Error(),
			})
			return
		}
	}

	// ตรวจสอบว่า email ไม่ซ้ำกับผู้อื่น
	if req.Email != "" {
		var existingID int
		err := config.DB.QueryRow(
			"SELECT id FROM users WHERE email = $1 AND id != $2",
			req.Email, userID,
		).Scan(&existingID)
		
		if err == nil {
			c.JSON(http.StatusConflict, gin.H{
				"error": "Email already taken",
			})
			return
		} else if err != sql.ErrNoRows {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Database error",
				"message": err.Error(),
			})
			return
		}
	}

	// อัปเดตข้อมูล
	query := `
		UPDATE users 
		SET username = COALESCE(NULLIF($1, ''), username),
		    fullname = COALESCE(NULLIF($2, ''), fullname),
		    email = COALESCE(NULLIF($3, ''), email),
		    phone = COALESCE(NULLIF($4, ''), phone)
		WHERE id = $5
		RETURNING id, username, email, fullname, phone, avatar_url, created_at
	`

	var user struct {
		ID        int            `json:"id"`
		Username  string         `json:"username"`
		Email     string         `json:"email"`
		FullName  string         `json:"fullname"`
		Phone     string         `json:"phone"`
		AvatarURL sql.NullString `json:"avatar_url"`
		CreatedAt string         `json:"created_at"`
	}

	var avatarURL sql.NullString
	err := config.DB.QueryRow(
		query,
		req.Username,
		req.FullName,
		req.Email,
		req.Phone,
		userID,
	).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.FullName,
		&user.Phone,
		&avatarURL,
		&user.CreatedAt,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update user",
			"message": err.Error(),
		})
		return
	}

	// สร้าง response
	response := gin.H{
		"id":         user.ID,
		"username":   user.Username,
		"email":      user.Email,
		"fullname":   user.FullName,
		"phone":      user.Phone,
		"avatar_url": "",
		"created_at": user.CreatedAt,
	}

	if avatarURL.Valid {
		response["avatar_url"] = avatarURL.String
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Profile updated successfully",
		"data":    response,
	})
}
