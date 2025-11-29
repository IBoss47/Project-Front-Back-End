package handlers

import (
	"back-end/config"
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

// GetAllSellers - ดึงรายการ Sellers ทั้งหมด
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
				seller_id,
				COUNT(*) as note_count,
				0 as total_sales,
				COALESCE(SUM(price), 0) as revenue
			FROM notes_for_sale
			GROUP BY seller_id
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

// GetAllUsers - ดึงรายการ Users ทั้งหมด
func GetAllUsers(c *gin.Context) {
	query := `
		SELECT 
			u.id,
			u.username,
			u.email,
			COALESCE(u.fullname, '') as fullname,
			COALESCE(u.phone, '') as phone,
			TO_CHAR(u.created_at, 'YYYY-MM-DD') as join_date,
			ARRAY_AGG(r.name) as roles
		FROM users u
		LEFT JOIN user_roles ur ON u.id = ur.user_id
		LEFT JOIN roles r ON ur.role_id = r.id
		GROUP BY u.id, u.username, u.email, u.fullname, u.phone, u.created_at
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
		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.Email,
			&user.FullName,
			&user.Phone,
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

// GetDashboardStats - ดึงสถิติสำหรับ Admin Dashboard
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

	// คำนวณรายได้รวมจากตาราง orders (2% ของยอดขาย)
	err = config.DB.QueryRow("SELECT COALESCE(SUM(total_amount) * 0.02, 0) FROM orders WHERE status = 'completed'").Scan(&stats.TotalRevenue)
	if err != nil {
		stats.TotalRevenue = 0
	}

	// คำนวณรายได้เดือนนี้ (2% ของยอดขาย)
	err = config.DB.QueryRow(`
		SELECT COALESCE(SUM(total_amount) * 0.02, 0) 
		FROM orders 
		WHERE status = 'completed' 
		AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
	`).Scan(&stats.MonthlyRevenue)
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

// AddSellerRole - เพิ่ม role seller ให้กับ user
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

// RemoveSellerRole - ลบ role seller ออกจาก user
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

// GetAllNotesAdmin - ดึงรายการ Notes ทั้งหมดสำหรับ Admin
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
}

// GetPendingNotes - ดึงรายการ Notes ที่รออนุมัติ
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
			COALESCE(n.description, '') as description
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

// ApproveNote - อนุมัติ Note ให้แสดงในหน้าขาย
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

// RejectNote - ปฏิเสธ Note
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

// DeleteNote - ลบ Note (Admin only)
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
