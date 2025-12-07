import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { authService } from '../services/auth';
import { roleService } from '../services/roleService';
import { supabase } from '../services/supabase';
import { User } from '../types';
import { UserRole, getUserRoleFromEmail, isSuperAdminEmail } from '../types/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  isAuthenticated: boolean;

  // Role management
  userRole: UserRole;
  isClient: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  hasPermission: (requiredRole: UserRole) => boolean;
  refreshUserRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook específico para roles (mais conveniente para uso em componentes)
export const useRole = () => {
  const { userRole, isClient, isAdmin, isSuperAdmin, hasPermission } = useAuth();

  return {
    role: userRole,
    isClient,
    isAdmin,
    isSuperAdmin,
    hasPermission,
  };
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const AUTH_STORAGE_KEY = 'auth_user';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('client');

  // Load user from storage on app start and set up auth listener
  useEffect(() => {
    loadUserFromStorage();

    // Listen for auth changes (important for OAuth)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('Auth state changed:', event, session?.user?.email);

      if (session?.user && event === 'SIGNED_IN') {
        // User signed in via OAuth or other method
        console.log('📧 DEBUG - Auth state change SIGNED_IN for:', session.user.email);

        // Buscar dados completos da tabela users (incluindo avatar)
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Buscar role correto do banco de dados
        let correctRole: UserRole = 'client';
        try {
          const roleFromDB = await roleService.getUserRole(session.user.id);
          console.log('🔍 DEBUG - Role from DB in auth listener:', roleFromDB);

          if (roleFromDB) {
            correctRole = roleFromDB;
          } else {
            correctRole = getUserRoleFromEmail(session.user.email || '');
          }
        } catch (error) {
          console.error('❌ DEBUG - Error getting role in auth listener:', error);
          correctRole = getUserRoleFromEmail(session.user.email || '');
        }

        // Se conseguiu buscar da tabela users, use esses dados (mais completos)
        const userData: User =
          dbUser && !dbError
            ? {
                id: dbUser.id,
                email: dbUser.email,
                name: dbUser.name,
                phone: dbUser.phone,
                avatar: dbUser.avatar, // ✅ Avatar vem da tabela users
                user_role: correctRole,
                createdAt: dbUser.created_at,
                updatedAt: dbUser.updated_at,
              }
            : {
                // Fallback para user_metadata se não encontrar na tabela
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.email || '',
                phone: session.user.user_metadata?.phone || null,
                avatar: session.user.user_metadata?.avatar_url || null,
                user_role: correctRole,
                createdAt: session.user.created_at,
              };

        console.log('✅ DEBUG - User data loaded with avatar:', userData.avatar);
        setUser(userData);
        await saveUserToStorage(userData);

        // Definir role correto
        setUserRole(correctRole);
        console.log('✅ DEBUG - Role set in auth listener:', correctRole);
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        setUser(null);
        setUserRole('client'); // Reset role
        await saveUserToStorage(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Carregar role do usuário
        if (parsedUser.email) {
          console.log('🔍 DEBUG - User email:', parsedUser.email);
          console.log('🔍 DEBUG - User ID:', parsedUser.id);
          console.log('🔍 DEBUG - isSuperAdminEmail check:', isSuperAdminEmail(parsedUser.email));

          // SEMPRE buscar role do banco primeiro
          try {
            const roleFromDB = await roleService.getUserRole(parsedUser.id);
            console.log('🔍 DEBUG - Role from DB:', roleFromDB);

            if (roleFromDB) {
              setUserRole(roleFromDB);
              console.log('✅ DEBUG - Role set from DB:', roleFromDB);
            } else {
              // Fallback para email apenas se não houver no banco
              const roleFromEmail = getUserRoleFromEmail(parsedUser.email);
              setUserRole(roleFromEmail);
              console.log('⚠️ DEBUG - Role set from email fallback:', roleFromEmail);
            }
          } catch (error) {
            console.error('❌ DEBUG - Error getting role from DB:', error);
            const roleFromEmail = getUserRoleFromEmail(parsedUser.email);
            setUserRole(roleFromEmail);
            console.log('🔄 DEBUG - Role set from email after error:', roleFromEmail);
          }
        }
      }
    } catch (error) {
      console.log('Error loading user from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserToStorage = async (userData: User | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.log('Error saving user to storage:', error);
    }
  };

  // Funções de verificação de role
  const isClient = userRole === 'client';
  const isAdmin = userRole === 'admin' || userRole === 'superadmin';
  const isSuperAdmin = userRole === 'superadmin';

  // Verificar se usuário tem permissão para determinada role
  const hasPermission = (requiredRole: UserRole): boolean => {
    const roleHierarchy: Record<UserRole, number> = {
      client: 1,
      admin: 2,
      superadmin: 3,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

  // Atualizar role do usuário (buscar no banco)
  const refreshUserRole = async (): Promise<void> => {
    if (!user) {
      setUserRole('client');
      return;
    }

    try {
      console.log('🔄 DEBUG - Refreshing role for user:', user.email, 'ID:', user.id);

      // SEMPRE buscar role do banco primeiro
      const roleFromDB = await roleService.getUserRole(user.id);
      console.log('🔍 DEBUG - Role from DB on refresh:', roleFromDB);

      if (roleFromDB) {
        setUserRole(roleFromDB);
        console.log('✅ DEBUG - Role refreshed from DB:', roleFromDB);
      } else {
        // Fallback para email apenas se não houver no banco
        const roleFromEmail = getUserRoleFromEmail(user.email);
        setUserRole(roleFromEmail);
        console.log('⚠️ DEBUG - Role refreshed from email fallback:', roleFromEmail);
      }
    } catch (error) {
      console.error('❌ DEBUG - Error refreshing role:', error);
      // Em caso de erro, usar role baseado no email
      const roleFromEmail = getUserRoleFromEmail(user.email);
      setUserRole(roleFromEmail);
      console.log('🔄 DEBUG - Role set from email after refresh error:', roleFromEmail);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      setLoading(true);
      const { user: userData, error } = await authService.signIn({ email, password });

      if (error) {
        return { error };
      }

      if (userData) {
        console.log('👤 DEBUG - User data after login:', {
          id: userData.id,
          email: userData.email,
          avatar: userData.avatar,
          hasAvatar: !!userData.avatar,
        });
        setUser(userData);
        await saveUserToStorage(userData);

        // Definir role do usuário imediatamente após login
        console.log('🔑 DEBUG - Setting role after login for:', userData.email);
        try {
          const roleFromDB = await roleService.getUserRole(userData.id);
          console.log('🔍 DEBUG - Role from DB after login:', roleFromDB);

          if (roleFromDB) {
            setUserRole(roleFromDB);
            console.log('✅ DEBUG - Role set after login:', roleFromDB);
          } else {
            const roleFromEmail = getUserRoleFromEmail(userData.email);
            setUserRole(roleFromEmail);
            console.log('⚠️ DEBUG - Role set from email after login:', roleFromEmail);
          }
        } catch (error) {
          console.error('❌ DEBUG - Error setting role after login:', error);
          const roleFromEmail = getUserRoleFromEmail(userData.email);
          setUserRole(roleFromEmail);
          console.log('🔄 DEBUG - Role set from email fallback after login:', roleFromEmail);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: 'Erro interno do servidor' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }): Promise<{ error: string | null }> => {
    try {
      setLoading(true);
      const { user: userData, error } = await authService.signUp(data);

      if (error) {
        return { error };
      }

      if (userData) {
        setUser(userData);
        await saveUserToStorage(userData);

        // Inicializar role do usuário
        await refreshUserRole();
      }

      return { error: null };
    } catch (error) {
      return { error: 'Erro interno do servidor' };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
      setUserRole('client'); // Reset role
      await saveUserToStorage(null);
    } catch (error) {
      console.log('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ error: string | null }> => {
    try {
      const { user: updatedUser, error } = await authService.updateProfile(updates);

      if (error) {
        return { error };
      }

      if (updatedUser) {
        setUser(updatedUser);
        await saveUserToStorage(updatedUser);
      }

      return { error: null };
    } catch (error) {
      return { error: 'Erro ao atualizar perfil' };
    }
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    try {
      return await authService.resetPassword(email);
    } catch (error) {
      return { error: 'Erro ao enviar email de recuperação' };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    isAuthenticated: !!user,

    // Role management
    userRole,
    isClient,
    isAdmin,
    isSuperAdmin,
    hasPermission,
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
