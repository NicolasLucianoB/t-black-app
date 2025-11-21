import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { notificationManager } from '../services/notificationManager';
import { CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

const CART_STORAGE_KEY = 'cart_items';

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from storage on app start
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  const loadCartFromStorage = async () => {
    try {
      const cartData = await AsyncStorage.getItem(CART_STORAGE_KEY);
      if (cartData) {
        setCart(JSON.parse(cartData));
      }
    } catch (error) {
      console.log('Error loading cart from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCartToStorage = async (cartData: CartItem[]) => {
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.log('Error saving cart to storage:', error);
    }
  };

  const addToCart = async (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...item,
    };

    const updatedCart = [...cart];

    // For courses, don't allow duplicates
    if (item.type === 'course') {
      const existingIndex = updatedCart.findIndex(
        (cartItem) => cartItem.courseId === item.courseId && cartItem.type === 'course',
      );
      if (existingIndex >= 0) {
        return; // Course already in cart
      }
    }

    // For products, check if already exists and update quantity
    if (item.type === 'product') {
      const existingIndex = updatedCart.findIndex(
        (cartItem) => cartItem.productId === item.productId && cartItem.type === 'product',
      );
      if (existingIndex >= 0) {
        updatedCart[existingIndex].quantity += item.quantity;
        setCart(updatedCart);
        await saveCartToStorage(updatedCart);
        return;
      }
    }

    updatedCart.push(newItem);
    setCart(updatedCart);
    await saveCartToStorage(updatedCart);

    // Send notification for new item added
    try {
      const itemName =
        item.product?.name || item.course?.title || (item.type === 'product' ? 'Produto' : 'Curso');
      await notificationManager.notifyItemAddedToCart(itemName, item.type);

      // Schedule cart abandonment notification (will be cancelled if purchase is completed)
      setTimeout(async () => {
        if (updatedCart.length > 0) {
          // Check if cart still has items
          await notificationManager.notifyCartAbandonment();
        }
      }, 3600000); // 1 hour
    } catch (error) {
      console.log('Error sending cart notification:', error);
    }
  };

  const removeFromCart = async (id: string) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    setCart(updatedCart);
    await saveCartToStorage(updatedCart);
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }

    const updatedCart = cart.map((item) => (item.id === id ? { ...item, quantity } : item));
    setCart(updatedCart);
    await saveCartToStorage(updatedCart);
  };

  const clearCart = async () => {
    setCart([]);
    await AsyncStorage.removeItem(CART_STORAGE_KEY);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const value: CartContextType = {
    cart,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
