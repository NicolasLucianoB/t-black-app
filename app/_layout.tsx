import { Stack } from 'expo-router';
import React from 'react';
import { AppProviders } from 'src/components/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack
        screenOptions={{
          gestureEnabled: true, // Ativa gesto de swipe para voltar
          headerShown: false, // (opcional) oculta o cabeçalho padrão
        }}
      />
    </AppProviders>
  );
}
