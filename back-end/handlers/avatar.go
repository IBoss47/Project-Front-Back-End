package handlers

import (
	"back-end/config"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// UploadAvatar godoc
// @Summary อัปโหลดรูป avatar ของผู้ใช้
// @Description อัปโหลดรูปภาพ avatar และบันทึก URL ลงในฐานข้อมูล
// @Tags users
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param avatar formData file true "ไฟล์รูปภาพ avatar"
// @Success 200 {object} map[string]interface{} "อัปโหลดสำเร็จ"
// @Failure 400 {object} map[string]string "ข้อมูลไม่ถูกต้อง"
// @Failure 401 {object} map[string]string "ไม่ได้เข้าสู่ระบบ"
// @Failure 500 {object} map[string]string "เกิดข้อผิดพลาด"
// @Router /api/upload-avatar [post]
func UploadAvatar(c *gin.Context) {
	// ตรวจสอบว่า user ได้ login หรือไม่
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDInterface.(int)

	// รับไฟล์จาก form
	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "No file uploaded",
			"message": err.Error(),
		})
		return
	}

	// ตรวจสอบประเภทไฟล์ (รับเฉพาะรูปภาพ)
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := map[string]bool{
		".jpg":  true,
		".jpeg": true,
		".png":  true,
		".gif":  true,
		".webp": true,
	}

	if !allowedExts[ext] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid file type. Only jpg, jpeg, png, gif, and webp are allowed",
		})
		return
	}

	// ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "File size too large. Maximum 5MB allowed",
		})
		return
	}

	// สร้างชื่อไฟล์ใหม่ (เพื่อป้องกันชื่อซ้ำ)
	timestamp := time.Now().Unix()
	newFilename := fmt.Sprintf("avatar_%d_%d%s", userID, timestamp, ext)

	// สร้างโฟลเดอร์ถ้ายังไม่มี
	uploadDir := "./uploads/images"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create upload directory",
			"message": err.Error(),
		})
		return
	}

	// เส้นทางเต็มของไฟล์
	filePath := filepath.Join(uploadDir, newFilename)

	// บันทึกไฟล์
	src, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to open uploaded file",
			"message": err.Error(),
		})
		return
	}
	defer src.Close()

	dst, err := os.Create(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create file",
			"message": err.Error(),
		})
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to save file",
			"message": err.Error(),
		})
		return
	}

	// บันทึก URL ลงในฐานข้อมูล
	avatarURL := fmt.Sprintf("/uploads/images/%s", newFilename)
	
	// ลบรูปเก่าออกก่อน (ถ้ามี)
	var oldAvatarURL string
	err = config.DB.QueryRow("SELECT avatar_url FROM users WHERE id = $1", userID).Scan(&oldAvatarURL)
	if err == nil && oldAvatarURL != "" {
		// ลบไฟล์เก่า
		oldFilePath := filepath.Join(".", oldAvatarURL)
		os.Remove(oldFilePath)
	}

	// อัปเดต avatar_url ในฐานข้อมูล
	_, err = config.DB.Exec("UPDATE users SET avatar_url = $1 WHERE id = $2", avatarURL, userID)
	if err != nil {
		// ลบไฟล์ที่เพิ่งอัปโหลดถ้าบันทึกในฐานข้อมูลไม่สำเร็จ
		os.Remove(filePath)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update database",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"message":    "Avatar uploaded successfully",
		"avatar_url": avatarURL,
	})
}

// DeleteAvatar godoc
// @Summary ลบรูป avatar ของผู้ใช้
// @Description ลบรูปภาพ avatar และอัปเดตฐานข้อมูล
// @Tags users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{} "ลบสำเร็จ"
// @Failure 401 {object} map[string]string "ไม่ได้เข้าสู่ระบบ"
// @Failure 500 {object} map[string]string "เกิดข้อผิดพลาด"
// @Router /api/delete-avatar [delete]
func DeleteAvatar(c *gin.Context) {
	// ตรวจสอบว่า user ได้ login หรือไม่
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := userIDInterface.(int)

	// ดึง avatar URL จากฐานข้อมูล
	var avatarURL string
	err := config.DB.QueryRow("SELECT avatar_url FROM users WHERE id = $1", userID).Scan(&avatarURL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get avatar URL",
			"message": err.Error(),
		})
		return
	}

	// ลบไฟล์ (ถ้ามี)
	if avatarURL != "" {
		filePath := filepath.Join(".", avatarURL)
		os.Remove(filePath) // ไม่สนใจ error ถ้าไฟล์ไม่มีอยู่
	}

	// อัปเดตฐานข้อมูล (ตั้งค่า avatar_url เป็น NULL)
	_, err = config.DB.Exec("UPDATE users SET avatar_url = NULL WHERE id = $1", userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update database",
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Avatar deleted successfully",
	})
}
