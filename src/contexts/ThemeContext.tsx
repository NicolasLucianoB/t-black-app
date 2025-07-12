import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof lightColors | typeof darkColors;
}

const lightColors = {
  primary: '#111',
  secondary: '#666',
  background: '#f7f7f7',
  surface: '#fff',
  border: '#eee',
  text: '#111',
  textSecondary: '#666',
  accent: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  card: '#fff',
  shadow: '#000',
};

const darkColors = {
  primary: '#fff',
  secondary: '#999',
  background: '#000',
  surface: '#111',
  border: '#333',
  text: '#fff',
  textSecondary: '#999',
  accent: '#0A84FF',
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  card: '#1c1c1e',
  shadow: '#000',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    loadThemeMode();
  }, []);

  useEffect(() => {
    const newTheme = themeMode === 'system' ? systemColorScheme || 'light' : themeMode;
    setTheme(newTheme as 'light' | 'dark');
  }, [themeMode, systemColorScheme]);

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.log('Error loading theme mode:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      setThemeModeState(mode);
    } catch (error) {
      console.log('Error saving theme mode:', error);
    }
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}; 