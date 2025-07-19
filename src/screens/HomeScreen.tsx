import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { getCartCount } = useCart();
  const { colors, theme } = useTheme();
  const iconColor = '#111';
  
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
      <AppHeader navigation={navigation} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={[styles.title, { color: colors.text }]}>Bem-vindo ao Studio T Black!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>O que você deseja fazer hoje?</Text>
        </View>

        {/* Card de Agendamento Rápido */}
        <View style={styles.quickBookContainer}>
          <View style={[styles.quickBookSection, { backgroundColor: colors.card }]}> 
            <View style={[styles.quickBookHeader, { flexDirection: 'row', alignItems: 'center', marginBottom: 8 }]}> 
              <Ionicons name="flash" size={20} color="#25D366" />
              <Text style={[styles.quickBookTitle, { color: colors.text, fontSize: 16, fontWeight: 'bold', marginLeft: 8 }]}>Agendamento Rápido</Text>
            </View>
            <TouchableOpacity style={[styles.quickBookCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'transparent', borderRadius: 8, padding: 12, marginBottom: 8 }]} onPress={() => handleNavigate('Agendar')}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.quickBookService, { color: colors.text, fontSize: 14, fontWeight: 'bold' }]}>Corte Degradê - Tiago</Text>
                <Text style={[styles.quickBookDate, { color: colors.textSecondary, fontSize: 12 }]}>Último: 15/01/2024 às 14:00</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardsContainer}>
          <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleNavigate('Agendar')}>
            <View style={styles.cardIcon}>
              <Ionicons name="calendar-outline" size={32} color={iconColor} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Agendar Horário</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Marque seu horário com nossos barbeiros</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleNavigate('Courses')}>
            <View style={styles.cardIcon}>
              <Ionicons name="school-outline" size={32} color={iconColor} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Ver Cursos</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Aprenda técnicas profissionais</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleNavigate('Products')}>
            <View style={styles.cardIcon}>
              <Ionicons name="bag-outline" size={32} color={iconColor} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Comprar Produtos</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Produtos profissionais para cabelo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleNavigate('StudioInfo')}>
            <View style={styles.cardIcon}>
              <Ionicons name="business-outline" size={32} color={iconColor} />
            </View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Informações do Studio</Text>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>Horários, endereço e contatos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={() => handleNavigate('FAQ')}>
            <View style={styles.cardIcon}>
              <Ionicons name="help-circle-outline" size={32} color={iconColor} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  quickBookSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  quickBookInfo: {
    flex: 1,
  },
  quickBookService: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickBookDate: {
    fontSize: 14,
  },
  menuButton: {
    marginRight: 10,
  },
}); 