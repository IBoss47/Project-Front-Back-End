package handlers

import (
	"back-end/config"
	"back-end/models"
	"back-end/utils"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Register godoc
// @Summary สมัครสมาชิก
// @Description สมัครสมาชิกใหม่ในระบบ
// @Tags Authentication
// @Accept json
// @Produce json
// @Param request body models.RegisterRequest true "ข้อมูลการสมัครสมาชิก"
// @Success 201 {object} map[string]interface{} "สมัครสมาชิกสำเร็จ"
// @Failure 400 {object} map[string]interface{} "ข้อมูลไม่ถูกต้อง"
// @Failure 409 {object} map[string]interface{} "Email หรือ Username ซ้ำ"
// @Failure 500 {object} map[string]interface{} "Server error"
// @Router /register [post]
func Register(c *gin.Context) {
	var req models.RegisterRequest

	// Validate request body
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": err.Error(),
		})
		return
	}

	// เช็คว่า email ซ้ำหรือไม่
	var exists bool
	err := config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", req.Email).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}

	if exists {
		c.JSON(http.StatusConflict, gin.H{
			"error":   "Email already exists",
			"message": "This email is already registered",
		})
		return
	}

	// เช็คว่า username ซ้ำหรือไม่
	err = config.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)", req.Username).Scan(&exists)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}

	if exists {
		c.JSON(http.StatusConflict, gin.H{
			"error":   "Username already exists",
			"message": "This username is already taken",
		})
		return
	}

	// Hash password
	passwordHash, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to hash password",
			"message": err.Error(),
		})
		return
	}

	// เริ่ม transaction
	tx, err := config.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to start transaction",
			"message": err.Error(),
		})
		return
	}
	defer tx.Rollback()

	// Insert user
	var userID int
	insertUserQuery := `
		INSERT INTO users (username, email, password_hash, fullname, phone)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`
	err = tx.QueryRow(insertUserQuery, req.Username, req.Email, passwordHash, req.FullName, req.Phone).Scan(&userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create user",
			"message": err.Error(),
		})
		return
	}

	// ดึง default role "user"
	var roleID int
	err = tx.QueryRow("SELECT id FROM roles WHERE name = $1", "user").Scan(&roleID)
	if err != nil {
		// ถ้าไม่มี role "user" ให้สร้างใหม่
		if err == sql.ErrNoRows {
			err = tx.QueryRow("INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING id",
				"user", "Default user role").Scan(&roleID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error":   "Failed to create default role",
					"message": err.Error(),
				})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to get default role",
				"message": err.Error(),
			})
			return
		}
	}

	// Assign default role "user" ให้กับ user ใหม่
	_, err = tx.Exec("INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)", userID, roleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to assign role",
			"message": err.Error(),
		})
		return
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to commit transaction",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "User registered successfully",
		"data": gin.H{
			"user_id":  userID,
			"username": req.Username,
			"email":    req.Email,
		},
	})
}
