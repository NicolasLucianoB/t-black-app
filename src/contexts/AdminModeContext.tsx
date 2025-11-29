import React, { createContext, useContext, useState } from 'react';
import { useRole } from './AuthContext';

interface AdminModeContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  canAccessAdminMode: boolean;
}

const AdminModeContext = createContext<AdminModeContextType | undefined>(undefined);

export function AdminModeProvider({ children }: { children: React.ReactNode }) {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const { userRole, isAdmin, isSuperAdmin } = useRole();

  // Só admin e superadmin podem acessar modo admin
  const canAccessAdminMode = isAdmin || isSuperAdmin;

  const toggleAdminMode = () => {
    if (canAccessAdminMode) {
      setIsAdminMode(!isAdminMode);
      console.log(`🔧 Admin mode ${!isAdminMode ? 'ENABLED' : 'DISABLED'} for role: ${userRole}`);
    }
  };

  return (
    <AdminModeContext.Provider
      value={{
        isAdminMode,
        toggleAdminMode,
        canAccessAdminMode,
      }}
    >
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  const context = useContext(AdminModeContext);
  if (context === undefined) {
    throw new Error('useAdminMode must be used within AdminModeProvider');
  }
  return context;
}
