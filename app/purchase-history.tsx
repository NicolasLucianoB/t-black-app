import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { databaseService } from 'src/services';
import { Purchase } from 'src/types';

// Histórico de compras real integrado com Supabase

export default function PurchaseHistoryScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPurchases = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const userPurchases = await databaseService.purchases.getByUserId(user.id);
        setPurchases(userPurchases);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPurchases();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'requested':
        return '#007AFF';
      case 'confirmed':
        return '#30D158';
      case 'ready':
        return '#FF9F0A';
      case 'cancelled':
        return '#FF3B30';
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'requested':
        return 'Solicitado';
      case 'confirmed':
        return 'Confirmado';
      case 'ready':
        return 'Pronto';
      case 'completed':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
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
                  {formatDate(purchase.createdAt)}
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
                  <View style={[styles.itemImagePlaceholder, { backgroundColor: colors.border }]}>
                    <Ionicons
                      name={item.itemType === 'product' ? 'storefront-outline' : 'school-outline'}
                      size={24}
                      color={colors.textSecondary}
                    />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, { color: colors.text }]}>{item.itemName}</Text>
                    <Text style={[styles.itemType, { color: colors.textSecondary }]}>
                      {item.itemType === 'product' ? 'Produto' : 'Curso'}
                    </Text>
                    <Text style={[styles.itemPrice, { color: colors.text }]}>
                      {item.quantity}x R$ {item.unitPrice?.toFixed(2) || '0.00'} = R${' '}
                      {item.totalPrice?.toFixed(2) || '0.00'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.purchaseFooter}>
              <Text style={[styles.totalPrice, { color: colors.text }]}>
                Total: R$ {purchase.totalAmount.toFixed(2)}
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
  itemImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
