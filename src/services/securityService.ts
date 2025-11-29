import { UserRole } from '../types/auth';
import { supabase } from './supabase';

interface SecurityTestResult {
  test: string;
  passed: boolean;
  error?: string;
  details?: any;
}

export const securityService = {
  // Testar se RLS está funcionando corretamente
  async testRLSPolicies(currentUserId: string): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    try {
      // Teste 1: Verificar se usuário consegue ver apenas seus dados
      const userTest = await this.testUserDataAccess(currentUserId);
      results.push(userTest);

      // Teste 2: Verificar se usuário consegue ver agendamentos apenas próprios
      const bookingsTest = await this.testBookingAccess(currentUserId);
      results.push(bookingsTest);

      // Teste 3: Verificar se usuário consegue ver pedidos apenas próprios
      const ordersTest = await this.testOrderAccess(currentUserId);
      results.push(ordersTest);

      // Teste 4: Verificar se dados públicos são acessíveis
      const publicDataTest = await this.testPublicDataAccess();
      results.push(publicDataTest);

      return results;
    } catch (error) {
      return [
        {
          test: 'RLS Security Test',
          passed: false,
          error: `Security test failed: ${error}`,
        },
      ];
    }
  },

  // Testar acesso a dados do usuário
  async testUserDataAccess(userId: string): Promise<SecurityTestResult> {
    try {
      // Tentar buscar dados do usuário atual (deve funcionar)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, user_role')
        .eq('id', userId);

      if (userError) {
        return {
          test: 'User Data Access',
          passed: false,
          error: userError.message,
        };
      }

      // Tentar buscar dados de TODOS os usuários (deve falhar para client)
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, email, user_role');

      const userRole = userData?.[0]?.user_role;
      const shouldSeeAllUsers = ['admin', 'superadmin'].includes(userRole || '');
      const actuallySeesAllUsers = (allUsers?.length || 0) > 1;

      return {
        test: 'User Data Access',
        passed: shouldSeeAllUsers === actuallySeesAllUsers,
        details: {
          userRole,
          shouldSeeAll: shouldSeeAllUsers,
          actuallySeesAll: actuallySeesAllUsers,
          usersCount: allUsers?.length || 0,
        },
      };
    } catch (error) {
      return {
        test: 'User Data Access',
        passed: false,
        error: `Error: ${error}`,
      };
    }
  },

  // Testar acesso a agendamentos
  async testBookingAccess(userId: string): Promise<SecurityTestResult> {
    try {
      const { data: bookings, error } = await supabase.from('bookings').select('id, user_id');

      if (error) {
        return {
          test: 'Booking Access',
          passed: false,
          error: error.message,
        };
      }

      // Verificar se todos os agendamentos pertencem ao usuário atual
      // (exceto se for admin/superadmin)
      const userRole = await this.getCurrentUserRole(userId);
      const isAdmin = ['admin', 'superadmin'].includes(userRole || '');

      const allBelongToUser = bookings?.every((b) => b.user_id === userId) || false;
      const shouldSeeOnlyOwn = !isAdmin;

      return {
        test: 'Booking Access',
        passed: shouldSeeOnlyOwn ? allBelongToUser : true,
        details: {
          userRole,
          isAdmin,
          shouldSeeOnlyOwn,
          allBelongToUser,
          bookingsCount: bookings?.length || 0,
        },
      };
    } catch (error) {
      return {
        test: 'Booking Access',
        passed: false,
        error: `Error: ${error}`,
      };
    }
  },

  // Testar acesso a pedidos
  async testOrderAccess(userId: string): Promise<SecurityTestResult> {
    try {
      const { data: orders, error } = await supabase.from('orders').select('id, user_id');

      if (error) {
        return {
          test: 'Order Access',
          passed: false,
          error: error.message,
        };
      }

      const userRole = await this.getCurrentUserRole(userId);
      const isAdmin = ['admin', 'superadmin'].includes(userRole || '');

      const allBelongToUser = orders?.every((o) => o.user_id === userId) || false;
      const shouldSeeOnlyOwn = !isAdmin;

      return {
        test: 'Order Access',
        passed: shouldSeeOnlyOwn ? allBelongToUser : true,
        details: {
          userRole,
          isAdmin,
          shouldSeeOnlyOwn,
          allBelongToUser,
          ordersCount: orders?.length || 0,
        },
      };
    } catch (error) {
      return {
        test: 'Order Access',
        passed: false,
        error: `Error: ${error}`,
      };
    }
  },

  // Testar acesso a dados públicos
  async testPublicDataAccess(): Promise<SecurityTestResult> {
    try {
      // Todos devem conseguir ver produtos, cursos, serviços e barbeiros
      const [products, courses, services, barbers] = await Promise.all([
        supabase.from('products').select('id').limit(1),
        supabase.from('courses').select('id').limit(1),
        supabase.from('services').select('id').limit(1),
        supabase.from('barbers').select('id').limit(1),
      ]);

      const allSuccessful = [products, courses, services, barbers].every((result) => !result.error);

      return {
        test: 'Public Data Access',
        passed: allSuccessful,
        details: {
          products: !products.error,
          courses: !courses.error,
          services: !services.error,
          barbers: !barbers.error,
        },
      };
    } catch (error) {
      return {
        test: 'Public Data Access',
        passed: false,
        error: `Error: ${error}`,
      };
    }
  },

  // Obter role do usuário atual
  async getCurrentUserRole(userId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_role')
        .eq('id', userId)
        .single();

      if (error) return null;
      return data?.user_role || 'client';
    } catch {
      return null;
    }
  },

  // Verificar se usuário tem permissão para ação específica
  hasPermission(userRole: UserRole | null, requiredRole: UserRole): boolean {
    if (!userRole) return false;

    const roleHierarchy: Record<UserRole, number> = {
      client: 1,
      admin: 2,
      superadmin: 3,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  },

  // Gerar relatório de segurança completo
  async generateSecurityReport(userId: string): Promise<{
    overall: 'PASS' | 'FAIL';
    tests: SecurityTestResult[];
    userRole: UserRole | null;
    timestamp: string;
  }> {
    const tests = await this.testRLSPolicies(userId);
    const userRole = await this.getCurrentUserRole(userId);
    const allPassed = tests.every((test) => test.passed);

    return {
      overall: allPassed ? 'PASS' : 'FAIL',
      tests,
      userRole,
      timestamp: new Date().toISOString(),
    };
  },
};
