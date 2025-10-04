import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from 'src/components/AppHeader';
import { useAuth } from 'src/contexts/AuthContext';
import { useTheme } from 'src/contexts/ThemeContext';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/login');
          } catch (error) {
            console.error('Erro ao fazer logout:', error);
            Alert.alert('Erro', 'Não foi possível fazer logout');
          }
        },
      },
    ]);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.card }]}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user?.name ? getInitials(user.name) : 'U'}
              </Text>
            )}
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Usuário'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user?.email || 'usuario@email.com'}
          </Text>
        </View>

        <View
          style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informações Pessoais</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              router.push({
                pathname: '/editProfile',
                params: { userData: JSON.stringify(user) },
              })
            }
          >
            <Text style={[styles.menuItemText, { color: colors.text }]}>Editar Perfil</Text>
            <Text style={[styles.menuItemArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/change-password')}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Alterar Senha</Text>
            <Text style={[styles.menuItemArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notifications')}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Notificações</Text>
            <Text style={[styles.menuItemArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Histórico</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/my-bookings')}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Meus Agendamentos</Text>
            <Text style={[styles.menuItemArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/purchase-history')}
          >
            <Text style={[styles.menuItemText, { color: colors.text }]}>Histórico de Compras</Text>
            <Text style={[styles.menuItemArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/courses/mine')}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Cursos Inscritos</Text>
            <Text style={[styles.menuItemArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[styles.section, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Suporte</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/benefitsClub')}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Seja Parceiro</Text>
            <Text style={[styles.menuItemArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/privacy-policy')}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>
              Política de Privacidade
            </Text>
            <Text style={[styles.menuItemArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/terms-of-use')}>
            <Text style={[styles.menuItemText, { color: colors.text }]}>Termos de Uso</Text>
            <Text style={[styles.menuItemArrow, { color: colors.textSecondary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutButtonText, { color: colors.card }]}>Sair</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 60,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemArrow: {
    fontSize: 18,
  },
  logoutButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    padding: 16,
  },
  versionText: {
    fontSize: 12,
  },
});
