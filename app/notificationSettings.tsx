import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BackHeader from 'src/components/BackHeader';
import { useTheme } from 'src/contexts/ThemeContext';
import { useNotificationPreferences } from 'src/hooks/useNotifications';

export default function NotificationSettingsScreen() {
  const { colors } = useTheme();
  const { preferences, updatePreferences, disableAllNotifications } = useNotificationPreferences();

  const handleToggle = (key: keyof typeof preferences) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  const handleDisableAll = () => {
    Alert.alert(
      'Desativar Todas',
      'Tem certeza que deseja desativar todas as notificações? Você pode perder informações importantes.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desativar',
          style: 'destructive',
          onPress: disableAllNotifications,
        },
      ],
    );
  };

  const settingSections = [
    {
      title: 'Agendamentos',
      items: [
        {
          key: 'bookings' as keyof typeof preferences,
          title: 'Lembretes de Agendamento',
          description: 'Receba lembretes antes dos seus horários marcados',
          icon: 'calendar-outline',
        },
      ],
    },
    {
      title: 'Compras e Cursos',
      items: [
        {
          key: 'courses' as keyof typeof preferences,
          title: 'Cursos e Estudo',
          description: 'Lembretes para estudar e notificações de progresso',
          icon: 'school-outline',
        },
      ],
    },
    {
      title: 'Marketing',
      items: [
        {
          key: 'marketing' as keyof typeof preferences,
          title: 'Dicas e Novidades',
          description: 'Receba dicas, boas-vindas e descobrimento de recursos',
          icon: 'bulb-outline',
        },
        {
          key: 'promotions' as keyof typeof preferences,
          title: 'Promoções',
          description: 'Ofertas especiais, descontos e promoções semanais',
          icon: 'pricetag-outline',
        },
      ],
    },
    {
      title: 'Sistema',
      items: [
        {
          key: 'reminders' as keyof typeof preferences,
          title: 'Lembretes Gerais',
          description: 'Lembretes de inatividade e completar perfil',
          icon: 'time-outline',
        },
        {
          key: 'system' as keyof typeof preferences,
          title: 'Sistema',
          description: 'Atualizações do app e manutenções programadas',
          icon: 'settings-outline',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <BackHeader title="Configurações de Notificações" />

      <ScrollView style={styles.content}>
        <View style={[styles.headerSection, { backgroundColor: colors.card }]}>
          <Ionicons name="notifications" size={32} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Configurações de Notificações
          </Text>
          <Text style={[styles.headerDescription, { color: colors.textSecondary }]}>
            Personalize como e quando você quer ser notificado sobre eventos importantes no T-Black.
          </Text>
        </View>

        {settingSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>

            {section.items.map((item) => (
              <View key={item.key} style={[styles.settingItem, { backgroundColor: colors.card }]}>
                <View style={styles.settingContent}>
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={preferences[item.key] ? colors.primary : colors.textSecondary}
                  />
                  <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                      {item.description}
                    </Text>
                  </View>
                </View>

                <Switch
                  value={preferences[item.key]}
                  onValueChange={() => handleToggle(item.key)}
                  trackColor={{ false: colors.border, true: colors.primary + '40' }}
                  thumbColor={preferences[item.key] ? colors.primary : colors.textSecondary}
                />
              </View>
            ))}
          </View>
        ))}

        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.dangerButton,
              { backgroundColor: colors.error + '20', borderColor: colors.error },
            ]}
            onPress={handleDisableAll}
          >
            <Ionicons name="notifications-off-outline" size={24} color={colors.error} />
            <Text style={[styles.dangerButtonText, { color: colors.error }]}>
              Desativar Todas as Notificações
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View
            style={[
              styles.infoBox,
              { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' },
            ]}
          >
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              As configurações são salvas automaticamente. Você pode alterar suas preferências a
              qualquer momento.
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
  content: {
    flex: 1,
    padding: 16,
  },
  headerSection: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
  },
  headerDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  infoSection: {
    marginTop: 8,
    marginBottom: 32,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 8,
  },
});
