import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { databaseService } from '../../src/services';
import { Course } from '../../src/types';

// Cursos agora vêm do Supabase

function getYoutubeThumbnail(url: string): string {
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/;
  const match = url.match(regex);
  const videoId = match ? match[1] : '';
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function TodosCursosTab() {
  const { colors } = useTheme();

  const [cursos, setCursos] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar cursos do Supabase
  useEffect(() => {
    const loadCursos = async () => {
      try {
        setLoading(true);
        const data = await databaseService.courses.getAll();
        setCursos(data);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        setError('Não foi possível carregar os cursos');
        Alert.alert('Erro', 'Não foi possível carregar os cursos');
      } finally {
        setLoading(false);
      }
    };

    loadCursos();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <BackHeader title="Todos os Cursos" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 16 }}>Carregando cursos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || cursos.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <BackHeader title="Todos os Cursos" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: colors.text, fontSize: 18, textAlign: 'center' }}>
            {error || 'Nenhum curso disponível no momento'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <BackHeader title="Todos os Cursos" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {cursos.map((curso) => (
          <View key={curso.id} style={[styles.card, { backgroundColor: colors.card }]}>
            <Image
              source={{ uri: getYoutubeThumbnail(curso.videoUrl || '') }}
              style={styles.image}
              resizeMode="contain"
            />
            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.text }]}>{curso.title}</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>
                {curso.description}
              </Text>
              {/* <Text
                style={[styles.price, { color: colors.primary }]}
              >{`R$ ${curso.price.toFixed(2)}`}</Text> */}
              {/* {isInCart(curso) ? (
                <TouchableOpacity
                  style={[styles.button, styles.removeButton]}
                  onPress={() => handleRemoveFromCart(curso)}
                >
                  <Text style={styles.buttonText}>Remover do Carrinho</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.button, styles.addButton]}
                  onPress={() => handleAddToCart(curso)}
                >
                  <Text style={styles.buttonText}>Adicionar ao Carrinho</Text>
                </TouchableOpacity>
              )} */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                // onPress={} // Adicione lógica se necessário
              >
                <Text style={[styles.buttonText, { color: colors.background }]}>
                  Resgatar Curso
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
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
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    marginVertical: 4,
    fontSize: 14,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  removeButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    fontWeight: 'bold',
  },
});
