import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from 'src/contexts/CartContext';
import { useTheme } from 'src/contexts/ThemeContext';

export default function MenuScreen() {
  const { getCartCount } = useCart();
  const { colors } = useTheme();
  const router = useRouter();

  const navigateToTab = (screenName: string) => {
    router.back();
    setTimeout(() => {
      router.push('/tab-navigator/' + screenName.toLowerCase());
    }, 100);
  };

  const menuItems = [
    {
      id: 'notifications',
      title: 'Notificações',
      icon: 'notifications-outline',
      color: '#007AFF',
      onPress: () => router.push('/notifications'),
    },
    {
      id: 'cart',
      title: 'Carrinho',
      icon: 'cart-outline',
      color: '#FF9500',
      onPress: () => router.push('/cart'),
      hasBadge: true,
    },
    {
      id: 'studio-info',
      title: 'Informações do Studio',
      icon: 'information-circle-outline',
      color: '#34C759',
      onPress: () => router.push('/studioInfo'),
    },
    {
      id: 'faq',
      title: 'Perguntas Frequentes',
      icon: 'help-circle-outline',
      color: '#5856D6',
      onPress: () => router.push('/faq'),
    },
    {
      id: 'profile',
      title: 'Meu Perfil',
      icon: 'person-outline',
      color: '#FF3B30',
      onPress: () => router.push('/tabs/profile'),
    },
    {
      id: 'bookings',
      title: 'Meus Agendamentos',
      icon: 'calendar-outline',
      color: '#AF52DE',
      onPress: () => router.push('/bookings'),
    },
    {
      id: 'courses',
      title: 'Meus Cursos',
      icon: 'school-outline',
      color: '#FF6B6B',
      onPress: () => router.push('/courses/mine'),
    },
    {
      id: 'purchases',
      title: 'Histórico de Compras',
      icon: 'bag-outline',
      color: '#FF9500',
      onPress: () => router.push('/purchase-history'),
    },
    {
      id: 'help',
      title: 'Clube de benefícios',
      icon: 'people-outline',
      color: '#FFD700',
      onPress: () => router.push('/benefitsClub'),
    },
    {
      id: 'privacy',
      title: 'Política de Privacidade',
      icon: 'shield-outline',
      color: '#34C759',
      onPress: () => router.push('/privacy-policy'),
    },
    {
      id: 'terms',
      title: 'Termos de Uso',
      icon: 'document-text-outline',
      color: '#007AFF',
      onPress: () => router.push('/terms-of-use'),
    },
    {
      id: 'theme',
      title: 'Tema',
      icon: 'color-palette-outline',
      color: '#FF6B6B',
      onPress: () => router.push('/themeSettings'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>Menu</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { backgroundColor: colors.card }]}
              onPress={item.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
                {item.id === 'cart' && getCartCount() > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{getCartCount()}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.menuItemTitle, { color: colors.text }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  menuItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
});
