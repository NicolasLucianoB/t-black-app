import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';

export default function MenuScreen({ navigation }: any) {
  const { getCartCount } = useCart();

  const navigateToTab = (screenName: string) => {
    navigation.goBack();
    setTimeout(() => {
      navigation.navigate('TabNavigator', { screen: screenName });
    }, 100);
  };

  const menuItems = [
    {
      id: 'notifications',
      title: 'Notificações',
      icon: 'notifications-outline',
      color: '#007AFF',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      id: 'cart',
      title: 'Carrinho',
      icon: 'cart-outline',
      color: '#FF9500',
      badge: getCartCount(),
      onPress: () => navigation.navigate('Cart'),
    },
    {
      id: 'studio-info',
      title: 'Informações do Studio',
      icon: 'information-circle-outline',
      color: '#34C759',
      onPress: () => navigation.navigate('StudioInfo'),
    },
    {
      id: 'faq',
      title: 'Perguntas Frequentes',
      icon: 'help-circle-outline',
      color: '#5856D6',
      onPress: () => navigation.navigate('FAQ'),
    },
    {
      id: 'profile',
      title: 'Meu Perfil',
      icon: 'person-outline',
      color: '#FF3B30',
      onPress: () => navigateToTab('Perfil'),
    },
    {
      id: 'bookings',
      title: 'Meus Agendamentos',
      icon: 'calendar-outline',
      color: '#AF52DE',
      onPress: () => navigation.navigate('MyBookings'),
    },
    {
      id: 'courses',
      title: 'Meus Cursos',
      icon: 'school-outline',
      color: '#FF6B6B',
      onPress: () => navigation.navigate('MyCourses'),
    },
    {
      id: 'purchases',
      title: 'Histórico de Compras',
      icon: 'bag-outline',
      color: '#FF9500',
      onPress: () => navigation.navigate('PurchaseHistory'),
    },
    {
      id: 'help',
      title: 'Ajuda',
      icon: 'help-buoy-outline',
      color: '#5856D6',
      onPress: () => navigation.navigate('Help'),
    },
    {
      id: 'privacy',
      title: 'Política de Privacidade',
      icon: 'shield-outline',
      color: '#34C759',
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
    {
      id: 'terms',
      title: 'Termos de Uso',
      icon: 'document-text-outline',
      color: '#007AFF',
      onPress: () => navigation.navigate('TermsOfUse'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menu</Text>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="#111" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
                {item.badge && item.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
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