package handlers

import (
	"back-end/config"
	"back-end/models"
	"back-end/utils"
	"database/sql"
	"net/http"

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

	// ค้นหา user จาก email
	var user models.User
	query := `
		SELECT id, username, email, password_hash, full_name, phone, 
		       is_active, email_verified, created_at, updated_at
		FROM users 
		WHERE email = $1
	`
	err := config.DB.QueryRow(query, req.Email).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.FullName, &user.Phone, &user.IsActive, &user.EmailVerified,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Login failed",
			"message": "Invalid email or password",
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

	// ตรวจสอบว่า account active หรือไม่
	if !user.IsActive {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Account disabled",
			"message": "Your account has been deactivated",
		})
		return
	}

	// ตรวจสอบ password
	if !utils.CheckPasswordHash(req.Password, user.PasswordHash) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Login failed",
			"message": "Invalid email or password",
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

	// สร้าง JWT token
	token, err := utils.GenerateJWT(user.ID, user.Email, roles)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to generate token",
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
		Token: token,
		User:  userWithRoles,
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
