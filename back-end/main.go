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
	}

	// Protected routes สำหรับ seller เท่านั้น
	seller := r.Group("/api/seller")
	seller.Use(middleware.AuthMiddleware())
	seller.Use(middleware.RequireRole("seller", "admin"))
	{
		seller.GET("/dashboard", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "Welcome to seller dashboard!",
			})
		})
	}

	// Protected routes สำหรับ admin เท่านั้น
	admin := r.Group("/api/admin")
	admin.Use(middleware.AuthMiddleware())
	admin.Use(middleware.RequireRole("admin"))
	{
		admin.GET("/users", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "Admin users list",
			})
		})
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
