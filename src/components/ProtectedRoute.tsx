import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';

import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  fallbackRoute?: string;
  showAlert?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallbackRoute = '/',
  showAlert = true,
}: ProtectedRouteProps) {
  const { user, loading, hasPermission, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Aguarda carregar

    // Se não estiver autenticado, redireciona para login
    if (!user) {
      router.replace('/login');
      return;
    }

    // Se não tiver permissão, redireciona e opcionalmente mostra alerta
    if (!hasPermission(requiredRole)) {
      if (showAlert) {
        const roleNames = {
          client: 'Cliente',
          admin: 'Administrador',
          superadmin: 'Super Administrador',
        };

        Alert.alert(
          'Acesso Negado',
          `Esta área é restrita para ${roleNames[requiredRole]}s. Seu nível atual: ${roleNames[userRole]}.`,
          [
            {
              text: 'OK',
              onPress: () => router.replace(fallbackRoute),
            },
          ],
        );
      } else {
        router.replace(fallbackRoute);
      }
    }
  }, [user, loading, hasPermission, requiredRole, router, fallbackRoute, showAlert, userRole]);

  // Mostra loading enquanto verifica permissões
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner />
      </View>
    );
  }

  // Se não estiver autenticado ou não tiver permissão, não renderiza nada
  if (!user || !hasPermission(requiredRole)) {
    return null;
  }

  // Se tudo ok, renderiza os children
  return <>{children}</>;
}

// Componentes de conveniência para roles específicos
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="admin" {...props}>
      {children}
    </ProtectedRoute>
  );
}

export function SuperAdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="superadmin" {...props}>
      {children}
    </ProtectedRoute>
  );
}

// Hook para verificar permissões em componentes
export function usePermissionCheck() {
  const { hasPermission, userRole, isClient, isAdmin, isSuperAdmin } = useAuth();

  const canAccess = (requiredRole: UserRole): boolean => {
    return hasPermission(requiredRole);
  };

  const canEdit = (resourceOwnerRole?: UserRole): boolean => {
    // Superadmin pode editar tudo
    if (isSuperAdmin) return true;

    // Admin pode editar recursos de client
    if (isAdmin && (!resourceOwnerRole || resourceOwnerRole === 'client')) return true;

    // Client não pode editar recursos admin
    return false;
  };

  const canDelete = (resourceOwnerRole?: UserRole): boolean => {
    // Apenas superadmin pode deletar recursos admin
    if (resourceOwnerRole === 'admin' || resourceOwnerRole === 'superadmin') {
      return isSuperAdmin;
    }

    // Admin pode deletar recursos de client
    if (isAdmin) return true;

    return false;
  };

  return {
    userRole,
    isClient,
    isAdmin,
    isSuperAdmin,
    canAccess,
    canEdit,
    canDelete,
    hasPermission,
  };
}
