// Test screen for push notifications
import React from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import Button from '../src/components/Button';
import { useTheme } from '../src/contexts/ThemeContext';
import { useAdvancedNotifications } from '../src/hooks/useAdvancedNotifications';

export default function NotificationTestScreen() {
  const { colors } = useTheme();
  const { isReady, permission, token, firebaseToken, lastNotification, notifications } =
    useAdvancedNotifications();

  const showStatus = () => {
    const status = isReady ? '✅ Ativas' : '❌ Inativas';
    const tokenInfo = token ? `Token: ${token.substring(0, 20)}...` : 'Sem token';

    Alert.alert(
      'Status das Notificações',
      `Status: ${status}\nPermissão: ${permission}\n${tokenInfo}`,
    );
  };

  const testNotifications = [
    {
      title: 'Teste Básico',
      action: () => notifications.sendTest(),
      description: 'Notificação de teste simples',
    },
    {
      title: 'Boas-vindas',
      action: () => notifications.sendWelcome(),
      description: 'Sequência de boas-vindas',
    },
    {
      title: 'Lembrete de Agendamento',
      action: () =>
        notifications.scheduleBookingReminder('booking123', '2024-12-01', '14:00', 'Tiago'),
      description: 'Lembrete 30min antes do horário',
    },
    {
      title: 'Novo Produto',
      action: () => notifications.sendProductUpdate('Pomada Premium'),
      description: 'Produto adicionado ao carrinho',
    },
    {
      title: 'Curso Atualizado',
      action: () => notifications.sendCourseUpdate('Cortes Modernos', 75),
      description: 'Progresso do curso (75%)',
    },
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          color: colors.text,
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        🔔 Teste de Notificações
      </Text>

      {/* Status Card */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: isReady ? '#4CAF50' : '#FF5722',
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: 10,
          }}
        >
          Status do Sistema
        </Text>

        <Text style={{ color: colors.text, marginBottom: 5 }}>🔐 Permissão: {permission}</Text>

        <Text style={{ color: colors.text, marginBottom: 5 }}>
          📱 Token Expo: {token ? '✅' : '❌'}
        </Text>

        <Text style={{ color: colors.text, marginBottom: 15 }}>
          🔥 Firebase: {firebaseToken ? '✅' : '❌'}
        </Text>

        {lastNotification && (
          <Text
            style={{
              color: colors.primary,
              fontSize: 12,
              fontStyle: 'italic',
            }}
          >
            Última: {lastNotification.request.content.title}
          </Text>
        )}
      </View>

      <Button title="📊 Ver Status Detalhado" onPress={showStatus} style={{ marginBottom: 20 }} />

      {/* Test Buttons */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: colors.text,
          marginBottom: 15,
        }}
      >
        Testes Disponíveis
      </Text>

      {testNotifications.map((test, index) => (
        <View
          key={index}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 8,
            padding: 15,
            marginBottom: 10,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: colors.text,
              marginBottom: 5,
            }}
          >
            {test.title}
          </Text>

          <Text
            style={{
              color: colors.secondary,
              fontSize: 14,
              marginBottom: 10,
            }}
          >
            {test.description}
          </Text>

          <Button
            title={`Testar ${test.title}`}
            onPress={async () => {
              try {
                await test.action();
                Alert.alert('✅ Sucesso', 'Notificação enviada!');
              } catch (error) {
                Alert.alert('❌ Erro', 'Falha ao enviar notificação');
                console.error(error);
              }
            }}
            disabled={!isReady}
          />
        </View>
      ))}

      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 8,
          padding: 15,
          marginTop: 20,
          marginBottom: 40,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            color: colors.secondary,
            textAlign: 'center',
          }}
        >
          ℹ️ Para testar notificações push completas,{'\n'}
          use um dispositivo físico (não simulador)
        </Text>
      </View>
    </ScrollView>
  );
}
