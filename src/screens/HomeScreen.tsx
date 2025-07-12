import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { getCartCount } = useCart();
  
  const handleNavigate = (screenName: string) => {
    try {
      navigation.navigate(screenName);
    } catch (error) {
      console.log('Erro na navegação:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header com ícones */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Studio T Black</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleNavigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleNavigate('Cart')}>
            <Ionicons name="cart-outline" size={24} color="#111" />
            {getCartCount() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getCartCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleNavigate('StudioInfo')}>
            <Ionicons name="information-circle-outline" size={24} color="#111" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.title}>Bem-vindo ao Studio T Black!</Text>
          <Text style={styles.subtitle}>O que você deseja fazer hoje?</Text>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity style={styles.card} onPress={() => handleNavigate('Agendar')}>
            <View style={styles.cardIcon}>
              <Ionicons name="calendar-outline" size={32} color="#111" />
            </View>
            <Text style={styles.cardTitle}>Agendar Horário</Text>
            <Text style={styles.cardSubtitle}>Marque seu horário com nossos barbeiros</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => handleNavigate('Courses')}>
            <View style={styles.cardIcon}>
              <Ionicons name="school-outline" size={32} color="#111" />
            </View>
            <Text style={styles.cardTitle}>Ver Cursos</Text>
            <Text style={styles.cardSubtitle}>Aprenda técnicas profissionais</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => handleNavigate('Products')}>
            <View style={styles.cardIcon}>
              <Ionicons name="bag-outline" size={32} color="#111" />
            </View>
            <Text style={styles.cardTitle}>Comprar Produtos</Text>
            <Text style={styles.cardSubtitle}>Produtos profissionais para cabelo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => handleNavigate('StudioInfo')}>
            <View style={styles.cardIcon}>
              <Ionicons name="business-outline" size={32} color="#111" />
            </View>
            <Text style={styles.cardTitle}>Informações do Studio</Text>
            <Text style={styles.cardSubtitle}>Horários, endereço e contatos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profileButton} onPress={() => handleNavigate('Perfil')}>
            <Ionicons name="person-outline" size={20} color="#111" />
            <Text style={styles.profileButtonText}>Ver Perfil</Text>
          </TouchableOpacity>
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff6b6b',
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
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  profileButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginLeft: 8,
  },
}); 