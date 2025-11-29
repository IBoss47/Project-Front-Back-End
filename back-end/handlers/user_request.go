package handlers

import (
	"back-end/models"
	"back-end/config"
	"net/http"
	"database/sql"
	"fmt"
	"strconv"

	"github.com/gin-gonic/gin"
)

// GetMe godoc
// @Summary Get current user profile
// @Description Get the profile of the currently authenticated user
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.User "User profile"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "User not found"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/me [get]
func GetMe(c *gin.Context){
	v, exists := c.Get("user_id")
    if !exists {
        c.JSON(401, gin.H{"error": "Unauthorized"})
        return
    }
    userId := v.(int)

    var user models.User
    var avatarURL sql.NullString

    query := `
		SELECT id, username, email, fullname, phone, avatar_url, created_at 
		FROM users 
		WHERE id = $1
	`

	row := config.DB.QueryRow(query, userId)

    err := row.Scan(
        &user.ID,
        &user.Username,
        &user.Email,
        &user.FullName,
        &user.Phone,
        &avatarURL,
        &user.CreatedAt,
    )

    if err != nil {
		fmt.Println("SCAN ERROR:", err)
        if err == sql.ErrNoRows {
            c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
            return
        }
        c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
        return
    }

    // กำหนดค่า avatar_url
    if avatarURL.Valid {
        user.AvatarURL = avatarURL.String
    }

    c.JSON(http.StatusOK, user)
}

// GetUserByID godoc
// @Summary Get user by ID
// @Description Get a user's public profile by their ID
// @Tags users
// @Accept json
// @Produce json
// @Param id path int true "User ID"
// @Success 200 {object} models.User "User profile"
// @Failure 400 {object} map[string]string "Invalid user ID"
// @Failure 404 {object} map[string]string "User not found"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/users/{id} [get]
func GetUserByID(c *gin.Context) {
	// รับค่า id จาก URL params
	idStr := c.Param("id")
	userId, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var user models.User
    var avatarURL sql.NullString

	query := `
		SELECT id, username, email, fullname, phone, avatar_url, created_at
		FROM users
		WHERE id = $1
	`

	row := config.DB.QueryRow(query, userId)

	err = row.Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.FullName,
		&user.Phone,
		&avatarURL,
		&user.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "db error"})
		return
	}

	// กำหนดค่า avatar_url
	if avatarURL.Valid {
		user.AvatarURL = avatarURL.String
	}

	c.JSON(http.StatusOK, user)
}