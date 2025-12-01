// Authentication service using Supabase
// This will handle all auth-related operations

import { User } from '../types';
import { getUserRoleFromEmail } from '../types/auth';
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
        // Buscar dados completos da tabela users
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (dbError || !userData) {
          // Fallback para user metadata se não encontrar na tabela
          const user: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.email || '',
            phone: data.user.user_metadata?.phone || null,
            avatar: data.user.user_metadata?.avatar_url || null,
            user_role: getUserRoleFromEmail(data.user.email || ''),
            createdAt: data.user.created_at,
          };
          return { user, error: null };
        }

        const user: User = {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          avatar: userData.avatar,
          user_role: userData.user_role,
          createdAt: userData.created_at,
          updatedAt: userData.updated_at,
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
      console.log('🚀 Starting signUp for:', data.email);

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

      console.log('📡 Supabase auth response:', { user: !!authData?.user, error: error?.message });

      if (error) {
        console.error('❌ Supabase auth error:', error);
        return { user: null, error: error.message };
      }

      if (authData.user) {
        // Inserir manualmente na tabela users (sem RLS, sem trigger, SEM DRAMA!)
        const userRole = getUserRoleFromEmail(authData.user.email || '');
        console.log('✅ User role determined:', userRole, 'for email:', authData.user.email);

        const { error: dbError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: authData.user.email || '',
          name: data.name,
          phone: data.phone || null,
          avatar: null,
          user_role: userRole,
        });

        if (dbError) {
          console.error('💥 Database error:', dbError);
          return { user: null, error: 'Database error saving new user' };
        }

        console.log('🎉 User successfully created in both auth and public tables!');

        const user: User = {
          id: authData.user.id,
          email: authData.user.email || '',
          name: data.name,
          phone: data.phone || null,
          avatar: null,
          user_role: userRole,
          createdAt: authData.user.created_at,
        };

        console.log('✅ User created successfully:', user.email, 'Role:', user.user_role);
        return { user, error: null };
      }

      return { user: null, error: 'Erro ao criar usuário' };
    } catch (error) {
      console.error('💥 Catch error in signUp:', error);
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
        // Buscar dados completos da tabela users
        const { data: userData, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error || !userData) {
          // Fallback para user metadata se não encontrar na tabela
          return {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email || '',
            phone: session.user.user_metadata?.phone || null,
            avatar: session.user.user_metadata?.avatar_url || null,
            user_role: getUserRoleFromEmail(session.user.email || ''),
            createdAt: session.user.created_at,
          };
        }

        return {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          phone: userData.phone,
          avatar: userData.avatar,
          user_role: userData.user_role,
          createdAt: userData.created_at,
          updatedAt: userData.updated_at,
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
        // Também atualizar na tabela users
        await supabase
          .from('users')
          .update({
            name: updates.name,
            phone: updates.phone,
            avatar: updates.avatar,
            updated_at: new Date().toISOString(),
          })
          .eq('id', data.user.id);

        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email || '',
          phone: data.user.user_metadata?.phone || null,
          avatar: data.user.user_metadata?.avatar_url || null,
          user_role: getUserRoleFromEmail(data.user.email || ''),
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
