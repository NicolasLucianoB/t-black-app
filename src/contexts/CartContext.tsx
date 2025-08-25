import React, { createContext, ReactNode, useContext, useState } from 'react';

interface CartItem {
  id: number;
  type: 'product' | 'course';
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (id: number, type: 'product' | 'course') => void;
  removeFromCart: (id: number, type: 'product' | 'course') => void;
  clearCart: () => void;
  getCartCount: () => number;
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

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (id: number, type: 'product' | 'course') => {
    setCart((prev) => {
      if (type === 'course' && prev.some((item) => item.id === id && item.type === 'course')) {
        return prev;
      }
      return [...prev, { id, type }];
    });
  };

  const removeFromCart = (id: number, type: 'product' | 'course') => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.type === type)));
  };

  const clearCart = () => setCart([]);

  const getCartCount = () => cart.length;

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
