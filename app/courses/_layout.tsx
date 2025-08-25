import { Tabs } from 'expo-router';

export default function CoursesLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="all" options={{ tabBarLabel: 'Todos os Cursos' }} />
      <Tabs.Screen name="mine" options={{ tabBarLabel: 'Meus Cursos' }} />
    </Tabs>
  );
}
