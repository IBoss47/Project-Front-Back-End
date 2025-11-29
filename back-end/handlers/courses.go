package handlers

import (
	"back-end/config"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// Course struct
type Course struct {
	ID    int    `json:"id"`
	Code  string `json:"code"`
	Name  string `json:"name"`
	Year  string `json:"year"`
	Major string `json:"major"`
}

// GetAllCourses godoc
// @Summary Get all courses
// @Description Get a list of all courses with optional filtering by major and year
// @Tags courses
// @Accept json
// @Produce json
// @Param major query string false "Filter by major"
// @Param year query string false "Filter by year"
// @Success 200 {object} map[string]interface{} "List of courses with count"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/courses [get]
func GetAllCourses(c *gin.Context) {
	// Query parameters สำหรับ filter (optional)
	major := c.Query("major")
	year := c.Query("year")

	query := `
		SELECT id, code, name, year, major 
		FROM courses 
		WHERE 1=1
	`
	args := []interface{}{}

	// Filter by major ถ้ามี
	if major != "" {
		query += ` AND major = $` + fmt.Sprintf("%d", len(args)+1)
		args = append(args, major)
	}

	// Filter by year ถ้ามี
	if year != "" {
		query += ` AND year = $` + fmt.Sprintf("%d", len(args)+1)
		args = append(args, year)
	}

	query += ` ORDER BY major, year, code`

	rows, err := config.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch courses",
		})
		return
	}
	defer rows.Close()

	courses := []Course{}
	for rows.Next() {
		var course Course
		err := rows.Scan(
			&course.ID,
			&course.Code,
			&course.Name,
			&course.Year,
			&course.Major,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to scan course data",
			})
			return
		}
		courses = append(courses, course)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    courses,
		"count":   len(courses),
	})
}

// GetCourseMajors godoc
// @Summary Get all majors
// @Description Get a list of all unique majors
// @Tags courses
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "List of majors with count"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/courses/majors [get]
func GetCourseMajors(c *gin.Context) {
	query := `
		SELECT DISTINCT major 
		FROM courses 
		ORDER BY major
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch majors",
		})
		return
	}
	defer rows.Close()

	majors := []string{}
	for rows.Next() {
		var major string
		err := rows.Scan(&major)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to scan major data",
			})
			return
		}
		majors = append(majors, major)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    majors,
		"count":   len(majors),
	})
}

// GetCourseYears godoc
// @Summary Get all years
// @Description Get a list of all unique course years
// @Tags courses
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "List of years with count"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/courses/years [get]
func GetCourseYears(c *gin.Context) {
	query := `
		SELECT DISTINCT year 
		FROM courses 
		ORDER BY year
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch years",
		})
		return
	}
	defer rows.Close()

	years := []string{}
	for rows.Next() {
		var year string
		err := rows.Scan(&year)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to scan year data",
			})
			return
		}
		years = append(years, year)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    years,
		"count":   len(years),
	})
}
