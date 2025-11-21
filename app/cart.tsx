import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import BackHeader from 'src/components/BackHeader';
import { useAuth } from 'src/contexts/AuthContext';
import { useCart } from 'src/contexts/CartContext';
import { useTheme } from 'src/contexts/ThemeContext';
import { useCartNotifications } from 'src/hooks/useNotifications';
import { databaseService } from 'src/services';

// Carrinho agora usa dados reais do Supabase via context

export default function CartScreen() {
  const { cart, removeFromCart, clearCart, updateQuantity, getTotalPrice } = useCart();
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { notifyPurchaseCompleted } = useCartNotifications();

  // Componente customizado para o lado direito do header (sem o ícone do carrinho)
  const cartHeaderRight = (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        style={{ marginLeft: 16, position: 'relative' }}
        onPress={() => router.push('/notifications')}
      >
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity
        style={{ marginLeft: 16, position: 'relative' }}
        onPress={() => router.push('/studioInfo')}
      >
        <Ionicons name="information-circle-outline" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const produtosNoCarrinho = cart.filter((item) => item.type === 'product');
  const cursosNoCarrinho = cart.filter((item) => item.type === 'course');

  // getTotalPrice já vem do contexto

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
    Alert.alert('Removido', 'Item removido do carrinho');
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const totalGeral = getTotalPrice();

  const finalizarCompra = () => {
    if (!user?.id) {
      Alert.alert('Erro', 'Você precisa estar logado para finalizar a compra.');
      return;
    }

    Alert.alert(
      'Fazer Pedido',
      `Total: R$ ${totalGeral.toFixed(2)}\n\n📦 Produtos: Retirada no estúdio\n📚 Cursos: Acesso imediato\n💰 Pagamento: No estúdio ou PIX`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const itemCount = cart.length;
              const totalValue = totalGeral;

              // Preparar dados da compra
              const purchaseItems = cart.map((item) => ({
                productId: item.productId,
                courseId: item.courseId,
                itemName: item.product?.name || item.course?.title || 'Item',
                itemType: item.type,
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity,
              }));

              // Criar pedido no Supabase (sem cobrança automática)
              const purchase = await databaseService.purchases.create({
                userId: user.id,
                totalAmount: totalValue,
                notes: `Pedido realizado pelo app - ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`,
                items: purchaseItems,
              });

              if (purchase) {
                // Limpar carrinho após sucesso
                await clearCart();

                // Enviar notificação de compra
                await notifyPurchaseCompleted(totalValue, itemCount);

                Alert.alert(
                  'Pedido Realizado!',
                  `Pedido #${purchase.id.slice(-8)} criado com sucesso!\n\n� Produtos: Retirada no estúdio\n� Cursos: Disponíveis imediatamente\n\n💰 Pagamento: No estúdio ou via PIX`,
                  [
                    { text: 'OK' },
                    {
                      text: 'Ver Histórico',
                      onPress: () => router.push('/purchase-history'),
                    },
                  ],
                );
              } else {
                Alert.alert('Erro', 'Não foi possível processar a compra. Tente novamente.');
              }
            } catch (error) {
              console.error('Erro ao finalizar compra:', error);
              Alert.alert('Erro', 'Ocorreu um erro ao processar a compra. Tente novamente.');
            }
          },
        },
      ],
    );
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <BackHeader rightComponent={cartHeaderRight} />
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Carrinho Vazio</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {/* Adicione produtos ou cursos ao carrinho para continuar */}
            Adicione produtos ao carrinho para continuar
          </Text>
          <View style={styles.emptyButtons}>
            <TouchableOpacity
              style={[styles.productsButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/product')}
            >
              <Text style={[styles.productsButtonText, { color: colors.background }]}>
                Produtos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.coursesButton, { backgroundColor: colors.accent }]}
              onPress={() => router.push('/courses/all')}
            >
              <Text style={[styles.coursesButtonText, { color: colors.background }]}>Cursos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <BackHeader rightComponent={cartHeaderRight} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Seção de Produtos */}
          {produtosNoCarrinho.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Produtos</Text>
              {produtosNoCarrinho.map((item) => (
                <View key={item.id} style={[styles.cartItem, { backgroundColor: colors.card }]}>
                  <Image
                    source={{
                      uri:
                        item.product?.images?.[0] ||
                        'https://via.placeholder.com/80x80/111/fff?text=Produto',
                    }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]}>
                      {item.product?.name || 'Produto'}
                    </Text>
                    <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>
                      {item.product?.category || 'Produtos para Cabelo'}
                    </Text>
                    <Text style={[styles.itemPrice, { color: colors.text }]}>
                      R$ {item.price.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.itemActions}>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                        onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        <Text style={[styles.quantityButtonText, { color: colors.background }]}>
                          -
                        </Text>
                      </TouchableOpacity>
                      <Text style={[styles.quantityText, { color: colors.text }]}>
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                        onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        <Text style={[styles.quantityButtonText, { color: colors.background }]}>
                          +
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.subtotalText, { color: colors.text }]}>
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <Text style={styles.removeButtonText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Seção de Cursos */}
          {cursosNoCarrinho.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Cursos</Text>
              {cursosNoCarrinho.map((item) => (
                <View key={item.id} style={[styles.cartItem, { backgroundColor: colors.card }]}>
                  <Image
                    source={{
                      uri:
                        `https://img.youtube.com/vi/${item.course?.videoUrl?.split('/').pop()}/maxresdefault.jpg` ||
                        'https://via.placeholder.com/80x80/111/fff?text=Curso',
                    }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]}>
                      {item.course?.title || 'Curso'}
                    </Text>
                    <Text style={[styles.itemCategory, { color: colors.textSecondary }]}>
                      Instrutor: {item.course?.instructor || 'N/A'}
                    </Text>
                    <Text style={[styles.itemPrice, { color: colors.text }]}>
                      R$ {item.price.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.itemActions}>
                    <Text style={[styles.subtotalText, { color: colors.text }]}>
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveItem(item.id)}
                    >
                      <Text style={styles.removeButtonText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View
          style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}
        >
          <View style={styles.totalContainer}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              R$ {totalGeral.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
            onPress={finalizarCompra}
          >
            <Text style={[styles.checkoutButtonText, { color: colors.card }]}>
              Finalizar Compra
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
  },
  productsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  coursesButton: {
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
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  itemCount: {
    fontSize: 16,
  },
  scrollContainer: {
    padding: 16,
  },
  cartItem: {
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
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  subtotalText: {
    fontSize: 14,
    fontWeight: 'bold',
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
    padding: 16,
    borderTopWidth: 1,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  checkoutButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
