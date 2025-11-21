import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BackHeader from '../src/components/BackHeader';
import { useTheme } from '../src/contexts/ThemeContext';
import { notificationManager } from '../src/services/notificationManager';
import { notificationService } from '../src/services/notifications';

const notifications = [
  { id: '1', title: 'Bem-vindo ao T-Black!', description: 'Estamos felizes em tê-lo conosco.' },
  {
    id: '2',
    title: 'Nova aula disponível',
    description: 'Confira a nova aula no curso de React Native.',
  },
  {
    id: '3',
    title: 'Atualização de perfil',
    description: 'Seu perfil foi atualizado com sucesso.',
  },
];

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const [pushToken, setPushToken] = useState<string | null>(null);

  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      const token = await notificationService.registerForPushNotifications();
      setPushToken(token);
      console.log('Push token:', token);
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const testLocalNotification = async () => {
    try {
      await notificationService.scheduleLocalNotification({
        title: 'Teste T-Black! 🎉',
        body: 'Notificação local funcionando perfeitamente!',
        data: { screen: 'notifications' },
      });
      Alert.alert('Sucesso', 'Notificação local enviada!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar notificação');
    }
  };

  const testScheduledNotification = async () => {
    try {
      await notificationService.scheduleLocalNotification(
        {
          title: 'Lembrete T-Black ⏰',
          body: 'Esta é uma notificação agendada para 5 segundos!',
          data: { screen: 'home' },
        },
        5,
      );
      Alert.alert('Sucesso', 'Notificação agendada para 5 segundos!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao agendar notificação');
    }
  };

  // Smart notification tests
  const testBookingReminder = async () => {
    try {
      await notificationManager.notifyBookingConfirmed('João Silva', '2024-01-15', '14:30');
      Alert.alert('Sucesso', 'Notificação de agendamento enviada!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar notificação de agendamento');
    }
  };

  const testCartNotification = async () => {
    try {
      await notificationManager.notifyItemAddedToCart('Curso de Marketing', 'course');
      Alert.alert('Sucesso', 'Notificação de carrinho enviada!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar notificação de carrinho');
    }
  };

  const testWelcomeFlow = async () => {
    try {
      await notificationManager.scheduleWelcomeSequence();
      Alert.alert('Sucesso', 'Sequência de boas-vindas agendada!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao agendar sequência de boas-vindas');
    }
  };

  const testSpecialOffer = async () => {
    try {
      await notificationManager.notifySpecialOffer(20, 'products');
      Alert.alert('Sucesso', 'Notificação de oferta especial enviada!');
    } catch (error) {
      Alert.alert('Erro', 'Falha ao enviar oferta especial');
    }
  };

  const renderItem = ({ item }: { item: { id: string; title: string; description: string } }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.notificationDescription, { color: colors.textSecondary }]}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <BackHeader />

      {/* Push Token Info */}
      <View style={[styles.tokenContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.tokenTitle, { color: colors.text }]}>Push Token Status:</Text>
        <Text style={[styles.tokenText, { color: pushToken ? '#4CAF50' : '#F44336' }]}>
          {pushToken ? '✅ Registrado' : '❌ Não registrado'}
        </Text>
      </View>

      {/* Test Buttons */}
      <ScrollView style={styles.testSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>🧪 Testes Básicos</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#007AFF' }]}
            onPress={testLocalNotification}
          >
            <Text style={[styles.testButtonText, { color: '#FFFFFF' }]}>Imediata</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#34C759' }]}
            onPress={testScheduledNotification}
          >
            <Text style={[styles.testButtonText, { color: '#FFFFFF' }]}>Agendada (5s)</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          ⚡ Notificações Inteligentes
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#FF6B6B' }]}
            onPress={testBookingReminder}
          >
            <Text style={[styles.testButtonText, { color: '#FFFFFF' }]}>📅 Agendamento</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#FF9500' }]}
            onPress={testCartNotification}
          >
            <Text style={[styles.testButtonText, { color: '#FFFFFF' }]}>🛒 Carrinho</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#5856D6' }]}
            onPress={testWelcomeFlow}
          >
            <Text style={[styles.testButtonText, { color: '#FFFFFF' }]}>👋 Boas-vindas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: '#AF52DE' }]}
            onPress={testSpecialOffer}
          >
            <Text style={[styles.testButtonText, { color: '#FFFFFF' }]}>🎉 Oferta 20%</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tokenContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tokenTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 14,
    fontWeight: '500',
  },
  testSection: {
    padding: 16,
    gap: 12,
  },
  testButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
});
