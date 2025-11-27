import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/auth';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // โหลดตะกร้าจาก API เมื่อ mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchCart();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCartItems(response.data);
    } catch (error) {
      // ไม่แสดง error ถ้าเป็น 401 (ยังไม่ได้ login หรือ token หมดอายุ)
      if (error.response?.status === 401) {
        setCartItems([]);
      } else {
        console.error('Error fetching cart:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (book) => {
    try {
      await api.post('/cart', {
        note_id: book.id,
        quantity: 1
      });
      // Refresh cart from server
      await fetchCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      // Update local state immediately
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      // Update local state immediately
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (bookId) => {
    return cartItems.some((item) => item.note_id === bookId);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        isInCart,
        loading,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

