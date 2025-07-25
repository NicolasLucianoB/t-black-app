import { Slot } from 'expo-router';
import React from 'react';
import { AppProviders } from '../src/components/AppProviders';

export default function RootLayout() {
  return (
    <AppProviders>
      <Slot />
    </AppProviders>
  );
}