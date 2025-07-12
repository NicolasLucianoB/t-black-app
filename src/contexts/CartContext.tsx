import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  getCartItems: () => CartItem[];
  getProductCount: () => number;
  getCourseCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (id: number, type: 'product' | 'course') => {
    console.log('Adicionando ao carrinho:', { id, type });
    setCart(prev => {
      // Para cursos, verificar se já existe no carrinho
      if (type === 'course') {
        const cursoJaExiste = prev.some(item => item.id === id && item.type === 'course');
        console.log('Verificando se curso já existe:', cursoJaExiste);
        if (cursoJaExiste) {
          console.log('Curso já existe no carrinho, não adicionando novamente');
          return prev;
        }
      }
      
      const newCart = [...prev, { id, type }];
      console.log('Novo carrinho:', newCart);
      return newCart;
    });
  };

  const removeFromCart = (id: number, type: 'product' | 'course') => {
    console.log('Removendo do carrinho:', { id, type });
    setCart(prev => {
      const index = prev.findIndex(item => item.id === id && item.type === type);
      if (index !== -1) {
        const newCart = prev.filter((_, i) => i !== index);
        console.log('Novo carrinho após remoção:', newCart);
        return newCart;
      }
      return prev;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartCount = () => {
    return cart.length;
  };

  const getCartItems = () => {
    return cart;
  };

  const getProductCount = () => {
    return cart.filter(item => item.type === 'product').length;
  };

  const getCourseCount = () => {
    return cart.filter(item => item.type === 'course').length;
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getCartCount,
    getCartItems,
    getProductCount,
    getCourseCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 