package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// Slider data structure
type SliderItem struct {
	ID    string `json:"id"`
	Image string `json:"image"`
	Link  string `json:"link"`
}

type SliderData struct {
	Slides []SliderItem `json:"slides"`
}

const sliderDataFile = "./uploads/slider/slider_data.json"
const sliderUploadDir = "./uploads/slider"

// GetSliderData - ดึงข้อมูล slider ทั้งหมด
func GetSliderData(c *gin.Context) {
	slides := loadSliderData()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    slides,
	})
}

// AddSliderImage - เพิ่มรูปภาพ slider ใหม่
func AddSliderImage(c *gin.Context) {
	// รับไฟล์รูปภาพ
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาอัปโหลดรูปภาพ"})
		return
	}

	// ตรวจสอบประเภทไฟล์
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" && ext != ".gif" && ext != ".webp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "รองรับเฉพาะไฟล์ JPG, PNG, GIF, WEBP"})
		return
	}

	// สร้างชื่อไฟล์ใหม่
	filename := fmt.Sprintf("slide_%d%s", time.Now().UnixNano(), ext)
	savePath := filepath.Join(sliderUploadDir, filename)

	// บันทึกไฟล์
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกไฟล์ได้"})
		return
	}

	// รับ link (ถ้ามี)
	link := c.PostForm("link")

	// สร้าง slider item ใหม่
	newSlide := SliderItem{
		ID:    fmt.Sprintf("%d", time.Now().UnixNano()),
		Image: fmt.Sprintf("uploads/slider/%s", filename),
		Link:  link,
	}

	// โหลดข้อมูลเดิมและเพิ่มใหม่
	slides := loadSliderData()
	slides = append(slides, newSlide)

	// บันทึกข้อมูล
	if err := saveSliderData(slides); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อมูลได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "เพิ่มรูปภาพสำเร็จ",
		"data":    newSlide,
	})
}

// DeleteSliderImage - ลบรูปภาพ slider
func DeleteSliderImage(c *gin.Context) {
	slideID := c.Param("id")
	if slideID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุ ID"})
		return
	}

	slides := loadSliderData()

	// ต้องมีอย่างน้อย 1 รูป
	if len(slides) <= 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ต้องมีอย่างน้อย 1 รูปใน Slider"})
		return
	}

	// หา slide ที่ต้องการลบ
	var updatedSlides []SliderItem
	var deletedSlide *SliderItem
	for _, slide := range slides {
		if slide.ID == slideID {
			deletedSlide = &slide
		} else {
			updatedSlides = append(updatedSlides, slide)
		}
	}

	if deletedSlide == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบรูปภาพที่ต้องการลบ"})
		return
	}

	// ลบไฟล์รูปภาพ (ถ้าไม่ใช่รูปเริ่มต้น)
	if !strings.Contains(deletedSlide.Image, "home_board") && !strings.Contains(deletedSlide.Image, "sell_board") {
		imagePath := "./" + deletedSlide.Image
		os.Remove(imagePath)
	}

	// บันทึกข้อมูลใหม่
	if err := saveSliderData(updatedSlides); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อมูลได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "ลบรูปภาพสำเร็จ",
	})
}

// UpdateSliderOrder - อัปเดตลำดับ slider
func UpdateSliderOrder(c *gin.Context) {
	var slides []SliderItem
	if err := c.ShouldBindJSON(&slides); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	if err := saveSliderData(slides); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อมูลได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "อัปเดตลำดับสำเร็จ",
	})
}

// loadSliderData - โหลดข้อมูล slider จากไฟล์
func loadSliderData() []SliderItem {
	// ถ้าไม่มีไฟล์ ให้สร้างข้อมูลเริ่มต้น
	if _, err := os.Stat(sliderDataFile); os.IsNotExist(err) {
		defaultSlides := []SliderItem{
			{ID: "1", Image: "uploads/slider/home_board.jpg", Link: "/Help"},
			{ID: "2", Image: "uploads/slider/sell_board.jpg", Link: "/SellListPage"},
		}
		saveSliderData(defaultSlides)
		return defaultSlides
	}

	file, err := os.Open(sliderDataFile)
	if err != nil {
		return []SliderItem{}
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		return []SliderItem{}
	}

	var slides []SliderItem
	if err := json.Unmarshal(data, &slides); err != nil {
		return []SliderItem{}
	}

	return slides
}

// saveSliderData - บันทึกข้อมูล slider ลงไฟล์
func saveSliderData(slides []SliderItem) error {
	data, err := json.MarshalIndent(slides, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(sliderDataFile, data, 0644)
}
