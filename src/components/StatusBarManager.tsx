import React from 'react';
import { StatusBar } from 'react-native';

import { useTheme } from '../contexts/ThemeContext';

export default function StatusBarManager() {
  const { theme } = useTheme();

  return (
    <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} animated={true} />
  );
}
