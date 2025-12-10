import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminHeader } from 'src/components/AdminHeader';
import { useTheme } from 'src/contexts/ThemeContext';
import { databaseService } from 'src/services';
import { User } from 'src/types';

export default function ClientesScreen() {
  const { colors } = useTheme();
  const [clientes, setClientes] = useState<User[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadClientes = async () => {
    setLoading(true);
    try {
      const data = await databaseService.users.getAll();
      setClientes(data);
      setFilteredClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      Alert.alert('Erro', 'Não foi possível carregar os clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(
        (cliente) =>
          cliente.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cliente.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cliente.phone?.includes(searchQuery),
      );
      setFilteredClientes(filtered);
    }
  }, [searchQuery, clientes]);

  const handleAddCliente = () => {
    router.push('/admin/clientes/new');
  };

  const handleEditCliente = (id: string) => {
    router.push(`/admin/clientes/${id}`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    searchContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 48,
      fontSize: 16,
      color: colors.text,
    },
    addButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      marginBottom: 20,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    addButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    bannedCard: {
      opacity: 0.6,
      borderWidth: 2,
      borderColor: '#ff4444',
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.border,
    },
    defaultAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    info: {
      flex: 1,
      marginLeft: 16,
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 2,
    },
    email: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    phone: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    badge: {
      fontSize: 12,
      color: '#ff4444',
      fontWeight: '600',
      marginTop: 4,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
  });

  return (
    <View style={styles.container}>
      <AdminHeader title="Clientes" subtitle="Gerenciar clientes" />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadClientes}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, email ou telefone..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddCliente}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Adicionar Cliente</Text>
        </TouchableOpacity>

        {filteredClientes.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado.'}
            </Text>
          </View>
        ) : (
          filteredClientes.map((cliente) => (
            <TouchableOpacity
              key={cliente.id}
              style={[styles.card, cliente.isBanned && styles.bannedCard]}
              onPress={() => cliente.id && handleEditCliente(cliente.id)}
            >
              {cliente.avatar ? (
                <Image source={{ uri: cliente.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Ionicons name="person" size={24} color={colors.textSecondary} />
                </View>
              )}

              <View style={styles.info}>
                <Text style={styles.name}>{cliente.name || 'Sem nome'}</Text>
                <Text style={styles.email}>{cliente.email}</Text>
                {cliente.phone && <Text style={styles.phone}>{cliente.phone}</Text>}
                {cliente.isBanned && <Text style={styles.badge}>🚫 BANIDO</Text>}
              </View>

              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
