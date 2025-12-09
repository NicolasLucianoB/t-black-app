import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import AppHeader from 'src/components/AppHeader';
import { AboutTab, HomeMainTab } from 'src/components/home';
import { useTheme } from 'src/contexts/ThemeContext';
import { useMarketingNotifications } from 'src/hooks/useNotifications';

const Tab = createMaterialTopTabNavigator();

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { initializeWelcomeFlow } = useMarketingNotifications();

  // Initialize welcome notifications for new users
  React.useEffect(() => {
    initializeWelcomeFlow();
  }, []);

  const handleNavigate = (screenName: string) => {
    try {
      router.push(screenName as any);
    } catch (error) {
      console.log('Erro na navegação:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarIndicatorStyle: [styles.tabBarIndicator, { backgroundColor: colors.primary }],
          tabBarStyle: [
            styles.tabBarStyle,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ],
          tabBarLabelStyle: styles.tabBarLabelStyle,
        }}
      >
        <Tab.Screen name="Início">{() => <HomeMainTab onNavigate={handleNavigate} />}</Tab.Screen>
        <Tab.Screen name="Quem Somos">{() => <AboutTab onNavigate={handleNavigate} />}</Tab.Screen>
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBarIndicator: {
    height: 3,
    borderRadius: 3,
  },
  tabBarStyle: {
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
  },
  tabBarLabelStyle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'none',
  },
});
