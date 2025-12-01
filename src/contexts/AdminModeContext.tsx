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
  const { role, isAdmin, isSuperAdmin } = useRole();

  // SEGURANÇA CRÍTICA: Só admin e superadmin podem acessar modo admin
  // Verificação DUPLA por segurança
  const canAccessAdminMode =
    (role === 'admin' || role === 'superadmin') && (isAdmin || isSuperAdmin);

  const toggleAdminMode = () => {
    if (canAccessAdminMode) {
      setIsAdminMode(!isAdminMode);
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
