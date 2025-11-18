package handlers

import (
	"back-end/config"
	"back-end/models"
	"back-end/utils"
	"database/sql"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// Login - API สำหรับ login
func Login(c *gin.Context) {
	var req models.LoginRequest

	// Validate request body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": err.Error(),
		})
		return
	}

	// ค้นหา user จาก username หรือ email
	var user models.User
	query := `
		SELECT id, username, email, password_hash, fullname, phone, created_at
		FROM users 
		WHERE username = $1 OR email = $1
	`
	err := config.DB.QueryRow(query, req.Username).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.FullName, &user.Phone, &user.CreatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Login failed",
			"message": "Invalid username/email or password",
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

	// ตรวจสอบ password
	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Login failed",
			"message": "Invalid username/email or password",
		})
		return
	}

	// ดึง roles ของ user
	roles, err := getUserRoles(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get user roles",
			"message": err.Error(),
		})
		return
	}

	// สร้าง JWT access token
	accessToken, err := utils.GenerateJWT(user.ID, user.Email, roles)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to generate token",
			"message": err.Error(),
		})
		return
	}

	// สร้าง Refresh Token
	refreshToken, err := utils.GenerateRefreshToken()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to generate refresh token",
			"message": err.Error(),
		})
		return
	}

	// บันทึก Refresh Token ลง database
	expiresAt := time.Now().Add(7 * 24 * time.Hour) // 7 วัน
	_, err = config.DB.Exec(`
		INSERT INTO refresh_tokens (user_id, token, expires_at, is_revoked)
		VALUES ($1, $2, $3, false)
	`, user.ID, refreshToken, expiresAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save refresh token",
			"message": err.Error(),
		})
		return
	}

	// สร้าง response
	userWithRoles := models.UserWithRoles{
		User:  user,
		Roles: roles,
	}

	response := models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    15 * 60, // 15 นาที (เป็นวินาที)
		User:         userWithRoles,
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Login successful",
		"data":    response,
	})
}

// getUserRoles - ดึง roles ทั้งหมดของ user
func getUserRoles(userID int) ([]string, error) {
	query := `
		SELECT r.name 
		FROM roles r
		INNER JOIN user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = $1
	`

	rows, err := config.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []string
	for rows.Next() {
		var roleName string
		if err := rows.Scan(&roleName); err != nil {
			return nil, err
		}
		roles = append(roles, roleName)
	}

	// ถ้าไม่มี role ให้ default เป็น "user"
	if len(roles) == 0 {
		roles = []string{"user"}
	}

	return roles, nil
}
