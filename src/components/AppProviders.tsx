import React from 'react';

import { AdminModeProvider } from '../contexts/AdminModeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { NotificationProvider } from './NotificationProvider';
import StatusBarManager from './StatusBarManager';

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminModeProvider>
          <StatusBarManager />
          <NotificationProvider>
            <CartProvider>{children}</CartProvider>
          </NotificationProvider>
        </AdminModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
