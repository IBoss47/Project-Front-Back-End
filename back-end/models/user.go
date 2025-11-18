package models

import "time"

// User model - ตาม schema จาก schematest.sql
type User struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"` // ไม่ส่งใน JSON response
	FullName     string    `json:"fullname"`
	Phone        string    `json:"phone"`
	CreatedAt    time.Time `json:"created_at"`
}

// Role model
type Role struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

// UserRole model - many-to-many relationship
type UserRole struct {
	ID         int       `json:"id"`
	UserID     int       `json:"user_id"`
	RoleID     int       `json:"role_id"`
	AssignedAt time.Time `json:"assigned_at"`
}

// UserWithRoles - User พร้อม roles
type UserWithRoles struct {
	User
	Roles []string `json:"roles"` // ["user", "seller", "admin"]
}

// LoginRequest - ข้อมูลสำหรับ login
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required,min=3"`
}

// RegisterRequest - ข้อมูลสำหรับสมัครสมาชิก
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=100"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=3"`
	FullName string `json:"fullname"`
	Phone    string `json:"phone"`
}

// LoginResponse - response หลัง login สำเร็จ
type LoginResponse struct {
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
	ExpiresIn    int64         `json:"expires_in"` // วินาที
	User         UserWithRoles `json:"user"`
}

// RefreshToken model
type RefreshToken struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	Token     string    `json:"token"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
	IsRevoked bool      `json:"is_revoked"`
}
