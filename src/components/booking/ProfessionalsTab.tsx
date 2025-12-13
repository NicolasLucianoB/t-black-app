import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { useTheme } from 'src/contexts/ThemeContext';
import { databaseService } from 'src/services';
import { Barber } from 'src/types';
import { ProfessionalCard } from './ProfessionalCard';

export function ProfessionalsTab() {
  const { colors } = useTheme();
  const [expandedBarbeiro, setExpandedBarbeiro] = useState<string | null>(null);
  const [barbeiros, setBarbeiros] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBarbeiros = async () => {
      try {
        const data = await databaseService.barbers.getAll();
        // Filtrar apenas profissionais visíveis
        const visibleBarbers = data.filter((barber) => barber.showInBooking !== false);
        setBarbeiros(visibleBarbers);
      } catch (error) {
        console.error('Erro ao carregar barbeiros:', error);
        Alert.alert('Erro', 'Não foi possível carregar os profissionais');
      } finally {
        setLoading(false);
      }
    };

    loadBarbeiros();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedBarbeiro((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.text }}>Carregando profissionais...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: 16 }}
    >
      {barbeiros.map((barbeiro) => (
        <ProfessionalCard
          key={barbeiro.id}
          barbeiro={barbeiro}
          isExpanded={expandedBarbeiro === barbeiro.id}
          onToggle={() => toggleExpand(barbeiro.id)}
          colors={colors}
        />
      ))}
    </ScrollView>
  );
}
