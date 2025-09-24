import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackHeader from '../src/components/BackHeader';
import { useTheme } from '../src/contexts/ThemeContext';

const notifications = [
  { id: '1', title: 'Bem-vindo ao T-Black!', description: 'Estamos felizes em tê-lo conosco.' },
  {
    id: '2',
    title: 'Nova aula disponível',
    description: 'Confira a nova aula no curso de React Native.',
  },
  {
    id: '3',
    title: 'Atualização de perfil',
    description: 'Seu perfil foi atualizado com sucesso.',
  },
];

export default function NotificationsScreen() {
  const { colors } = useTheme();

  const renderItem = ({ item }: { item: { id: string; title: string; description: string } }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.notificationDescription, { color: colors.textSecondary }]}>
        {item.description}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <BackHeader />
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
  },
});
