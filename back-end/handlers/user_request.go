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

func GetMe(c *gin.Context){
	v, exists := c.Get("user_id")
    if !exists {
        c.JSON(401, gin.H{"error": "Unauthorized"})
        return
    }
    userId := v.(int)

    var user models.User

    query := `
		SELECT id, username, email, fullname, phone, created_at 
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

    c.JSON(http.StatusOK, user)
}

func GetUserByID(c *gin.Context) {
	// รับค่า id จาก URL params
	idStr := c.Param("id")
	userId, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var user models.User

	query := `
		SELECT id, username, email, fullname, phone, created_at
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

	c.JSON(http.StatusOK, user)
}