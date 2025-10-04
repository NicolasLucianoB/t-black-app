import { Ionicons } from '@expo/vector-icons';
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
import { useRouter } from 'expo-router';
import BackHeader from 'src/components/BackHeader';
import { useCart } from 'src/contexts/CartContext';
import { useTheme } from 'src/contexts/ThemeContext';
import { databaseService } from 'src/services';
import { Product } from 'src/types';

// Produtos agora vêm do Supabase

export default function ProductsScreen() {
  const { cart, addToCart, removeFromCart } = useCart();
  const { colors } = useTheme();
  const router = useRouter();

  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar produtos do Supabase
  useEffect(() => {
    const loadProdutos = async () => {
      try {
        setLoading(true);
        const data = await databaseService.products.getAll();
        setProdutos(data);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setError('Não foi possível carregar os produtos');
        Alert.alert('Erro', 'Não foi possível carregar os produtos');
      } finally {
        setLoading(false);
      }
    };

    loadProdutos();
  }, []);

  const estaNoCarrinho = (produtoId: string) => {
    return cart.some((item) => item.productId === produtoId && item.type === 'product');
  };

  const handleAddToCart = async (produto: Product) => {
    await addToCart({
      type: 'product',
      productId: produto.id,
      quantity: 1,
      price: produto.price,
      product: produto,
    });
    Alert.alert('Sucesso', `${produto.name} adicionado ao carrinho!`);
  };

  const handleRemoveFromCart = async (produto: Product) => {
    const item = cart.find((item) => item.productId === produto.id && item.type === 'product');
    if (item) {
      await removeFromCart(item.id);
      Alert.alert('Removido', `${produto.name} removido do carrinho!`);
    }
  };

  const totalCarrinho = cart
    .filter((item) => item.type === 'product')
    .reduce((total, item) => total + item.price * item.quantity, 0);

  const irParaCarrinho = () => {
    router.push('/cart');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <BackHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 16 }}>Carregando produtos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || produtos.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <BackHeader />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: colors.text, fontSize: 18, textAlign: 'center' }}>
            {error || 'Nenhum produto disponível no momento'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <BackHeader />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.productsGrid}>
          {produtos.map((produto) => (
            <View key={produto.id} style={styles.productCard}>
              <Image
                source={{
                  uri:
                    produto.images?.[0] ||
                    'https://via.placeholder.com/150x150/111/fff?text=Produto',
                }}
                style={styles.productImage}
              />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{produto.name}</Text>
                <Text style={styles.productCategory}>{produto.category}</Text>
                <Text style={styles.productPrice}>R$ {produto.price.toFixed(2)}</Text>

                {estaNoCarrinho(produto.id) ? (
                  <View style={styles.inCartContainer}>
                    <Text style={styles.inCartTextCentered}>No Carrinho</Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveFromCart(produto)}
                    >
                      <Ionicons name="remove-circle" size={24} color="#ff6b6b" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddToCart(produto)}
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

      {cart.filter((item) => item.type === 'product').length > 0 && (
        <View style={styles.cartButtonContainer}>
          <TouchableOpacity style={styles.cartButton} onPress={irParaCarrinho}>
            <Ionicons name="cart" size={24} color="#fff" />
            <Text style={styles.cartButtonText}>Ver Carrinho (R$ {totalCarrinho.toFixed(2)})</Text>
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
