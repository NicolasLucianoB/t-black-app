import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from 'src/components/AppHeader';
import { useAuth } from 'src/contexts/AuthContext';
import { useTheme } from 'src/contexts/ThemeContext';
import { authService } from 'src/services';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

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

  const handleAvatarPress = () => {
    const options = user?.avatar
      ? ['Editar Foto', 'Remover Foto', 'Cancelar']
      : ['Adicionar Foto', 'Cancelar'];

    const cancelButtonIndex = options.length - 1;
    const destructiveButtonIndex = user?.avatar ? 1 : undefined;

    Alert.alert('Avatar', 'O que deseja fazer?', [
      {
        text: user?.avatar ? 'Editar Foto' : 'Adicionar Foto',
        onPress: handleChangeAvatar,
      },
      ...(user?.avatar
        ? [
            {
              text: 'Remover Foto',
              style: 'destructive' as const,
              onPress: handleRemoveAvatar,
            },
          ]
        : []),
      {
        text: 'Cancelar',
        style: 'cancel' as const,
      },
    ]);
  };

  const handleChangeAvatar = async () => {
    if (!user?.id) return;

    setUpdatingAvatar(true);
    try {
      // Pick image from gallery
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('Erro', 'Permissão para acessar a galeria é necessária!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const imageUri = result.assets[0].uri;
      const fileName = result.assets[0].fileName || 'avatar.jpg';

      // Import storage service
      const { storageService } = await import('src/services/storage');

      // Upload using the correct method with user folder structure
      const uploadResult = await storageService.uploadAvatar(user.id, imageUri, fileName);
      if (uploadResult.error) {
        Alert.alert('Erro', uploadResult.error);
        return;
      }

      if (uploadResult.url) {
        // Update user profile with new avatar URL
        const updateResult = await authService.updateProfile({ avatar: uploadResult.url });

        if (updateResult.error) {
          Alert.alert('Erro', updateResult.error);
        } else {
          Alert.alert('Sucesso', 'Avatar atualizado com sucesso!');
          // The user context should be updated automatically via auth state changes
        }
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      Alert.alert('Erro', 'Erro ao atualizar avatar');
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id || !user?.avatar) return;

    setUpdatingAvatar(true);
    try {
      // Update user profile to remove avatar URL
      const updateResult = await authService.updateProfile({ avatar: null });

      if (updateResult.error) {
        Alert.alert('Erro', updateResult.error);
      } else {
        Alert.alert('Sucesso', 'Avatar removido com sucesso!');

        // Optional: Also delete the file from storage
        const { storageService } = await import('src/services/storage');
        await storageService.deleteFile('avatars', `${user.id}/avatar.jpg`);
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      Alert.alert('Erro', 'Erro ao remover avatar');
    } finally {
      setUpdatingAvatar(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.avatarContainer, { backgroundColor: colors.card }]}
            onPress={handleAvatarPress}
            disabled={updatingAvatar}
          >
            {updatingAvatar ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user?.name ? getInitials(user.name) : 'U'}
              </Text>
            )}
            {/* Camera icon overlay */}
            <View style={[styles.cameraIconContainer, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={20} color={colors.card} />
            </View>
          </TouchableOpacity>
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
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/bookings')}>
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
    paddingTop: 40,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
