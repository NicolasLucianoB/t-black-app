import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from 'src/contexts/ThemeContext';

export default function ThemeSettingsScreen() {
  const { themeMode, setThemeMode, colors } = useTheme();
  const router = useRouter();

  const themeOptions = [
    {
      id: 'light',
      title: 'Claro',
      description: 'Tema claro para uso durante o dia',
      icon: 'sunny-outline',
      color: '#FF9500',
    },
    {
      id: 'dark',
      title: 'Escuro',
      description: 'Tema escuro para uso noturno',
      icon: 'moon-outline',
      color: '#5856D6',
    },
    {
      id: 'system',
      title: 'Automático',
      description: 'Segue as configurações do sistema',
      icon: 'settings-outline',
      color: '#34C759',
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tema</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Escolha o tema do aplicativo
          </Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            O tema afeta a aparência de todo o aplicativo
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: themeMode === option.id ? colors.accent : colors.border,
                },
              ]}
              onPress={() => setThemeMode(option.id as any)}
            >
              <View style={styles.optionContent}>
                <View style={[styles.iconContainer, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon as any} size={24} color={option.color} />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                  <Text style={[styles.optionDescription, { color: colors.textSecondary }]}>
                    {option.description}
                  </Text>
                </View>
                {themeMode === option.id && (
                  <View style={[styles.checkmark, { backgroundColor: colors.accent }]}>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoSection}>
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              O tema automático segue as configurações do seu dispositivo. Se você alterar o tema do
              sistema, o aplicativo será atualizado automaticamente.
            </Text>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
});
