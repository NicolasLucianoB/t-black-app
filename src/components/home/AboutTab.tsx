import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'src/contexts/ThemeContext';

interface AboutTabProps {
  onNavigate: (screenName: string, params?: any) => void;
}

export function AboutTab({ onNavigate }: AboutTabProps) {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Nossa História */}
      <Section
        icon="book-outline"
        title="Nossa História"
        placeholder="História do Studio T. Black será adicionada aqui..."
        colors={colors}
      />

      {/* Missão */}
      <Section
        icon="flag-outline"
        title="Missão"
        placeholder="Nossa missão será adicionada aqui..."
        colors={colors}
      />

      {/* Visão */}
      <Section
        icon="eye-outline"
        title="Visão"
        placeholder="Nossa visão será adicionada aqui..."
        colors={colors}
      />

      {/* Valores */}
      <Section
        icon="heart-outline"
        title="Valores"
        placeholder="Nossos valores serão adicionados aqui..."
        colors={colors}
      />

      {/* Links de Navegação */}
      <View style={styles.linksContainer}>
        <LinkCard
          icon="business"
          title="Saiba mais sobre o Studio"
          subtitle="Conheça nossa estrutura e localização"
          onPress={() => onNavigate('/studioInfo')}
          colors={colors}
        />

        <LinkCard
          icon="people"
          title="Conheça nossa equipe de profissionais"
          subtitle="Veja quem cuida do seu visual"
          onPress={() => onNavigate('booking', { screen: 'Profissionais' })}
          colors={colors}
        />
      </View>
    </ScrollView>
  );
}

interface SectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  placeholder: string;
  colors: any;
}

function Section({ icon, title, placeholder, colors }: SectionProps) {
  return (
    <View style={[styles.section, { backgroundColor: colors.card }]}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={24} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <Text style={[styles.sectionPlaceholder, { color: colors.textSecondary }]}>
        {placeholder}
      </Text>
    </View>
  );
}

interface LinkCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  colors: any;
}

function LinkCard({ icon, title, subtitle, onPress, colors }: LinkCardProps) {
  return (
    <TouchableOpacity style={[styles.linkCard, { backgroundColor: colors.card }]} onPress={onPress}>
      <View style={[styles.linkIconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <View style={styles.linkContent}>
        <Text style={[styles.linkTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.linkSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionPlaceholder: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  linksContainer: {
    marginTop: 8,
    gap: 16,
    marginBottom: 24,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  linkIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  linkSubtitle: {
    fontSize: 13,
  },
});
