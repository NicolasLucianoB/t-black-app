import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';

import { useTheme } from '../contexts/ThemeContext';

export default function StatusBarManager() {
  const { theme } = useTheme();

  useEffect(() => {
    const barStyle = theme === 'dark' ? 'light-content' : 'dark-content';

    // Força a mudança do status bar
    if (Platform.OS === 'ios') {
      StatusBar.setBarStyle(barStyle, true);
    }
  }, [theme]);

  const barStyle = theme === 'dark' ? 'light-content' : 'dark-content';
  const backgroundColor = theme === 'dark' ? '#18181b' : '#f7f7f7';

  return (
    <StatusBar
      barStyle={barStyle}
      backgroundColor={backgroundColor}
      animated={true}
      translucent={false}
    />
  );
}
