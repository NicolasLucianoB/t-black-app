import React from 'react';
import { CartProvider } from '../contexts/CartContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import StatusBarManager from './StatusBarManager';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <StatusBarManager />
      <CartProvider>{children}</CartProvider>
    </ThemeProvider>
  );
}
