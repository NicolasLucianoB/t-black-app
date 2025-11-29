import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { usePermissionCheck } from '../components/ProtectedRoute';
import { useAuth, useRole } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// Componente de demonstração do sistema de roles
// Este arquivo pode ser usado como referência para implementar o sistema admin
export function RoleSystemDemo() {
  const { user, userRole, refreshUserRole } = useAuth();
  const { role, isClient, isAdmin, isSuperAdmin, hasPermission } = useRole();
  const { canAccess, canEdit, canDelete } = usePermissionCheck();
  const { colors } = useTheme();

  const showRoleInfo = () => {
    Alert.alert(
      'Informações de Role',
      `Usuário: ${user?.name}\nEmail: ${user?.email}\nRole: ${role}\n\nPermissões:\n- Cliente: ${isClient ? '✅' : '❌'}\n- Admin: ${isAdmin ? '✅' : '❌'}\n- Super Admin: ${isSuperAdmin ? '✅' : '❌'}`,
    );
  };

  const testPermissions = () => {
    const tests = [
      { role: 'client', result: canAccess('client') },
      { role: 'admin', result: canAccess('admin') },
      { role: 'superadmin', result: canAccess('superadmin') },
    ];

    const message = tests.map((test) => `${test.role}: ${test.result ? '✅' : '❌'}`).join('\n');

    Alert.alert('Teste de Permissões', `Acesso permitido para:\n${message}`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
    },
    info: {
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
    },
    infoText: {
      color: colors.text,
      fontSize: 16,
      marginBottom: 5,
    },
    button: {
      backgroundColor: colors.accent,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 10,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    status: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: 10,
      borderRadius: 6,
      marginBottom: 5,
    },
    statusText: {
      color: colors.text,
      fontSize: 14,
    },
    statusValue: {
      color: colors.accent,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sistema de Roles - Demo</Text>

      {/* Informações do Usuário */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usuário Atual</Text>
        <View style={styles.info}>
          <Text style={styles.infoText}>Nome: {user?.name}</Text>
          <Text style={styles.infoText}>Email: {user?.email}</Text>
          <Text style={styles.infoText}>Role: {userRole}</Text>
        </View>
      </View>

      {/* Status das Permissões */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status das Permissões</Text>
        <View style={styles.status}>
          <Text style={styles.statusText}>É Cliente</Text>
          <Text style={styles.statusValue}>{isClient ? '✅ Sim' : '❌ Não'}</Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText}>É Admin</Text>
          <Text style={styles.statusValue}>{isAdmin ? '✅ Sim' : '❌ Não'}</Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText}>É Super Admin</Text>
          <Text style={styles.statusValue}>{isSuperAdmin ? '✅ Sim' : '❌ Não'}</Text>
        </View>
      </View>

      {/* Testes de Acesso */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Testes de Acesso</Text>
        <View style={styles.status}>
          <Text style={styles.statusText}>Pode acessar área Client</Text>
          <Text style={styles.statusValue}>{hasPermission('client') ? '✅ Sim' : '❌ Não'}</Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText}>Pode acessar área Admin</Text>
          <Text style={styles.statusValue}>{hasPermission('admin') ? '✅ Sim' : '❌ Não'}</Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText}>Pode acessar área SuperAdmin</Text>
          <Text style={styles.statusValue}>
            {hasPermission('superadmin') ? '✅ Sim' : '❌ Não'}
          </Text>
        </View>
      </View>

      {/* Operações CRUD */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissões CRUD</Text>
        <View style={styles.status}>
          <Text style={styles.statusText}>Pode editar recursos Client</Text>
          <Text style={styles.statusValue}>{canEdit('client') ? '✅ Sim' : '❌ Não'}</Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText}>Pode editar recursos Admin</Text>
          <Text style={styles.statusValue}>{canEdit('admin') ? '✅ Sim' : '❌ Não'}</Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText}>Pode deletar recursos Client</Text>
          <Text style={styles.statusValue}>{canDelete('client') ? '✅ Sim' : '❌ Não'}</Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText}>Pode deletar recursos Admin</Text>
          <Text style={styles.statusValue}>{canDelete('admin') ? '✅ Sim' : '❌ Não'}</Text>
        </View>
      </View>

      {/* Botões de Ação */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ações</Text>
        <TouchableOpacity style={styles.button} onPress={showRoleInfo}>
          <Text style={styles.buttonText}>Ver Informações Detalhadas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={testPermissions}>
          <Text style={styles.buttonText}>Testar Todas as Permissões</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={refreshUserRole}>
          <Text style={styles.buttonText}>Atualizar Role do Usuário</Text>
        </TouchableOpacity>
      </View>

      {/* Exemplos de Uso */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exemplos de Uso no Código</Text>
        <View style={styles.info}>
          <Text style={styles.infoText}>• useRole() - Hook para verificações rápidas</Text>
          <Text style={styles.infoText}>• usePermissionCheck() - CRUD permissions</Text>
          <Text style={styles.infoText}>• ProtectedRoute - Proteger telas</Text>
          <Text style={styles.infoText}>• AdminRoute / SuperAdminRoute - Atalhos</Text>
        </View>
      </View>
    </ScrollView>
  );
}

// Exemplo de como usar ProtectedRoute em uma tela
export function ExampleAdminScreen() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>
        🎉 Painel Administrativo
      </Text>
      <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
        Só admins e superadmins podem ver isso!
      </Text>
    </View>
  );
}

export function ExampleSuperAdminScreen() {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: 'bold' }}>
        👑 Área Super Administrativa
      </Text>
      <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
        Exclusivo para superadmins!
      </Text>
    </View>
  );
}
