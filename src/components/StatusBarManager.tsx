import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';

import { useTheme } from '../contexts/ThemeContext';

export default function StatusBarManager() {
  const { theme } = useTheme();
  
  useEffect(() => {
    const barStyle = theme === 'dark' ? 'light-content' : 'dark-content';
    console.log('StatusBarManager - Mudando para tema:', theme, 'BarStyle:', barStyle);
    
    // Força a mudança do status bar
    StatusBar.setBarStyle(barStyle, true);
  }, [theme]);

  return (
    <StatusBar 
      barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
      animated={true} 
    />
  );
}
