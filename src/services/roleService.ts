import { UserRole, getUserRoleFromEmail } from '../types/auth';
import { supabase } from './supabase';

interface UpdateUserRoleParams {
  userId: string;
  newRole: UserRole;
  updatedBy: string; // ID do admin que fez a alteração
}

interface AuditLogEntry {
  user_id: string;
  action: string;
  table_name: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  performed_by: string;
  timestamp?: string;
}

export const roleService = {
  // Buscar role atual do usuário
  async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data?.user_role || 'client';
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  },

  // Atualizar role do usuário (apenas superadmin pode fazer)
  async updateUserRole({ userId, newRole, updatedBy }: UpdateUserRoleParams): Promise<boolean> {
    try {
      // Primeiro, verificar se quem está fazendo a alteração é superadmin
      const updaterRole = await this.getUserRole(updatedBy);
      if (updaterRole !== 'superadmin') {
        throw new Error('Unauthorized: Only superadmin can change roles');
      }

      // Buscar dados atuais para auditoria
      const { data: currentUser } = await supabase
        .from('users')
        .select('user_role')
        .eq('id', userId)
        .single();

      // Atualizar role
      const { error: updateError } = await supabase
        .from('users')
        .update({
          user_role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Log de auditoria
      await this.createAuditLog({
        user_id: userId,
        action: 'UPDATE_ROLE',
        table_name: 'users',
        old_data: { user_role: currentUser?.user_role },
        new_data: { user_role: newRole },
        performed_by: updatedBy,
      });

      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  },

  // Inicializar role do usuário no primeiro login
  async initializeUserRole(userId: string, email: string): Promise<UserRole> {
    try {
      // Determinar role baseado no email
      const role = getUserRoleFromEmail(email);

      // Atualizar no banco
      const { error } = await supabase
        .from('users')
        .update({
          user_role: role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;

      // Log de auditoria para inicialização
      await this.createAuditLog({
        user_id: userId,
        action: 'INITIALIZE_ROLE',
        table_name: 'users',
        new_data: { user_role: role, email },
        performed_by: 'SYSTEM',
      });

      return role;
    } catch (error) {
      console.error('Error initializing user role:', error);
      return 'client'; // Fallback seguro
    }
  },

  // Criar log de auditoria
  async createAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      const { error } = await supabase.from('audit_logs').insert({
        ...entry,
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Não falhar se não conseguir criar log
    }
  },

  // Listar usuários com suas roles (apenas para admin/superadmin)
  async listUsersWithRoles(requesterId: string): Promise<any[]> {
    try {
      // Verificar permissão
      const requesterRole = await this.getUserRole(requesterId);
      if (!['admin', 'superadmin'].includes(requesterRole || '')) {
        throw new Error('Unauthorized: Insufficient permissions');
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, user_role, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error listing users with roles:', error);
      return [];
    }
  },
};
