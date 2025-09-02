import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import AppHeader from 'src/components/AppHeader';
import { useTheme } from 'src/contexts/ThemeContext';

const cursos = [
  {
    id: '1',
    titulo: 'Curso de Marketing para Barbeiros',
    instrutor: 'Tiago T. Black',
    duracao: '4h 30min',
    aulas: 12,
    descricao: 'Aprenda a monetizar mais com seu salão.',
    videoUrl: 'https://youtu.be/YDfqXjAy5wM',
  },
  {
    id: '2',
    titulo: 'Como Armar Cachos Afro',
    instrutor: 'Tiago T. Black',
    duracao: '5h 15min',
    aulas: 15,
    descricao: 'Domine uma técnica de finalização em 5 passos simples.',
    videoUrl: 'https://youtu.be/dXrYYzSd2hQ',
  },
  {
    id: '3',
    titulo: 'Como cortar cabelo Afro',
    instrutor: 'Tiago T. Black',
    duracao: '3h 45min',
    aulas: 10,
    descricao: 'Aprenda os fundamentos do corte de cabelo afro.',
    videoUrl: 'https://youtu.be/B5QOUVO9gQc',
  },
];

export default function CourseVideoScreen() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const courseId = Array.isArray(id) ? id[0] : id;

  const curso = cursos.find((c) => c.id === courseId);

  if (!curso) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 18, color: colors.text }}>Curso não encontrado</Text>
      </View>
    );
  }

  const getVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : 'dQw4w9WgXcQ';
  };

  const videoId = getVideoId(curso.videoUrl);
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader />
      <View style={styles.videoContainer}>
        <WebView
          source={{ uri: embedUrl }}
          style={styles.video}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={[styles.courseInfo, { backgroundColor: colors.card }]}>
          <Text style={[styles.courseTitle, { color: colors.text }]}>{curso.titulo}</Text>
          <Text style={[styles.courseInstructor, { color: colors.textSecondary }]}>
            Instrutor: {curso.instrutor}
          </Text>
          <Text style={[styles.courseDuration, { color: colors.textSecondary }]}>
            {curso.duracao} • {curso.aulas} aulas
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Descrição</Text>
          <Text style={[styles.courseDescription, { color: colors.textSecondary }]}>
            {curso.descricao}
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Conteúdo do Curso</Text>
          <View style={styles.lessonList}>
            <View style={styles.lessonItem}>
              <Text
                style={[
                  styles.lessonNumber,
                  { backgroundColor: colors.primary, color: colors.background },
                ]}
              >
                1
              </Text>
              <Text style={[styles.lessonTitle, { color: colors.text }]}>Introdução ao Curso</Text>
              <Text style={[styles.lessonDuration, { color: colors.textSecondary }]}>15min</Text>
            </View>
            <View style={styles.lessonItem}>
              <Text
                style={[
                  styles.lessonNumber,
                  { backgroundColor: colors.primary, color: colors.background },
                ]}
              >
                2
              </Text>
              <Text style={[styles.lessonTitle, { color: colors.text }]}>
                Ferramentas Necessárias
              </Text>
              <Text style={[styles.lessonDuration, { color: colors.textSecondary }]}>20min</Text>
            </View>
            <View style={styles.lessonItem}>
              <Text
                style={[
                  styles.lessonNumber,
                  { backgroundColor: colors.primary, color: colors.background },
                ]}
              >
                3
              </Text>
              <Text style={[styles.lessonTitle, { color: colors.text }]}>Técnicas Básicas</Text>
              <Text style={[styles.lessonDuration, { color: colors.textSecondary }]}>45min</Text>
            </View>
            <View style={styles.lessonItem}>
              <Text
                style={[
                  styles.lessonNumber,
                  { backgroundColor: colors.primary, color: colors.background },
                ]}
              >
                4
              </Text>
              <Text style={[styles.lessonTitle, { color: colors.text }]}>Prática Guiada</Text>
              <Text style={[styles.lessonDuration, { color: colors.textSecondary }]}>60min</Text>
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recursos</Text>
          <View style={styles.resourcesList}>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceIcon}>📄</Text>
              <Text style={[styles.resourceText, { color: colors.text }]}>
                Material de Apoio (PDF)
              </Text>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceIcon}>📋</Text>
              <Text style={[styles.resourceText, { color: colors.text }]}>
                Lista de Ferramentas
              </Text>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceIcon}>🎯</Text>
              <Text style={[styles.resourceText, { color: colors.text }]}>Exercícios Práticos</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  courseInfo: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  courseInstructor: {
    fontSize: 16,
    marginBottom: 4,
  },
  courseDuration: {
    fontSize: 14,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  courseDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  lessonList: {
    gap: 12,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lessonNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 12,
  },
  lessonTitle: {
    flex: 1,
    fontSize: 16,
  },
  lessonDuration: {
    fontSize: 14,
  },
  resourcesList: {
    gap: 12,
  },
  resourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  resourceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  resourceText: {
    fontSize: 16,
  },
});
