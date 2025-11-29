package handlers

import (
	"back-end/config"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
)

// SellerInfo - ข้อมูล Seller สำหรับ Admin Dashboard
type SellerInfo struct {
	ID             int    `json:"id"`
	Username       string `json:"username"`
	Email          string `json:"email"`
	FullName       string `json:"fullname"`
	Phone          string `json:"phone"`
	TotalSummaries int    `json:"total_summaries"`
	TotalSales     int    `json:"total_sales"`
	Revenue        float64 `json:"revenue"`
	JoinDate       string `json:"join_date"`
	Status         string `json:"status"`
}

// UserInfo - ข้อมูล User สำหรับ Admin Dashboard
type UserInfo struct {
	ID        int      `json:"id"`
	Username  string   `json:"username"`
	Email     string   `json:"email"`
	FullName  string   `json:"fullname"`
	Phone     string   `json:"phone"`
	AvatarURL string   `json:"avatar_url"`
	Roles     []string `json:"roles"`
	JoinDate  string   `json:"join_date"`
	Status    string   `json:"status"`
}

// DashboardStats - สถิติสำหรับ Admin Dashboard
type DashboardStats struct {
	TotalUsers       int     `json:"total_users"`
	TotalSellers     int     `json:"total_sellers"`
	TotalSummaries   int     `json:"total_summaries"`
	TotalRevenue     float64 `json:"total_revenue"`
	MonthlyRevenue   float64 `json:"monthly_revenue"`
	TotalOrders      int     `json:"total_orders"`
	PendingApprovals int     `json:"pending_approvals"`
	ReportedIssues   int     `json:"reported_issues"`
}

// GetAllSellers godoc
// @Summary Get all sellers
// @Description Get a list of all users with seller role including their sales statistics
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{} "List of sellers with count"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/admin/sellers [get]
func GetAllSellers(c *gin.Context) {
	query := `
		SELECT 
			u.id,
			u.username,
			u.email,
			COALESCE(u.fullname, '') as fullname,
			COALESCE(u.phone, '') as phone,
			COALESCE(ns.note_count, 0) as total_summaries,
			COALESCE(ns.total_sales, 0) as total_sales,
			COALESCE(ns.revenue, 0) as revenue,
			TO_CHAR(u.created_at, 'YYYY-MM-DD') as join_date,
			'active' as status
		FROM users u
		INNER JOIN user_roles ur ON u.id = ur.user_id
		INNER JOIN roles r ON ur.role_id = r.id
		LEFT JOIN (
			SELECT 
				n.seller_id,
				COUNT(DISTINCT n.id) as note_count,
				COUNT(b.id) as total_sales,
				COALESCE(SUM(n.price), 0) as revenue
			FROM notes_for_sale n
			LEFT JOIN buyed_note b ON n.id = b.note_id
			GROUP BY n.seller_id
		) ns ON u.id = ns.seller_id
		WHERE r.name = 'seller'
		ORDER BY u.created_at DESC
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}
	defer rows.Close()

	var sellers []SellerInfo
	for rows.Next() {
		var seller SellerInfo
		err := rows.Scan(
			&seller.ID,
			&seller.Username,
			&seller.Email,
			&seller.FullName,
			&seller.Phone,
			&seller.TotalSummaries,
			&seller.TotalSales,
			&seller.Revenue,
			&seller.JoinDate,
			&seller.Status,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Error scanning seller data",
				"message": err.Error(),
			})
			return
		}
		sellers = append(sellers, seller)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    sellers,
		"count":   len(sellers),
	})
}

// GetAllUsers godoc
// @Summary Get all users
// @Description Get a list of all users with their roles
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{} "List of users with count"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/admin/users [get]
func GetAllUsers(c *gin.Context) {
	query := `
		SELECT 
			u.id,
			u.username,
			u.email,
			COALESCE(u.fullname, '') as fullname,
			COALESCE(u.phone, '') as phone,
			COALESCE(u.avatar_url, '') as avatar_url,
			TO_CHAR(u.created_at, 'YYYY-MM-DD') as join_date,
			ARRAY_AGG(r.name) as roles
		FROM users u
		LEFT JOIN user_roles ur ON u.id = ur.user_id
		LEFT JOIN roles r ON ur.role_id = r.id
		GROUP BY u.id, u.username, u.email, u.fullname, u.phone, u.avatar_url, u.created_at
		ORDER BY u.created_at DESC
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}
	defer rows.Close()

	var users []UserInfo
	for rows.Next() {
		var user UserInfo
		var roles pq.StringArray
		var avatarURL sql.NullString
		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.Email,
			&user.FullName,
			&user.Phone,
			&avatarURL,
			&user.JoinDate,
			&roles,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Error scanning user data",
				"message": err.Error(),
			})
			return
		}
		// กำหนดค่า avatar_url
		if avatarURL.Valid {
			user.AvatarURL = avatarURL.String
		}
		user.Roles = []string(roles)
		user.Status = "active"
		users = append(users, user)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    users,
		"count":   len(users),
	})
}

// GetDashboardStats godoc
// @Summary Get dashboard statistics
// @Description Get admin dashboard statistics including users, sellers, revenue (2% commission), and pending approvals
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{} "Dashboard statistics"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Router /api/admin/dashboard [get]
func GetDashboardStats(c *gin.Context) {
	var stats DashboardStats

	// นับจำนวน Users ทั้งหมด
	err := config.DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&stats.TotalUsers)
	if err != nil {
		stats.TotalUsers = 0
	}

	// นับจำนวน Sellers
	err = config.DB.QueryRow(`
		SELECT COUNT(DISTINCT u.id)
		FROM users u
		INNER JOIN user_roles ur ON u.id = ur.user_id
		INNER JOIN roles r ON ur.role_id = r.id
		WHERE r.name = 'seller'
	`).Scan(&stats.TotalSellers)
	if err != nil {
		stats.TotalSellers = 0
	}

	// นับจำนวน Summaries ทั้งหมด
	err = config.DB.QueryRow("SELECT COUNT(*) FROM notes_for_sale").Scan(&stats.TotalSummaries)
	if err != nil {
		stats.TotalSummaries = 0
	}

	// คำนวณรายได้รวมจากตาราง buyed_note (เก็บ 2% ของราคาขาย)
	err = config.DB.QueryRow(`
		SELECT COALESCE(SUM(n.price) * 0.02, 0) 
		FROM buyed_note b
		INNER JOIN notes_for_sale n ON b.note_id = n.id
	`).Scan(&stats.TotalRevenue)
	if err != nil {
		stats.TotalRevenue = 0
	}

	// คำนวณรายได้เดือนนี้ (เก็บ 2% ของราคาขาย)
	// หากตาราง buyed_note ไม่มี created_at ให้ใช้รายได้ทั้งหมดแทน
	var monthlyRevenueQuery string
	var hasCreatedAt bool
	err = config.DB.QueryRow(`
		SELECT EXISTS (
			SELECT 1 
			FROM information_schema.columns 
			WHERE table_name='buyed_note' AND column_name='created_at'
		)
	`).Scan(&hasCreatedAt)
	
	if hasCreatedAt {
		monthlyRevenueQuery = `
			SELECT COALESCE(SUM(n.price) * 0.02, 0) 
			FROM buyed_note b
			INNER JOIN notes_for_sale n ON b.note_id = n.id
			WHERE b.created_at >= DATE_TRUNC('month', CURRENT_DATE)
		`
	} else {
		// ถ้าไม่มี created_at ให้ใช้รายได้ทั้งหมด
		monthlyRevenueQuery = `
			SELECT COALESCE(SUM(n.price) * 0.02, 0) 
			FROM buyed_note b
			INNER JOIN notes_for_sale n ON b.note_id = n.id
		`
	}
	
	err = config.DB.QueryRow(monthlyRevenueQuery).Scan(&stats.MonthlyRevenue)
	if err != nil {
		stats.MonthlyRevenue = 0
	}

	// นับจำนวน orders ทั้งหมด
	err = config.DB.QueryRow("SELECT COUNT(*) FROM orders WHERE status = 'completed'").Scan(&stats.TotalOrders)
	if err != nil {
		stats.TotalOrders = 0
	}

	// นับจำนวน notes ที่รออนุมัติ (pending)
	err = config.DB.QueryRow("SELECT COUNT(*) FROM notes_for_sale WHERE status = 'pending'").Scan(&stats.PendingApprovals)
	if err != nil {
		stats.PendingApprovals = 0
	}

	// สำหรับ reported issues (mock ไว้ก่อน)
	stats.ReportedIssues = 0

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}

// AddSellerRole godoc
// @Summary Add seller role to user
// @Description Assign the seller role to a specific user
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body object{user_id=int} true "User ID to add seller role"
// @Success 200 {object} map[string]interface{} "Role assigned successfully"
// @Failure 400 {object} map[string]string "Invalid request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Server error"
// @Router /api/admin/users/seller [post]
func AddSellerRole(c *gin.Context) {
	var req struct {
		UserID int `json:"user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": err.Error(),
		})
		return
	}

	// ตรวจสอบว่ามี role seller หรือไม่
	var roleID int
	err := config.DB.QueryRow("SELECT id FROM roles WHERE name = $1", "seller").Scan(&roleID)
	if err != nil {
		// สร้าง role seller ถ้ายังไม่มี
		err = config.DB.QueryRow("INSERT INTO roles (name) VALUES ($1) RETURNING id", "seller").Scan(&roleID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to create seller role",
				"message": err.Error(),
			})
			return
		}
	}

	// เพิ่ม role ให้ user
	_, err = config.DB.Exec("INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", req.UserID, roleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to assign seller role",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Seller role assigned successfully",
	})
}

// RemoveSellerRole godoc
// @Summary Remove seller role from user
// @Description Remove the seller role from a specific user
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body object{user_id=int} true "User ID to remove seller role"
// @Success 200 {object} map[string]interface{} "Role removed successfully"
// @Failure 400 {object} map[string]string "Invalid request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Seller role not found"
// @Failure 500 {object} map[string]string "Server error"
// @Router /api/admin/users/seller [delete]
func RemoveSellerRole(c *gin.Context) {
	var req struct {
		UserID int `json:"user_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request",
			"message": err.Error(),
		})
		return
	}

	// หา role ID ของ seller
	var roleID int
	err := config.DB.QueryRow("SELECT id FROM roles WHERE name = $1", "seller").Scan(&roleID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "Seller role not found",
			"message": err.Error(),
		})
		return
	}

	// ลบ role ออกจาก user
	_, err = config.DB.Exec("DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2", req.UserID, roleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to remove seller role",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Seller role removed successfully",
	})
}

// NoteInfo - ข้อมูล Note สำหรับ Admin Dashboard
type NoteInfo struct {
	ID          int     `json:"id"`
	Title       string  `json:"title"`
	SellerID    int     `json:"seller_id"`
	SellerName  string  `json:"seller_name"`
	Price       float64 `json:"price"`
	Status      string  `json:"status"`
	ExamTerm    string  `json:"exam_term"`
	CourseName  string  `json:"course_name"`
	CreatedAt   string  `json:"created_at"`
	Sales       int     `json:"sales"`
}

// GetAllNotesAdmin godoc
// @Summary Get all notes (Admin)
// @Description Get a list of all notes for admin management
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{} "List of notes with count"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/admin/notes [get]
func GetAllNotesAdmin(c *gin.Context) {
	query := `
		SELECT 
			n.id,
			n.book_title,
			n.seller_id,
			COALESCE(u.fullname, u.username) as seller_name,
			n.price,
			COALESCE(n.status, 'available') as status,
			COALESCE(n.exam_term, '') as exam_term,
			COALESCE(c.name, '') as course_name,
			TO_CHAR(n.created_at, 'YYYY-MM-DD') as created_at,
			0 as sales
		FROM notes_for_sale n
		LEFT JOIN users u ON n.seller_id = u.id
		LEFT JOIN courses c ON n.course_id = c.id
		ORDER BY n.created_at DESC
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}
	defer rows.Close()

	var notes []NoteInfo
	for rows.Next() {
		var note NoteInfo
		err := rows.Scan(
			&note.ID,
			&note.Title,
			&note.SellerID,
			&note.SellerName,
			&note.Price,
			&note.Status,
			&note.ExamTerm,
			&note.CourseName,
			&note.CreatedAt,
			&note.Sales,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Error scanning note data",
				"message": err.Error(),
			})
			return
		}
		notes = append(notes, note)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    notes,
		"count":   len(notes),
	})
}

// PendingNoteInfo - ข้อมูล Note ที่รออนุมัติ
type PendingNoteInfo struct {
	ID          int     `json:"id"`
	Title       string  `json:"title"`
	SellerID    int     `json:"seller_id"`
	SellerName  string  `json:"seller_name"`
	Price       float64 `json:"price"`
	Status      string  `json:"status"`
	ExamTerm    string  `json:"exam_term"`
	CourseName  string  `json:"course_name"`
	CreatedAt   string  `json:"created_at"`
	Description string  `json:"description"`
	CoverImage  string  `json:"cover_image"`
}

// GetPendingNotes godoc
// @Summary Get pending notes
// @Description Get a list of notes waiting for admin approval
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{} "List of pending notes with count"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/admin/notes/pending [get]
func GetPendingNotes(c *gin.Context) {
	query := `
		SELECT 
			n.id,
			n.book_title,
			n.seller_id,
			COALESCE(u.fullname, u.username) as seller_name,
			n.price,
			COALESCE(n.status, 'pending') as status,
			COALESCE(n.exam_term, '') as exam_term,
			COALESCE(c.name, '') as course_name,
			TO_CHAR(n.created_at, 'YYYY-MM-DD HH24:MI') as created_at,
			COALESCE(n.description, '') as description,
			COALESCE(
				(SELECT path FROM note_images WHERE note_id = n.id ORDER BY image_order LIMIT 1),
				''
			) as cover_image
		FROM notes_for_sale n
		LEFT JOIN users u ON n.seller_id = u.id
		LEFT JOIN courses c ON n.course_id = c.id
		WHERE n.status = 'pending'
		ORDER BY n.created_at ASC
	`

	rows, err := config.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Database error",
			"message": err.Error(),
		})
		return
	}
	defer rows.Close()

	var notes []PendingNoteInfo
	for rows.Next() {
		var note PendingNoteInfo
		err := rows.Scan(
			&note.ID,
			&note.Title,
			&note.SellerID,
			&note.SellerName,
			&note.Price,
			&note.Status,
			&note.ExamTerm,
			&note.CourseName,
			&note.CreatedAt,
			&note.Description,
			&note.CoverImage,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Error scanning note data",
				"message": err.Error(),
			})
			return
		}
		notes = append(notes, note)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    notes,
		"count":   len(notes),
	})
}

// ApproveNote godoc
// @Summary Approve a note
// @Description Approve a pending note to make it available for sale
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Note ID"
// @Success 200 {object} map[string]interface{} "Note approved successfully"
// @Failure 400 {object} map[string]string "Note ID is required"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Note not found or already processed"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/admin/notes/{id}/approve [put]
func ApproveNote(c *gin.Context) {
	noteID := c.Param("id")
	if noteID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Note ID is required",
		})
		return
	}

	// อัปเดตสถานะเป็น available
	result, err := config.DB.Exec(`
		UPDATE notes_for_sale 
		SET status = 'available'
		WHERE id = $1 AND status = 'pending'
	`, noteID)

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
			"error": "Note not found or already processed",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Note approved successfully",
	})
}

// RejectNote godoc
// @Summary Reject a note
// @Description Reject a pending note with optional reason
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Note ID"
// @Param request body object{reason=string} false "Rejection reason"
// @Success 200 {object} map[string]interface{} "Note rejected successfully"
// @Failure 400 {object} map[string]string "Note ID is required"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Note not found or already processed"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/admin/notes/{id}/reject [put]
func RejectNote(c *gin.Context) {
	noteID := c.Param("id")
	if noteID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Note ID is required",
		})
		return
	}

	// รับเหตุผลในการปฏิเสธ (optional)
	var req struct {
		Reason string `json:"reason"`
	}
	c.ShouldBindJSON(&req)

	// อัปเดตสถานะเป็น rejected
	result, err := config.DB.Exec(`
		UPDATE notes_for_sale 
		SET status = 'rejected'
		WHERE id = $1 AND status = 'pending'
	`, noteID)

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
			"error": "Note not found or already processed",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Note rejected successfully",
		"reason":  req.Reason,
	})
}

// DeleteNote godoc
// @Summary Delete a note
// @Description Delete a note from the system (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Note ID"
// @Success 200 {object} map[string]interface{} "Note deleted successfully"
// @Failure 400 {object} map[string]string "Note ID is required"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Note not found"
// @Failure 500 {object} map[string]string "Database error"
// @Router /api/admin/notes/{id} [delete]
func DeleteNote(c *gin.Context) {
	noteID := c.Param("id")
	if noteID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Note ID is required",
		})
		return
	}

	// ลบ note จาก database (note_images และ cart จะถูกลบอัตโนมัติเพราะ ON DELETE CASCADE)
	result, err := config.DB.Exec(`
		DELETE FROM notes_for_sale 
		WHERE id = $1
	`, noteID)

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
			"error": "Note not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Note deleted successfully",
	})
}
