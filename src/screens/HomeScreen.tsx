import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { getCartCount } = useCart();
  const { colors } = useTheme();
  
  const handleNavigate = (screenName: string) => {
    try {
      navigation.navigate(screenName);
    } catch (error) {
      console.log('Erro na navegação:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header com ícones */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Menu')}>
            <Ionicons name="menu" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Studio T Black</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleNavigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleNavigate('Cart')}>
            <Ionicons name="cart-outline" size={24} color={colors.text} />
            {getCartCount() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getCartCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => handleNavigate('StudioInfo')}>
            <Ionicons name="information-circle-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={[styles.title, { color: colors.text }]}>Bem-vindo ao Studio T Black!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>O que você deseja fazer hoje?</Text>
        </View>

        {/* Card de Agendamento Rápido */}
        <View style={styles.quickBookContainer}>
          <TouchableOpacity style={[styles.quickBookCard, { backgroundColor: colors.card }]} onPress={() => handleNavigate('Agendar')}>
            <View style={styles.quickBookHeader}>
              <Ionicons name="refresh" size={24} color="#25D366" />
              <Text style={[styles.quickBookTitle, { color: colors.text }]}>Agendar Novamente</Text>
            </View>
            <Text style={[styles.lastService, { color: colors.textSecondary }]}>Último: Corte Degradê - Tiago</Text>
            <Text style={[styles.lastDate, { color: colors.textSecondary }]}>15/01/2024 às 14:00</Text>
            <Text style={[styles.quickBookSubtitle, { color: colors.textSecondary }]}>Escolha nova data e horário</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleNavigate('Agendar')}>
            <View style={styles.cardIcon}>
              <Ionicons name="calendar-outline" size={32} color={colors.text} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Agendar Horário</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Marque seu horário com nossos barbeiros</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleNavigate('Courses')}>
            <View style={styles.cardIcon}>
              <Ionicons name="school-outline" size={32} color={colors.text} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Ver Cursos</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Aprenda técnicas profissionais</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleNavigate('Products')}>
            <View style={styles.cardIcon}>
              <Ionicons name="bag-outline" size={32} color={colors.text} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Comprar Produtos</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Produtos profissionais para cabelo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleNavigate('StudioInfo')}>
            <View style={styles.cardIcon}>
              <Ionicons name="business-outline" size={32} color={colors.text} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Informações do Studio</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Horários, endereço e contatos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleNavigate('FAQ')}>
            <View style={styles.cardIcon}>
              <Ionicons name="help-circle-outline" size={32} color={colors.text} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Perguntas Frequentes</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Tire suas dúvidas sobre nossos serviços</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: colors.card }]} onPress={() => handleNavigate('Perfil')}>
            <Ionicons name="person-outline" size={20} color={colors.text} />
            <Text style={[styles.profileButtonText, { color: colors.text }]}>Ver Perfil</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginLeft: 10,
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
  quickBookContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  quickBookCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#25D366',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickBookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickBookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginLeft: 10,
  },
  lastService: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  lastDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  quickBookSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  menuButton: {
    marginRight: 10,
  },
}); 