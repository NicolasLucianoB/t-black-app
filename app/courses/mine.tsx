import { useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../src/components/AppHeader';
import { useTheme } from '../../src/contexts/ThemeContext';

const cursos = [
  {
    id: '1',
    nome: 'Curso de Marketing para Barbeiros',
    descricao: 'Aprenda a monetizar mais com seu salão.',
    preco: 99.9,
    imagem: require('../../assets/logo-t-black.png'),
    comprado: true,
  },
  {
    id: '2',
    nome: 'Curso de Finalização de Cachos',
    descricao: 'Domine a arte do cabelo definido e volumoso.',
    preco: 149.9,
    imagem: require('../../assets/logo-t-black.png'),
    comprado: false,
  },
  {
    id: '3',
    nome: 'Curso de Corte Masculino Avançado',
    descricao: 'Aperfeiçoe suas técnicas de corte masculino.',
    preco: 79.9,
    imagem: require('../../assets/logo-t-black.png'),
    comprado: true,
  },
];

export default function MineCoursesTab() {
  const { colors } = useTheme();
  const router = useRouter();

  const cursosComprados = cursos.filter(curso => curso.comprado);

  function handleAssistirCurso(curso: typeof cursos[0]) {
    router.push({
      pathname: '/courseVideo',
      params: { id: curso.id, nome: curso.nome },
    });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Meus Cursos" />
      {cursosComprados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>Você ainda não comprou nenhum curso.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {cursosComprados.map(curso => (
            <View key={curso.id} style={[styles.card, { backgroundColor: colors.card }]}>
              <Image source={{ uri: curso.imagem }} style={styles.image} />
              <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>{curso.nome}</Text>
                <Text style={[styles.description, { color: colors.text }]} numberOfLines={2}>
                  {curso.descricao}
                </Text>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={() => handleAssistirCurso(curso)}
                >
                  <Text style={styles.buttonText}>Assistir</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
  },
  button: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});
