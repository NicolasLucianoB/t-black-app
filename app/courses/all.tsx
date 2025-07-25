import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AppHeader from '../../src/components/AppHeader';
import { useCart } from '../../src/contexts/CartContext';
import { useTheme } from '../../src/contexts/ThemeContext';


type Curso = {
  id: number;
  title: string;
  description: string;
  price: number;
  image: any;
};

const cursos: Curso[] = [
  {
    id: 1,
    title: 'Curso de Marketing para Barbeiros',
    description: 'Aprenda a monetizar mais com seu salão.',
    price: 99.99,
    image: require('../../assets/logo-t-black.png'),
  },
  {
    id: 2,
    title: 'Curso de Finalização de Cachos',
    description: 'Domine a arte do cabelo definido e volumoso.',
    price: 89.99,
    image: require('../../assets/logo-t-black.png'),
  },
  {
    id: 3,
    title: 'Curso de Corte Masculino Avançado',
    description: 'Aperfeiçoe suas técnicas de corte masculino.',
    price: 79.99,
    image: require('../../assets/logo-t-black.png'),
  },
];

export default function TodosCursosTab() {
  const { cart, addToCart, removeFromCart } = useCart();
  const { colors, themeMode } = useTheme();

  const handleAddToCart = (curso: Curso) => {
    addToCart(curso.id, 'course');
    Alert.alert('Sucesso', `${curso.title} adicionado ao carrinho.`);
  };

  const handleRemoveFromCart = (curso: Curso) => {
    removeFromCart(curso.id, 'course');
    Alert.alert('Sucesso', `${curso.title} removido do carrinho.`);
  };

  const isInCart = (curso: Curso): boolean => {
    return cart.some((item) => item.id === curso.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Todos os Cursos" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {cursos.map((curso) => (
          <View key={curso.id} style={[styles.card, { backgroundColor: colors.card }]}>
            <Image source={curso.image} style={styles.image} resizeMode="contain" />
            <View style={styles.info}>
              <Text style={[styles.title, { color: colors.text }]}>{curso.title}</Text>
              <Text style={[styles.description, { color: colors.textSecondary }]}>{curso.description}</Text>
              <Text style={[styles.price, { color: colors.primary }]}>{`R$ ${curso.price.toFixed(2)}`}</Text>
              {isInCart(curso) ? (
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
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
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
    color: '#fff',
    fontWeight: 'bold',
  },
});
