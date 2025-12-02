import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { AdminCard } from '../../src/components/AdminCard';
import { AdminHeader } from '../../src/components/AdminHeader';
import { useTheme } from '../../src/contexts/ThemeContext';
import { supabase } from '../../src/services/supabase';

interface DashboardStats {
  totalProdutos: number;
  totalCursos: number;
  agendamentosHoje: number;
  pedidosAbertos: number;
  faturamentoMes: number;
  novosUsuarios: number;
}

export default function AdminDashboard() {
  const { colors } = useTheme();

  // DEBUG: Log que o dashboard foi carregado
  console.log('🎯 AdminDashboard loaded!');

  const [stats, setStats] = useState<DashboardStats>({
    totalProdutos: 0,
    totalCursos: 0,
    agendamentosHoje: 0,
    pedidosAbertos: 0,
    faturamentoMes: 0,
    novosUsuarios: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Buscar estatísticas do banco de dados
      const hoje = new Date().toISOString().split('T')[0];
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const [produtosResult, cursosResult, agendamentosResult, pedidosResult, usuariosResult] =
        await Promise.all([
          supabase.from('products').select('id', { count: 'exact' }),
          supabase.from('courses').select('id', { count: 'exact' }),
          supabase
            .from('bookings')
            .select('id', { count: 'exact' })
            .gte('date', hoje)
            .lt('date', `${hoje}T23:59:59`),
          supabase
            .from('orders')
            .select('id', { count: 'exact' })
            .in('status', ['pending', 'processing']),
          supabase.from('users').select('id', { count: 'exact' }).gte('created_at', inicioMes),
        ]);

      setStats({
        totalProdutos: produtosResult.count || 0,
        totalCursos: cursosResult.count || 0,
        agendamentosHoje: agendamentosResult.count || 0,
        pedidosAbertos: pedidosResult.count || 0,
        faturamentoMes: 0, // Calcular depois
        novosUsuarios: usuariosResult.count || 0,
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    gridItem: {
      width: '48%',
      marginBottom: 12,
    },
  });

  return (
    <View style={styles.container}>
      <AdminHeader title="Dashboard Admin" subtitle="Visão geral do sistema" />

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadDashboardData}
            tintColor={colors.primary}
          />
        }
      >
        {/* Estatísticas Gerais */}
        <View style={styles.section}>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <AdminCard
                title="Produtos"
                value={stats.totalProdutos}
                icon="cube-outline"
                variant="stat"
                onPress={() => router.push('/admin/produtos')}
              />
            </View>

            <View style={styles.gridItem}>
              <AdminCard
                title="Cursos"
                value={stats.totalCursos}
                icon="school-outline"
                variant="stat"
                onPress={() => router.push('/admin/cursos')}
              />
            </View>

            <View style={styles.gridItem}>
              <AdminCard
                title="Agendamentos Hoje"
                value={stats.agendamentosHoje}
                icon="calendar-outline"
                variant="action"
                onPress={() => router.push('/admin/agendamentos')}
              />
            </View>

            <View style={styles.gridItem}>
              <AdminCard
                title="Pedidos Abertos"
                value={stats.pedidosAbertos}
                icon="bag-outline"
                variant="warning"
                onPress={() => router.push('/admin/pedidos')}
              />
            </View>
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <AdminCard
            title="Gerenciar Produtos"
            subtitle="Adicionar, editar e remover produtos"
            icon="cube-outline"
            variant="action"
            onPress={() => router.push('/admin/produtos')}
          />

          <AdminCard
            title="Gerenciar Cursos"
            subtitle="Controlar cursos e alunos"
            icon="school-outline"
            variant="action"
            onPress={() => router.push('/admin/cursos')}
          />

          <AdminCard
            title="Ver Agendamentos"
            subtitle="Aprovar e gerenciar horários"
            icon="calendar-outline"
            variant="action"
            onPress={() => router.push('/admin/agendamentos')}
          />

          <AdminCard
            title="Controlar Pedidos"
            subtitle="Status de entrega e pagamentos"
            icon="bag-outline"
            variant="action"
            onPress={() => router.push('/admin/pedidos')}
          />
        </View>

        {/* Informações do Sistema */}
        <View style={styles.section}>
          <AdminCard
            title="Novos Usuários (Este Mês)"
            value={stats.novosUsuarios}
            icon="people-outline"
            variant="stat"
          />
        </View>
      </ScrollView>
    </View>
  );
}
