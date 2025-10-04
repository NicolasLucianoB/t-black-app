// Authentication service using Supabase
// This will handle all auth-related operations

import { User } from '../types';
import { supabase } from './supabase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

// Mock implementation - will be replaced with Supabase
export const authService = {
  // Sign in with email and password
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email || '',
          phone: data.user.user_metadata?.phone || null,
          avatar: data.user.user_metadata?.avatar_url || null,
          createdAt: data.user.created_at,
        };
        return { user, error: null };
      }

      return { user: null, error: 'Erro desconhecido' };
    } catch (error) {
      return { user: null, error: 'Erro de conexão' };
    }
  },

  // Sign up with email and password
  async signUp(data: RegisterData): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (authData.user) {
        const user: User = {
          id: authData.user.id,
          email: authData.user.email || '',
          name: data.name,
          phone: data.phone || null,
          avatar: null,
          createdAt: authData.user.created_at,
        };
        return { user, error: null };
      }

      return { user: null, error: 'Erro ao criar usuário' };
    } catch (error) {
      return { user: null, error: 'Erro de conexão' };
    }
  },

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      return { error: error?.message || null };
    } catch (error) {
      return { error: 'Erro de conexão' };
    }
  },

  // Get current session
  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        return {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email || '',
          phone: session.user.user_metadata?.phone || null,
          avatar: session.user.user_metadata?.avatar_url || null,
          createdAt: session.user.created_at,
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  },

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: updates.name,
          phone: updates.phone,
          avatar_url: updates.avatar,
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email || '',
          phone: data.user.user_metadata?.phone || null,
          avatar: data.user.user_metadata?.avatar_url || null,
          createdAt: data.user.created_at,
        };
        return { user, error: null };
      }

      return { user: null, error: 'Erro ao atualizar perfil' };
    } catch (error) {
      return { user: null, error: 'Erro de conexão' };
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error: error?.message || null };
    } catch (error) {
      return { error: 'Erro de conexão' };
    }
  },

  // Sign in with Google
  async signInWithGoogle(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'exp://127.0.0.1:19000/--/auth/callback',
        },
      });
      return { error: error?.message || null };
    } catch (error) {
      return { error: 'Erro de conexão' };
    }
  },
};
