import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BackHeader from '../../src/components/BackHeader';
import { useTheme } from '../../src/contexts/ThemeContext';

const cursos = [
  {
    id: '1',
    nome: 'Curso de Marketing para Barbeiros',
    descricao: 'Aprenda a monetizar mais com seu salão.',
    preco: 99.9,
    videoUrl: 'https://youtu.be/YDfqXjAy5wM',
    comprado: true,
  },
  {
    id: '2',
    nome: 'Como Armar Cachos Afro',
    descricao: 'Domine uma técnica de finalização em 5 passos simples.',
    preco: 149.9,
    videoUrl: 'https://youtu.be/dXrYYzSd2hQ',
    comprado: false,
  },
  {
    id: '3',
    nome: 'Como cortar cabelo Afro',
    descricao: 'Aprenda os fundamentos do corte de cabelo afro.',
    preco: 79.9,
    videoUrl: 'https://youtu.be/B5QOUVO9gQc',
    comprado: true,
  },
];

function getYoutubeThumbnail(url: string) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
  const match = url.match(regex);
  const videoId = match ? match[1] : null;
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return '';
}

export default function MineCoursesTab() {
  const { colors } = useTheme();
  const router = useRouter();

  const cursosComprados = cursos.filter((curso) => curso.comprado);

  function handleAssistirCurso(curso: (typeof cursos)[0]) {
    router.push({
      pathname: '/courseVideo',
      params: { id: curso.id, nome: curso.nome },
    });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <BackHeader title="Meus Cursos" />
      {cursosComprados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Você ainda não adquiriu nenhum curso.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {cursosComprados.map((curso) => (
            <View key={curso.id} style={[styles.card, { backgroundColor: colors.card }]}>
              <Image source={{ uri: getYoutubeThumbnail(curso.videoUrl) }} style={styles.image} />
              <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>{curso.nome}</Text>
                <Text style={[styles.description, { color: colors.text }]} numberOfLines={2}>
                  {curso.descricao}
                </Text>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={() => handleAssistirCurso(curso)}
                >
                  <Text style={[styles.buttonText, { color: colors.background }]}>Assistir</Text>
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
