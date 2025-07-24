import { NavigationContainer } from '@react-navigation/native';
import React from 'react';

import { AppProviders } from './src/components/AppProviders';
import RootNavigator from './src/navigation';

export default function App() {
  return (
    <AppProviders>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AppProviders>
  );
}
