package handlers

import (
	"back-end/config"
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// CartItem represents an item in the cart with note details
type CartItem struct {
	ID         int     `json:"id"`
	NoteID     int     `json:"note_id"`
	Quantity   int     `json:"quantity"`
	BookTitle  string  `json:"book_title"`
	Price      float64 `json:"price"`
	ExamTerm   string  `json:"exam_term"`
	Status     string  `json:"status"`
	CoverImage string  `json:"cover_image"`
	Course     *Course `json:"course"`
	Seller     *Seller `json:"seller"`
}

// AddToCart adds a note to the cart
func AddToCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var request struct {
		NoteID   int `json:"note_id" binding:"required"`
		Quantity int `json:"quantity"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if request.Quantity <= 0 {
		request.Quantity = 1
	}

	// Get or create cart for user
	var cartID int
	err := config.DB.QueryRow("SELECT id FROM cart WHERE user_id = $1", userID).Scan(&cartID)
	if err == sql.ErrNoRows {
		// Create new cart
		err = config.DB.QueryRow("INSERT INTO cart (user_id) VALUES ($1) RETURNING id", userID).Scan(&cartID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cart"})
			return
		}
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Check if item already exists in cart
	var existingQuantity int
	err = config.DB.QueryRow("SELECT quantity FROM cart_items WHERE cart_id = $1 AND note_id = $2", cartID, request.NoteID).Scan(&existingQuantity)

	if err == sql.ErrNoRows {
		// Insert new item
		_, err = config.DB.Exec("INSERT INTO cart_items (cart_id, note_id, quantity) VALUES ($1, $2, $3)", cartID, request.NoteID, request.Quantity)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add item to cart"})
			return
		}
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	} else {
		// Update existing item quantity
		newQuantity := existingQuantity + request.Quantity
		_, err = config.DB.Exec("UPDATE cart_items SET quantity = $1 WHERE cart_id = $2 AND note_id = $3", newQuantity, cartID, request.NoteID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart item"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item added to cart successfully"})
}

// GetCart retrieves all items in the user's cart with note details
func GetCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get cart ID
	var cartID int
	err := config.DB.QueryRow("SELECT id FROM cart WHERE user_id = $1", userID).Scan(&cartID)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusOK, []CartItem{})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Get cart items with note details
	query := `
		SELECT 
			ci.id, ci.note_id, ci.quantity,
			n.book_title, n.price, n.exam_term, n.status,
			COALESCE((SELECT path FROM note_images WHERE note_id = n.id ORDER BY image_order LIMIT 1), '') as cover_image,
			c.id, c.code, c.name, c.year, c.major,
			u.id, u.username, u.fullname
		FROM cart_items ci
		JOIN notes_for_sale n ON ci.note_id = n.id
		LEFT JOIN courses c ON n.course_id = c.id
		LEFT JOIN users u ON n.seller_id = u.id
		WHERE ci.cart_id = $1
		ORDER BY ci.id DESC
	`

	rows, err := config.DB.Query(query, cartID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart items"})
		return
	}
	defer rows.Close()

	var cartItems []CartItem
	for rows.Next() {
		var item CartItem
		var course Course
		var seller Seller
		var courseID, sellerID sql.NullInt64
		var courseCode, courseName, courseYear, courseMajor sql.NullString
		var sellerUsername, sellerFullname sql.NullString

		err := rows.Scan(
			&item.ID, &item.NoteID, &item.Quantity,
			&item.BookTitle, &item.Price, &item.ExamTerm, &item.Status, &item.CoverImage,
			&courseID, &courseCode, &courseName, &courseYear, &courseMajor,
			&sellerID, &sellerUsername, &sellerFullname,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan cart item"})
			return
		}

		// Set course if exists
		if courseID.Valid {
			course.ID = int(courseID.Int64)
			course.Code = courseCode.String
			course.Name = courseName.String
			course.Year = courseYear.String
			course.Major = courseMajor.String
			item.Course = &course
		}

		// Set seller if exists
		if sellerID.Valid {
			seller.ID = int(sellerID.Int64)
			seller.Username = sellerUsername.String
			seller.Fullname = sellerFullname.String
			item.Seller = &seller
		}

		cartItems = append(cartItems, item)
	}

	if cartItems == nil {
		cartItems = []CartItem{}
	}

	c.JSON(http.StatusOK, cartItems)
}

// UpdateCartItem updates the quantity of a cart item
func UpdateCartItem(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	itemID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	var request struct {
		Quantity int `json:"quantity" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify the cart item belongs to the user
	query := `
		UPDATE cart_items 
		SET quantity = $1 
		WHERE id = $2 AND cart_id = (SELECT id FROM cart WHERE user_id = $3)
	`
	result, err := config.DB.Exec(query, request.Quantity, itemID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart item"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart item updated successfully"})
}

// RemoveFromCart removes an item from the cart
func RemoveFromCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	itemID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
		return
	}

	// Verify the cart item belongs to the user and delete
	query := `
		DELETE FROM cart_items 
		WHERE id = $1 AND cart_id = (SELECT id FROM cart WHERE user_id = $2)
	`
	result, err := config.DB.Exec(query, itemID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove item from cart"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart successfully"})
}

// ClearCart removes all items from the user's cart
func ClearCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Delete all cart items for the user
	query := `
		DELETE FROM cart_items 
		WHERE cart_id = (SELECT id FROM cart WHERE user_id = $1)
	`
	_, err := config.DB.Exec(query, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared successfully"})
}
