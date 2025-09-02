import { Tabs } from 'expo-router';
import { useTheme } from '../../src/contexts/ThemeContext';

export default function CoursesLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="all"
        options={{
          tabBarLabel: 'Todos os Cursos',
          title: 'Todos os Cursos',
        }}
      />
      <Tabs.Screen
        name="mine"
        options={{
          tabBarLabel: 'Meus Cursos',
          title: 'Meus Cursos',
        }}
      />
    </Tabs>
  );
}
