import React, { createContext, useContext, useEffect, useState } from 'react';
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

  // SEGURANÇA CRÍTICA: Resetar modo admin quando usuário não tem mais permissão
  useEffect(() => {
    if (!canAccessAdminMode && isAdminMode) {
      console.log('🔒 SEGURANÇA: Desabilitando modo admin - usuário sem permissão');
      setIsAdminMode(false);
    }
  }, [canAccessAdminMode, isAdminMode]);

  // SEGURANÇA CRÍTICA: Resetar modo admin quando role mudar
  useEffect(() => {
    console.log('🔄 Role changed:', role, '- Resetando modo admin');
    setIsAdminMode(false);
  }, [role]);

  const toggleAdminMode = () => {
    if (canAccessAdminMode) {
      setIsAdminMode(!isAdminMode);
    } else {
      console.warn('⚠️ SEGURANÇA: Tentativa de acesso ao modo admin negada');
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
