import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AppHeader from '../components/AppHeader';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

const Tab = createMaterialTopTabNavigator();

// Mock de cursos
const cursos = [
  {
    id: 1,
    titulo: 'Corte Masculino Moderno',
    instrutor: 'Tiago',
    preco: 89.9,
    descricao:
      'Aprenda técnicas modernas de corte masculino, incluindo degradê, undercut e texturização.',
    duracao: '2h 30min',
    aulas: 8,
    imagem: 'https://via.placeholder.com/300x200/111/fff?text=Corte+Masculino',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    comprado: false,
  },
  {
    id: 2,
    titulo: 'Barba e Acabamentos',
    instrutor: 'Lucas',
    preco: 69.9,
    descricao: 'Domine as técnicas de barbearia, desde o básico até acabamentos profissionais.',
    duracao: '1h 45min',
    aulas: 6,
    imagem: 'https://via.placeholder.com/300x200/111/fff?text=Barba',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    comprado: true,
  },
  {
    id: 3,
    titulo: 'Colorimetria Avançada',
    instrutor: 'Rafael',
    preco: 129.9,
    descricao: 'Técnicas avançadas de coloração, correção de cor e tendências atuais.',
    duracao: '3h 15min',
    aulas: 12,
    imagem: 'https://via.placeholder.com/300x200/111/fff?text=Colorimetria',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    comprado: false,
  },
  {
    id: 4,
    titulo: 'Atendimento ao Cliente',
    instrutor: 'Tiago',
    preco: 49.9,
    descricao: 'Como criar uma experiência excepcional para seus clientes e fidelizá-los.',
    duracao: '1h 20min',
    aulas: 4,
    imagem: 'https://via.placeholder.com/300x200/111/fff?text=Atendimento',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    comprado: true,
  },
];

function TodosCursosTab({ navigation }: any) {
  const { cart, addToCart, removeFromCart } = useCart();

  const handleAdicionarCurso = (curso: any) => {
    console.log('Tentando adicionar curso:', curso.id);
    console.log('Carrinho atual:', cart);
    addToCart(curso.id, 'course');
    Alert.alert('Sucesso!', `"${curso.titulo}" adicionado ao carrinho!`, [{ text: 'OK' }]);
  };

  const estaNoCarrinho = (cursoId: number) => {
    const result = cart.some((item) => item.id === cursoId && item.type === 'course');
    console.log(`Curso ${cursoId} está no carrinho:`, result);
    return result;
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {cursos.map((curso) => (
        <View key={curso.id} style={styles.courseCard}>
          <Image source={{ uri: curso.imagem }} style={styles.courseImage} />
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>{curso.titulo}</Text>
            <Text style={styles.courseInstructor}>Instrutor: {curso.instrutor}</Text>
            <Text style={styles.courseDescription}>{curso.descricao}</Text>
            <Text style={styles.courseDuration}>
              {curso.duracao} • {curso.aulas} aulas
            </Text>
            <View style={styles.courseActions}>
              <Text style={styles.coursePrice}>R$ {curso.preco.toFixed(2)}</Text>
              {estaNoCarrinho(curso.id) ? (
                <View style={styles.inCartContainer}>
                  <Text style={styles.inCartText}>No Carrinho</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromCart(curso.id, 'course')}
                  >
                    <Text style={styles.removeButtonText}>Remover</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => handleAdicionarCurso(curso)}
                >
                  <Text style={styles.buyButtonText}>Adicionar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function MeusCursosTab({ navigation }: any) {
  const cursosComprados = cursos.filter((curso) => curso.comprado);

  const handleAssistirCurso = (curso: any) => {
    navigation.navigate('CourseVideo', { curso });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {cursosComprados.length > 0 ? (
        cursosComprados.map((curso) => (
          <TouchableOpacity
            key={curso.id}
            style={styles.courseCard}
            onPress={() => handleAssistirCurso(curso)}
          >
            <Image source={{ uri: curso.imagem }} style={styles.courseImage} />
            <View style={styles.courseInfo}>
              <Text style={styles.courseTitle}>{curso.titulo}</Text>
              <Text style={styles.courseInstructor}>Instrutor: {curso.instrutor}</Text>
              <Text style={styles.courseDuration}>
                {curso.duracao} • {curso.aulas} aulas
              </Text>
              <TouchableOpacity style={styles.watchButton}>
                <Text style={styles.watchButtonText}>▶ Assistir</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Você ainda não comprou nenhum curso</Text>
          <Text style={styles.emptySubtext}>
            Explore os cursos disponíveis na aba "Todos os Cursos"
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

export default function CoursesScreen({ navigation }: any) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader navigation={navigation} title="Cursos" />
      <View style={styles.header}>
        <Text style={styles.title}>Cursos</Text>
        <Text style={styles.subtitle}>Aprenda com os melhores profissionais</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#111',
          tabBarInactiveTintColor: '#666',
          tabBarIndicatorStyle: { backgroundColor: '#111' },
          tabBarLabelStyle: { fontWeight: 'bold' },
          tabBarStyle: { backgroundColor: '#fff' },
        }}
      >
        <Tab.Screen
          name="TodosCursos"
          component={TodosCursosTab}
          options={{ tabBarLabel: 'Todos os Cursos' }}
        />
        <Tab.Screen
          name="MeusCursos"
          component={MeusCursosTab}
          options={{ tabBarLabel: 'Meus Cursos' }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 160,
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  courseDuration: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  courseActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coursePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
  },
  buyButton: {
    backgroundColor: '#111',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  watchButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  watchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  inCartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inCartText: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
});
