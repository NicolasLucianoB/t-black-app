import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AdminCard } from '../../../src/components/AdminCard';
import { AdminHeader } from '../../../src/components/AdminHeader';
import Button from '../../../src/components/Button';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { supabase } from '../../../src/services/supabase';
import { Product } from '../../../src/types/product';

export default function AdminProdutos() {
  const { colors } = useTheme();
  const [produtos, setProdutos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProdutos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProdutos();
    setRefreshing(false);
  };

  const handleDeleteProduct = (produto: Product) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir "${produto.name}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteProduct(produto.id),
        },
      ],
    );
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;

      setProdutos((prev) => prev.filter((p) => p.id !== id));
      Alert.alert('Sucesso', 'Produto excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      Alert.alert('Erro', 'Não foi possível excluir o produto');
    }
  };

  useEffect(() => {
    loadProdutos();
  }, []);

  const renderProduct = ({ item }: { item: Product }) => (
    <AdminCard
      title={item.name}
      subtitle={`R$ ${item.price.toFixed(2)} - ${item.category}`}
      variant="default"
    >
      <View style={styles.productContent}>
        {item.images && item.images.length > 0 && (
          <Image source={{ uri: item.images[0] }} style={styles.productImage} resizeMode="cover" />
        )}

        <View style={styles.productInfo}>
          <Text
            style={[styles.productDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.description}
          </Text>

          <View style={styles.productActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push(`/admin/produtos/${item.id}`)}
            >
              <Ionicons name="create-outline" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.error }]}
              onPress={() => handleDeleteProduct(item)}
            >
              <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </AdminCard>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    addButton: {
      backgroundColor: colors.success,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    addButtonText: {
      color: '#FFFFFF',
      fontWeight: '600',
      marginLeft: 6,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    productContent: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    productImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      marginRight: 12,
    },
    productInfo: {
      flex: 1,
    },
    productDescription: {
      fontSize: 14,
      marginBottom: 12,
    },
    productActions: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      gap: 4,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
  });

  const HeaderRightElement = () => (
    <View style={styles.headerActions}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/admin/produtos/newProduct')}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Novo</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && produtos.length === 0) {
    return (
      <View style={styles.container}>
        <AdminHeader title="Gerenciar Produtos" showBack rightElement={<HeaderRightElement />} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Carregando produtos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Gerenciar Produtos"
        subtitle={`${produtos.length} produtos cadastrados`}
        showBack
        rightElement={<HeaderRightElement />}
      />

      <View style={styles.content}>
        {produtos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              Nenhum produto cadastrado ainda.{'\n'}
              Clique em "Novo" para adicionar o primeiro produto.
            </Text>
            <Button
              title="Adicionar Primeiro Produto"
              onPress={() => router.push('/admin/produtos/newProduct')}
            />
          </View>
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}
