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

// RefreshTokenRequest - request body สำหรับ refresh token
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// RefreshToken - API สำหรับขอ access token ใหม่
func RefreshToken(c *gin.Context) {
	var req RefreshTokenRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": err.Error(),
		})
		return
	}

	// ตรวจสอบ refresh token ใน database
	var tokenData models.RefreshToken
	var user models.User

	query := `
		SELECT rt.id, rt.user_id, rt.token, rt.expires_at, rt.is_revoked,
		       u.id, u.username, u.email, u.password_hash, u.full_name, u.phone,
		       u.is_active, u.email_verified, u.created_at, u.updated_at
		FROM refresh_tokens rt
		INNER JOIN users u ON rt.user_id = u.id
		WHERE rt.token = $1
	`

	err := config.DB.QueryRow(query, req.RefreshToken).Scan(
		&tokenData.ID, &tokenData.UserID, &tokenData.Token, &tokenData.ExpiresAt, &tokenData.IsRevoked,
		&user.ID, &user.Username, &user.Email, &user.PasswordHash, &user.FullName,
		&user.Phone, &user.IsActive, &user.EmailVerified, &user.CreatedAt, &user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Invalid refresh token",
			"message": "Refresh token not found",
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

	// ตรวจสอบว่า token ถูก revoke หรือไม่
	if tokenData.IsRevoked {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Token revoked",
			"message": "This refresh token has been revoked",
		})
		return
	}

	// ตรวจสอบว่า token หมดอายุหรือไม่
	if time.Now().After(tokenData.ExpiresAt) {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Token expired",
			"message": "Refresh token has expired",
		})
		return
	}

	// ตรวจสอบว่า user ยัง active อยู่หรือไม่
	if !user.IsActive {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "Account disabled",
			"message": "Your account has been deactivated",
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

	// สร้าง access token ใหม่
	newAccessToken, err := utils.GenerateJWT(user.ID, user.Email, roles)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to generate token",
			"message": err.Error(),
		})
		return
	}

	// Response
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "Token refreshed successfully",
		"access_token": newAccessToken,
		"expires_in":   15 * 60, // 15 นาที
	})
}

// Logout - API สำหรับ logout (revoke refresh token)
func Logout(c *gin.Context) {
	var req RefreshTokenRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": err.Error(),
		})
		return
	}

	// Revoke refresh token
	result, err := config.DB.Exec(`
		UPDATE refresh_tokens 
		SET is_revoked = true 
		WHERE token = $1
	`, req.RefreshToken)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Token not found",
			"message": "Refresh token not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logged out successfully",
	})
}
