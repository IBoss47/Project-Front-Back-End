package main

import (
	"back-end/config"
	"back-end/handlers"
	"back-end/middleware"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// โหลด .env file
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found, using environment variables")
	}

	// เชื่อมต่อ database
	config.ConnectDB()
	defer config.CloseDB()

	// สร้าง Gin router
	r := gin.Default()

	// CORS middleware (อนุญาตให้ frontend เข้าถึง API)
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Serve static files (สำหรับรูปภาพและ PDF)
	r.Static("/uploads", "./uploads")

	// Health check endpoint
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Bookstore API Server is running! 🚀",
			"version": "1.0.0",
			"status":  "healthy",
		})
	})

	// Public routes (ไม่ต้อง login)
	public := r.Group("/api")
	{
		public.POST("/register", handlers.Register)
		public.POST("/login", handlers.Login)
		public.POST("/refresh", handlers.RefreshToken) // ขอ access token ใหม่
		public.POST("/logout", handlers.Logout)        // Logout และ revoke refresh token

		// Notes - ดูได้โดยไม่ต้อง login
		public.GET("/notes", handlers.GetAllNotes)                      // ดึงรายการ notes ทั้งหมด
		public.GET("/notes/best-selling", handlers.GetBestSellingNotes) // ดึงหนังสือขายดี
		public.GET("/notes/latest", handlers.GetLatestNotes)            // ดึงหนังสือมาใหม่ล่าสุด
		public.GET("/notes/:id", handlers.GetNoteByID)                  // ดึง note เดียวตาม ID

		// Courses - ดูได้โดยไม่ต้อง login
		public.GET("/courses", handlers.GetAllCourses)     // ดึงรายการ courses ทั้งหมด
		public.GET("/courses/majors", handlers.GetCourseMajors) // ดึงรายการสาขาทั้งหมด
		public.GET("/courses/years", handlers.GetCourseYears)   // ดึงรายการชั้นปีทั้งหมด

		// Slider - ดูได้โดยไม่ต้อง login
		public.GET("/slider", handlers.GetSliderData) // ดึงข้อมูล slider
	}

	// Protected routes (ต้อง login)
	protected := r.Group("/api")
	protected.Use(middleware.AuthMiddleware())
	{
		// ตัวอย่าง endpoint ที่ต้อง login
		protected.GET("/profile", func(c *gin.Context) {
			userID := c.GetInt("user_id")
			email := c.GetString("email")
			roles := c.GetStringSlice("roles")

			c.JSON(200, gin.H{
				"user_id": userID,
				"email":   email,
				"roles":   roles,
			})
		})

		// Notes endpoints
		protected.POST("/notes", handlers.CreateNote) // สร้างโน้ตขาย

		protected.GET("/users/:id/notes", handlers.GetNotesByUserID)      
		protected.GET("/me", handlers.GetMe)
		protected.GET("/users/:id/profile", handlers.GetUserByID)
		
		// Purchase endpoints
		protected.POST("/purchase", handlers.PurchaseNotes)              // ซื้อหนังสือ
		protected.GET("/my-purchases", handlers.GetMyPurchaseHistory)    // ดึงประวัติการซื้อ
		protected.PUT("/my-purchases/:id", handlers.UpdatePurchaseReview) // อัพเดทรีวิว
		protected.GET("/download/:id", handlers.DownloadPurchasedNote)   // ดาวน์โหลด PDF
		
		// Cart endpoints
		protected.POST("/cart", handlers.AddToCart)            // เพิ่มสินค้าลงตะกร้า
		protected.GET("/cart", handlers.GetCart)               // ดูสินค้าในตะกร้า
		protected.PUT("/cart/:id", handlers.UpdateCartItem)    // อัพเดทจำนวนสินค้า
		protected.DELETE("/cart/:id", handlers.RemoveFromCart) // ลบสินค้าออกจากตะกร้า
		protected.DELETE("/cart", handlers.ClearCart)          // ล้างตะกร้าทั้งหมด
	}

	// Protected routes สำหรับ admin เท่านั้น
	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware())
	admin.Use(middleware.RequireRole("admin"))
	{
		admin.GET("/users", handlers.GetAllUsers)               // ดึงรายการ Users ทั้งหมด
		admin.GET("/sellers", handlers.GetAllSellers)           // ดึงรายการ Sellers ทั้งหมด
		admin.GET("/stats", handlers.GetDashboardStats)         // ดึงสถิติ Dashboard
		admin.GET("/notes", handlers.GetAllNotesAdmin)          // ดึงรายการ Notes ทั้งหมด
		admin.GET("/notes/pending", handlers.GetPendingNotes)   // ดึงรายการ Notes ที่รออนุมัติ
		admin.GET("/notes/:id/download", handlers.DownloadNoteForAdmin) // ดาวน์โหลด PDF (Admin)
		admin.POST("/notes/:id/approve", handlers.ApproveNote)  // อนุมัติ Note
		admin.POST("/notes/:id/reject", handlers.RejectNote)    // ปฏิเสธ Note
		admin.POST("/seller/add", handlers.AddSellerRole)       // เพิ่ม role seller
		admin.POST("/seller/remove", handlers.RemoveSellerRole) // ลบ role seller

		// Slider management
		admin.POST("/slider", handlers.AddSliderImage)          // เพิ่มรูป slider
		admin.DELETE("/slider/:id", handlers.DeleteSliderImage) // ลบรูป slider
		admin.PUT("/slider/order", handlers.UpdateSliderOrder)  // อัปเดตลำดับ slider
	}

	// เริ่ม server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Server is running on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
