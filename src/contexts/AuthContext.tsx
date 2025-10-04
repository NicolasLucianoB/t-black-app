import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { authService } from '../services/auth';
import { supabase } from '../services/supabase';
import { User } from '../types';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

const AUTH_STORAGE_KEY = 'auth_user';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email || '',
          phone: session.user.user_metadata?.phone || null,
          avatar: session.user.user_metadata?.avatar_url || null,
          createdAt: session.user.created_at,
        };

        setUser(userData);
        await saveUserToStorage(userData);
      } else if (event === 'SIGNED_OUT') {
        // User signed out
        setUser(null);
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
        setUser(JSON.parse(userData));
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

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      setLoading(true);
      const { user: userData, error } = await authService.signIn({ email, password });

      if (error) {
        return { error };
      }

      if (userData) {
        setUser(userData);
        await saveUserToStorage(userData);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
