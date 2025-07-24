import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useCart } from '../contexts/CartContext';

// Dados mock para produtos
const produtosMock = [
  {
    id: 1,
    nome: 'Pomada Modeladora',
    categoria: 'Produtos para Cabelo',
    preco: 25.9,
    imagem: 'https://via.placeholder.com/80x80/111/fff?text=Pomada',
  },
  {
    id: 2,
    nome: 'Shampoo Profissional',
    categoria: 'Produtos para Cabelo',
    preco: 35.5,
    imagem: 'https://via.placeholder.com/80x80/111/fff?text=Shampoo',
  },
  {
    id: 3,
    nome: 'Óleo Capilar',
    categoria: 'Produtos para Cabelo',
    preco: 28.0,
    imagem: 'https://via.placeholder.com/80x80/111/fff?text=Oleo',
  },
];

// Dados mock para cursos
const cursosMock = [
  {
    id: 1,
    titulo: 'Corte Masculino Moderno',
    instrutor: 'Tiago',
    preco: 89.9,
    imagem: 'https://via.placeholder.com/80x80/111/fff?text=Curso',
  },
  {
    id: 2,
    titulo: 'Barba e Acabamentos',
    instrutor: 'Lucas',
    preco: 69.9,
    imagem: 'https://via.placeholder.com/80x80/111/fff?text=Curso',
  },
  {
    id: 3,
    titulo: 'Colorimetria Avançada',
    instrutor: 'Rafael',
    preco: 129.9,
    imagem: 'https://via.placeholder.com/80x80/111/fff?text=Curso',
  },
  {
    id: 4,
    titulo: 'Atendimento ao Cliente',
    instrutor: 'Tiago',
    preco: 49.9,
    imagem: 'https://via.placeholder.com/80x80/111/fff?text=Curso',
  },
];

export default function CartScreen({ navigation }: any) {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();

  const produtosNoCarrinho = cart.filter((item) => item.type === 'product');
  const cursosNoCarrinho = cart.filter((item) => item.type === 'course');

  const quantidadeItem = (itemId: number, type: 'product' | 'course') => {
    return cart.filter((item) => item.id === itemId && item.type === type).length;
  };

  const produtosUnicos = produtosMock.filter((produto) =>
    produtosNoCarrinho.some((item) => item.id === produto.id),
  );

  const cursosUnicos = cursosMock.filter((curso) =>
    cursosNoCarrinho.some((item) => item.id === curso.id),
  );

  const totalProdutos = produtosNoCarrinho.reduce((total, item) => {
    const produto = produtosMock.find((p) => p.id === item.id);
    return total + (produto?.preco || 0);
  }, 0);

  const totalCursos = cursosNoCarrinho.reduce((total, item) => {
    const curso = cursosMock.find((c) => c.id === item.id);
    return total + (curso?.preco || 0);
  }, 0);

  const totalGeral = totalProdutos + totalCursos;

  const finalizarCompra = () => {
    Alert.alert(
      'Finalizar Compra',
      `Total: R$ ${totalGeral.toFixed(2)}\n\nProdutos serão retirados no estúdio no dia do seu agendamento.\nCursos estarão disponíveis imediatamente após a compra.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () => {
            clearCart();
            Alert.alert('Sucesso!', 'Compra realizada com sucesso!', [
              { text: 'OK', onPress: () => navigation.navigate('Home') },
            ]);
          },
        },
      ],
    );
  };

  if (cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Carrinho Vazio</Text>
        <Text style={styles.emptyText}>Adicione produtos ou cursos ao carrinho para continuar</Text>
        <View style={styles.emptyButtons}>
          <TouchableOpacity
            style={styles.productsButton}
            onPress={() => navigation.navigate('Products')}
          >
            <Text style={styles.productsButtonText}>Produtos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.coursesButton}
            onPress={() => navigation.navigate('Courses')}
          >
            <Text style={styles.coursesButtonText}>Cursos</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Carrinho</Text>
        <Text style={styles.itemCount}>{cart.length} itens</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Seção de Produtos */}
        {produtosUnicos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Produtos</Text>
            {produtosUnicos.map((produto) => {
              const quantidade = quantidadeItem(produto.id, 'product');
              const subtotal = produto.preco * quantidade;

              return (
                <View key={`product-${produto.id}`} style={styles.cartItem}>
                  <Image source={{ uri: produto.imagem }} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{produto.nome}</Text>
                    <Text style={styles.itemCategory}>{produto.categoria}</Text>
                    <Text style={styles.itemPrice}>R$ {produto.preco.toFixed(2)}</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => removeFromCart(produto.id, 'product')}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{quantidade}</Text>
                      <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => addToCart(produto.id, 'product')}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.subtotalText}>R$ {subtotal.toFixed(2)}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => {
                        for (let i = 0; i < quantidade; i++) {
                          removeFromCart(produto.id, 'product');
                        }
                      }}
                    >
                      <Text style={styles.removeButtonText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Seção de Cursos */}
        {cursosUnicos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cursos</Text>
            {cursosUnicos.map((curso) => {
              const quantidade = quantidadeItem(curso.id, 'course');
              const subtotal = curso.preco * quantidade;

              return (
                <View key={`course-${curso.id}`} style={styles.cartItem}>
                  <Image source={{ uri: curso.imagem }} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{curso.titulo}</Text>
                    <Text style={styles.itemCategory}>Instrutor: {curso.instrutor}</Text>
                    <Text style={styles.itemPrice}>R$ {curso.preco.toFixed(2)}</Text>
                  </View>
                  <View style={styles.itemActions}>
                    <Text style={styles.subtotalText}>R$ {subtotal.toFixed(2)}</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => removeFromCart(curso.id, 'course')}
                    >
                      <Text style={styles.removeButtonText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>R$ {totalGeral.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={finalizarCompra}>
          <Text style={styles.checkoutButtonText}>Finalizar Compra</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  productsButton: {
    backgroundColor: '#111',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  productsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  coursesButton: {
    backgroundColor: '#111',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  coursesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  itemCount: {
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    padding: 16,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
  },
  itemActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    backgroundColor: '#111',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
    marginHorizontal: 12,
  },
  subtotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  removeButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: '#111',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  checkoutButton: {
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
});
