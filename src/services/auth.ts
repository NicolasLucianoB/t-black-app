// Authentication service using Supabase
// This will handle all auth-related operations

import { User } from '../types';
// import { supabase } from './supabase';

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
    // TODO: Replace with Supabase auth
    // const { data, error } = await supabase.auth.signInWithPassword(credentials);

    // Mock validation
    if (!credentials.email.includes('@')) {
      return { user: null, error: 'Email inválido' };
    }
    if (credentials.password.length < 6) {
      return { user: null, error: 'Senha deve ter pelo menos 6 caracteres' };
    }

    // Mock user
    const mockUser: User = {
      id: '1',
      email: credentials.email,
      name: 'João Doe',
      phone: '(11) 99999-9999',
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    return { user: mockUser, error: null };
  },

  // Sign up with email and password
  async signUp(data: RegisterData): Promise<AuthResponse> {
    // TODO: Replace with Supabase auth
    // const { data: authData, error } = await supabase.auth.signUp({
    //   email: data.email,
    //   password: data.password,
    //   options: {
    //     data: {
    //       name: data.name,
    //       phone: data.phone,
    //     }
    //   }
    // });

    // Mock validation
    if (!data.email.includes('@')) {
      return { user: null, error: 'Email inválido' };
    }
    if (data.password.length < 6) {
      return { user: null, error: 'Senha deve ter pelo menos 6 caracteres' };
    }
    if (!data.name.trim()) {
      return { user: null, error: 'Nome é obrigatório' };
    }

    // Mock user creation
    const mockUser: User = {
      id: '2',
      email: data.email,
      name: data.name,
      phone: data.phone || null,
      avatar: null,
      createdAt: new Date().toISOString(),
    };

    return { user: mockUser, error: null };
  },

  // Sign out
  async signOut(): Promise<{ error: string | null }> {
    // TODO: Replace with Supabase auth
    // const { error } = await supabase.auth.signOut();
    // return { error: error?.message || null };

    return { error: null };
  },

  // Get current session
  async getCurrentUser(): Promise<User | null> {
    // TODO: Replace with Supabase auth
    // const { data: { session } } = await supabase.auth.getSession();
    // return session?.user || null;

    return null;
  },

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<AuthResponse> {
    // TODO: Replace with Supabase auth
    // const { data, error } = await supabase.auth.updateUser({
    //   data: updates
    // });

    return { user: null, error: null };
  },

  // Reset password
  async resetPassword(email: string): Promise<{ error: string | null }> {
    // TODO: Replace with Supabase auth
    // const { error } = await supabase.auth.resetPasswordForEmail(email);
    // return { error: error?.message || null };

    return { error: null };
  },
};
