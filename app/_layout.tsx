import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { AppProviders } from 'src/components/AppProviders';

export default function RootLayout() {
  const theme = useColorScheme();

  return (
    <AppProviders>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme === 'dark' ? '#000' : '#fff'}
      />
      <Stack
        screenOptions={{
          gestureEnabled: true, // Ativa gesto de swipe para voltar
          headerShown: false, // (opcional) oculta o cabeçalho padrão
        }}
      />
    </AppProviders>
  );
}
