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
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminHeader } from 'src/components/AdminHeader';
import { useTheme } from 'src/contexts/ThemeContext';
import { databaseService } from 'src/services';
import { Barber } from 'src/types';

export default function ProfissionaisScreen() {
  const { colors } = useTheme();
  const [profissionais, setProfissionais] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProfissionais = async () => {
    setLoading(true);
    try {
      const data = await databaseService.barbers.getAll();
      setProfissionais(data);
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      Alert.alert('Erro', 'Não foi possível carregar os profissionais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfissionais();
  }, []);

  const handleAddProfissional = () => {
    router.push('/admin/profissionais/new');
  };

  const handleEditProfissional = (id: string) => {
    router.push(`/admin/profissionais/${id}`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    addButton: {
      backgroundColor: colors.accent,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      marginBottom: 20,
      flexDirection: 'row',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    addButtonText: {
      color: '#FFFFFF',
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
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.border,
    },
    defaultAvatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
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
      marginBottom: 4,
    },
    position: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    badge: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '500',
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
      <AdminHeader title="Profissionais" subtitle="Gerenciar equipe" showBack={true} />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadProfissionais}
            tintColor={colors.primary}
          />
        }
      >
        <TouchableOpacity style={styles.addButton} onPress={handleAddProfissional}>
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Adicionar Profissional</Text>
        </TouchableOpacity>

        {profissionais.length === 0 && !loading ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              Nenhum profissional cadastrado.{'\n'}Clique no botão acima para adicionar.
            </Text>
          </View>
        ) : (
          profissionais.map((profissional) => (
            <TouchableOpacity
              key={profissional.id}
              style={styles.card}
              onPress={() => handleEditProfissional(profissional.id)}
            >
              {profissional.avatar ? (
                <Image source={{ uri: profissional.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Ionicons name="person" size={30} color={colors.textSecondary} />
                </View>
              )}

              <View style={styles.info}>
                <Text style={styles.name}>{profissional.name}</Text>
                <Text style={styles.position}>{profissional.position || 'Barbeiro'}</Text>
                {profissional.showInBooking && (
                  <Text style={styles.badge}>✓ Visível no agendamento</Text>
                )}
              </View>

              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}
