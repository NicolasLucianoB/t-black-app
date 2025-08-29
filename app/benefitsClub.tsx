import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AppHeader from 'src/components/AppHeader';
import { useTheme } from 'src/contexts/ThemeContext';

interface Partner {
  id: string;
  name: string;
  logo: any;
  level: 'gold' | 'silver' | 'bronze';
  description: string;
  benefits: string[];
}

const partners: Partner[] = [
  {
    id: '1',
    name: 'Onda dos Cachos',
    logo: require('assets/logo-t-black.png'),
    level: 'gold',
    description: 'Especialistas em cabelos cacheados e crespos',
    benefits: ['Logo em destaque', 'Divulgação prioritária', 'Desconto especial para clientes'],
  },
  {
    id: '2',
    name: 'Aline Almeida Estilo',
    logo: require('assets/logo-t-black.png'),
    level: 'gold',
    description: 'Consultoria de estilo e moda masculina',
    benefits: ['Logo em destaque', 'Divulgação prioritária', 'Desconto especial para clientes'],
  },
  {
    id: '3',
    name: 'Creche Éden Lar',
    logo: require('assets/logo-t-black.png'),
    level: 'silver',
    description: 'Educação infantil de qualidade',
    benefits: ['Logo média', 'Divulgação regular', 'Desconto para clientes'],
  },
  {
    id: '4',
    name: 'Evanilson Estevan Consultoria',
    logo: require('assets/logo-t-black.png'),
    level: 'bronze',
    description: 'Consultoria empresarial e financeira',
    benefits: ['Logo pequena', 'Divulgação básica', 'Desconto básico para clientes'],
  },
];

const getLevelInfo = (level: string) => {
  switch (level) {
    case 'gold':
      return { color: '#FFD700', title: 'Parceiro Ouro', size: 80 };
    case 'silver':
      return { color: '#C0C0C0', title: 'Parceiro Prata', size: 60 };
    case 'bronze':
      return { color: '#CD7F32', title: 'Parceiro Bronze', size: 50 };
    default:
      return { color: '#666', title: 'Parceiro', size: 50 };
  }
};

export default function BenefitsClubScreen() {
  const { colors, themeMode } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Clube de Benefícios Studio T.Black</Text>
          <Text style={styles.subtitle}>
            Nossos parceiros que oferecem benefícios exclusivos para você
          </Text>
        </View>

        {/* Níveis de Parceria */}
        <View style={styles.levelsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Níveis de Parceria</Text>
          <View style={styles.levelsContainer}>
            <View style={styles.levelCard}>
              <View style={[styles.levelIcon, { backgroundColor: '#FFD700' }]}>
                <Ionicons name="star" size={24} color="#fff" />
              </View>
              <Text style={[styles.levelTitle, { color: colors.text }]}>Ouro</Text>
              <Text style={[styles.levelDescription, { color: colors.textSecondary }]}>
                Máxima divulgação e benefícios
              </Text>
            </View>
            <View style={styles.levelCard}>
              <View style={[styles.levelIcon, { backgroundColor: '#C0C0C0' }]}>
                <Ionicons name="star" size={20} color="#fff" />
              </View>
              <Text style={[styles.levelTitle, { color: colors.text }]}>Prata</Text>
              <Text style={[styles.levelDescription, { color: colors.textSecondary }]}>
                Divulgação média e benefícios
              </Text>
            </View>
            <View style={styles.levelCard}>
              <View style={[styles.levelIcon, { backgroundColor: '#CD7F32' }]}>
                <Ionicons name="star" size={16} color="#fff" />
              </View>
              <Text style={[styles.levelTitle, { color: colors.text }]}>Bronze</Text>
              <Text style={[styles.levelDescription, { color: colors.textSecondary }]}>
                Divulgação básica e benefícios
              </Text>
            </View>
          </View>
        </View>

        {/* Parceiros */}
        <View style={styles.partnersSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Nossos Parceiros</Text>
          {partners.map((partner) => {
            const levelInfo = getLevelInfo(partner.level);
            return (
              <View key={partner.id} style={[styles.partnerCard, { backgroundColor: colors.card }]}>
                <View style={styles.partnerHeader}>
                  <Image
                    source={partner.logo}
                    style={[styles.partnerLogo, { width: levelInfo.size, height: levelInfo.size }]}
                  />
                  <View style={styles.partnerInfo}>
                    <Text style={[styles.partnerName, { color: colors.text }]}>{partner.name}</Text>
                    <View style={[styles.levelBadge, { backgroundColor: levelInfo.color }]}>
                      <Text style={styles.levelBadgeText}>{levelInfo.title}</Text>
                    </View>
                  </View>
                </View>
                <Text style={[styles.partnerDescription, { color: colors.textSecondary }]}>
                  {partner.description}
                </Text>
                <View style={styles.benefitsContainer}>
                  {partner.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={[styles.benefitText, { color: colors.textSecondary }]}>
                        {benefit}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        {/* Botão de Parceria */}
        <View style={[styles.partnershipSection, { backgroundColor: colors.surface }]}>
          <Text style={[styles.partnershipTitle, { color: colors.text }]}>
            Quer ser nosso parceiro?
          </Text>
          <Text style={[styles.partnershipDescription, { color: colors.textSecondary }]}>
            Junte-se ao nosso clube de benefícios e ofereça vantagens exclusivas para nossos
            clientes
          </Text>
          <TouchableOpacity
            style={[
              styles.partnershipButton,
              { backgroundColor: themeMode === 'light' ? '#000' : '#fff' },
            ]}
          >
            <Ionicons
              name="people-outline"
              size={20}
              color={themeMode === 'light' ? '#fff' : '#000'}
            />
            <Text
              style={[
                styles.partnershipButtonText,
                { color: themeMode === 'light' ? '#fff' : '#000' },
              ]}
            >
              Fazer parte
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#111',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  levelsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  levelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  levelCard: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  levelIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  partnersSection: {
    padding: 20,
  },
  partnerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  partnerLogo: {
    borderRadius: 8,
    marginRight: 16,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  partnerDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  benefitsContainer: {
    marginTop: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 8,
  },
  partnershipSection: {
    padding: 20,
    alignItems: 'center',
    margin: 20,
    borderRadius: 12,
  },
  partnershipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  partnershipDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  partnershipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  partnershipButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
