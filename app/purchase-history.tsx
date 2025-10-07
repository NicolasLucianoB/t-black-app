import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackHeader from 'src/components/BackHeader';
import { useAuth } from 'src/contexts/AuthContext';
import { useTheme } from 'src/contexts/ThemeContext';

// Por enquanto, dados mockados. Serão integrados com Supabase depois
const mockPurchases: Purchase[] = [
  {
    id: '1',
    date: '2024-10-01',
    items: [
      {
        id: '1',
        name: 'Pomada Modeladora',
        type: 'product' as const,
        price: 25.9,
        quantity: 1,
        image: 'https://via.placeholder.com/60x60/111/fff?text=Pomada',
      },
    ],
    total: 25.9,
    status: 'paid' as const,
    paymentMethod: 'pix' as const,
  },
  {
    id: '2',
    date: '2024-09-15',
    items: [
      {
        id: '2',
        name: 'Curso de Marketing para Barbeiros',
        type: 'course' as const,
        price: 99.99,
        quantity: 1,
        image: 'https://via.placeholder.com/60x60/111/fff?text=Curso',
      },
    ],
    total: 99.99,
    status: 'paid' as const,
    paymentMethod: 'card' as const,
  },
];

interface PurchaseItem {
  id: string;
  name: string;
  type: 'product' | 'course';
  price: number;
  quantity: number;
  image: string;
}

interface Purchase {
  id: string;
  date: string;
  items: PurchaseItem[];
  total: number;
  status: 'pending' | 'paid' | 'refunded';
  paymentMethod: 'card' | 'pix' | 'cash';
}

export default function PurchaseHistoryScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      if (user) {
        setPurchases(mockPurchases);
      }
      setLoading(false);
    }, 1000);
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FF9500';
      case 'paid':
        return '#34C759';
      case 'refunded':
        return '#FF3B30';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'paid':
        return 'Pago';
      case 'refunded':
        return 'Reembolsado';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'card':
        return 'Cartão';
      case 'pix':
        return 'PIX';
      case 'cash':
        return 'Dinheiro';
      default:
        return method;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <BackHeader title="Histórico de Compras" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ color: colors.text, marginTop: 16 }}>Carregando histórico...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <BackHeader title="Histórico de Compras" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: colors.text, fontSize: 18, textAlign: 'center' }}>
            Faça login para ver seu histórico de compras
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (purchases.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <BackHeader title="Histórico de Compras" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Ionicons name="bag-outline" size={64} color={colors.textSecondary} />
          <Text style={{ color: colors.text, fontSize: 18, marginTop: 16, textAlign: 'center' }}>
            Nenhuma compra encontrada
          </Text>
          <Text
            style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8, textAlign: 'center' }}
          >
            Explore nossos produtos e cursos
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/product')}
          >
            <Text style={[styles.buttonText, { color: colors.card }]}>Ver Produtos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <BackHeader title="Histórico de Compras" />
      <ScrollView style={styles.scrollView}>
        {purchases.map((purchase) => (
          <View key={purchase.id} style={[styles.purchaseCard, { backgroundColor: colors.card }]}>
            <View style={styles.purchaseHeader}>
              <View>
                <Text style={[styles.purchaseDate, { color: colors.text }]}>
                  {formatDate(purchase.date)}
                </Text>
                <Text style={[styles.purchaseId, { color: colors.textSecondary }]}>
                  Pedido #{purchase.id}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(purchase.status) + '20' },
                ]}
              >
                <Text style={[styles.statusText, { color: getStatusColor(purchase.status) }]}>
                  {getStatusText(purchase.status)}
                </Text>
              </View>
            </View>

            <View style={styles.itemsContainer}>
              {purchase.items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.itemType, { color: colors.textSecondary }]}>
                      {item.type === 'product' ? 'Produto' : 'Curso'}
                    </Text>
                    <Text style={[styles.itemPrice, { color: colors.text }]}>
                      {item.quantity}x R$ {item.price.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.purchaseFooter}>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentMethod, { color: colors.textSecondary }]}>
                  Pagamento: {getPaymentMethodText(purchase.paymentMethod)}
                </Text>
              </View>
              <Text style={[styles.totalPrice, { color: colors.text }]}>
                Total: R$ {purchase.total.toFixed(2)}
              </Text>
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
  scrollView: {
    flex: 1,
    padding: 16,
  },
  purchaseCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  purchaseDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  purchaseId: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemsContainer: {
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  itemType: {
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  purchaseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    paddingTop: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMethod: {
    fontSize: 12,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
