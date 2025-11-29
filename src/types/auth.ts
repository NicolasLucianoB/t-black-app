import { User } from './user';

export type UserRole = 'client' | 'admin' | 'superadmin';

export interface AuthUser extends User {
  // Campos específicos da sessão de auth
  session_token?: string;
  last_login?: string;
}

// Configuração de emails superadmin
export const SUPERADMIN_EMAILS = [
  'nicolasluciano99@gmail.com', // Seu email principal
  // 'tiago@studiotblack.com', // Email do Tiago (adicionar quando ele for testar)
] as const;

// Função para verificar se email é superadmin
export const isSuperAdminEmail = (email: string): boolean => {
  return SUPERADMIN_EMAILS.includes(email as any);
};

// Função para determinar role baseado no email
export const getUserRoleFromEmail = (email: string): UserRole => {
  if (isSuperAdminEmail(email)) {
    return 'superadmin';
  }
  // Por enquanto, todos os outros são clients
  // Depois implementaremos lógica para promover a admin
  return 'client';
};
