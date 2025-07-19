import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import AppHeader from '../components/AppHeader';

// Mock de produtos
const produtos = [
  {
    id: 1,
    nome: 'Pomada Modeladora',
    preco: 25.90,
    descricao: 'Pomada para modelar cabelo com fixação forte',
    imagem: 'https://via.placeholder.com/150x150/111/fff?text=Pomada',
    categoria: 'Modelagem'
  },
  {
    id: 2,
    nome: 'Shampoo Profissional',
    preco: 35.50,
    descricao: 'Shampoo para todos os tipos de cabelo',
    imagem: 'https://via.placeholder.com/150x150/111/fff?text=Shampoo',
    categoria: 'Limpeza'
  },
  {
    id: 3,
    nome: 'Óleo Capilar',
    preco: 42.00,
    descricao: 'Óleo nutritivo para cabelos danificados',
    imagem: 'https://via.placeholder.com/150x150/111/fff?text=Óleo',
    categoria: 'Tratamento'
  },
  {
    id: 4,
    nome: 'Gel Fixador',
    preco: 18.90,
    descricao: 'Gel com fixação média e brilho natural',
    imagem: 'https://via.placeholder.com/150x150/111/fff?text=Gel',
    categoria: 'Modelagem'
  },
  {
    id: 5,
    nome: 'Máscara Hidratante',
    preco: 55.00,
    descricao: 'Máscara de hidratação profunda',
    imagem: 'https://via.placeholder.com/150x150/111/fff?text=Máscara',
    categoria: 'Tratamento'
  },
  {
    id: 6,
    nome: 'Condicionador',
    preco: 28.90,
    descricao: 'Condicionador para cabelos normais',
    imagem: 'https://via.placeholder.com/150x150/111/fff?text=Condicionador',
    categoria: 'Limpeza'
  }
];

export default function ProductsScreen({ navigation }: any) {
  const { cart, addToCart, removeFromCart } = useCart();
  const { colors } = useTheme();
  
  console.log('ProductsScreen - Carrinho atual:', cart);

  const estaNoCarrinho = (produtoId: number) => {
    const result = cart.some(item => item.id === produtoId && item.type === 'product');
    console.log(`Produto ${produtoId} está no carrinho:`, result);
    return result;
  };

  const quantidadeNoCarrinho = (produtoId: number) => {
    const quantidade = cart.filter(item => item.id === produtoId && item.type === 'product').length;
    console.log(`Quantidade do produto ${produtoId} no carrinho:`, quantidade);
    return quantidade;
  };

  const totalCarrinho = cart
    .filter(item => item.type === 'product')
    .reduce((total, item) => {
      const produto = produtos.find(p => p.id === item.id);
      return total + (produto?.preco || 0);
    }, 0);

  const irParaCarrinho = () => {
    navigation.navigate('Cart');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <AppHeader navigation={navigation} title="Produtos" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.productsGrid}>
          {produtos.map(produto => (
            <View key={produto.id} style={styles.productCard}>
              <Image source={{ uri: produto.imagem }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{produto.nome}</Text>
                <Text style={styles.productCategory}>{produto.categoria}</Text>
                <Text style={styles.productPrice}>R$ {produto.preco.toFixed(2)}</Text>
                
                {estaNoCarrinho(produto.id) ? (
                  <View style={styles.inCartContainer}>
                    <Text style={styles.inCartTextCentered}>No Carrinho</Text>
                    <TouchableOpacity 
                      style={styles.removeButton} 
                      onPress={() => removeFromCart(produto.id, 'product')}
                    >
                      <Ionicons name="remove-circle" size={24} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.addButton} 
                    onPress={() => addToCart(produto.id, 'product')}
                  >
                    <Ionicons name="add-circle" size={24} color="#111" style={{ marginRight: 4 }} />
                    <View style={styles.addButtonTextAbsoluteContainer} pointerEvents="none">
                      <Text style={styles.addButtonTextAbsolute}>Adicionar</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {cart.filter(item => item.type === 'product').length > 0 && (
        <View style={styles.cartButtonContainer}>
          <TouchableOpacity style={styles.cartButton} onPress={irParaCarrinho}>
            <Ionicons name="cart" size={24} color="#fff" />
            <Text style={styles.cartButtonText}>
              Ver Carrinho (R$ {totalCarrinho.toFixed(2)})
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  debugContainer: {
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
  },
  scrollContainer: {
    padding: 16,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  productActions: {
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    width: '100%',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    marginTop: -2, // Ajuste para centralizar verticalmente
  },
  addButtonTextCentered: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginTop: -2,
  },
  addButtonTextAbsoluteContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  addButtonTextAbsolute: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: -2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  quantityButton: {
    backgroundColor: '#111',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginHorizontal: 12,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalContainer: {
    flex: 1,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
  },
  checkoutButton: {
    backgroundColor: '#111',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#111',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    marginTop: -2, // Ajuste para subir o texto
  },
  inCartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  inCartText: {
    fontSize: 12,
    color: '#666',
  },
  inCartTextCentered: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  removeButton: {
    marginLeft: 4,
  },
}); 