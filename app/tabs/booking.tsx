import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { Calendar } from 'react-native-calendars';
import AppHeader from 'src/components/AppHeader';
import { useAuth } from 'src/contexts/AuthContext';
import { useTheme } from 'src/contexts/ThemeContext';
import { useCreateBooking } from 'src/hooks/useBookings';
import { databaseService } from 'src/services';
import { Barber } from 'src/types';

const Tab = createMaterialTopTabNavigator();

// Os dados dos barbeiros agora vêm do Supabase
// Dados temporários para fallback (removidos depois de integração completa)

const diasIndisponiveis = ['2024-06-28', '2024-06-29', '2024-07-01'];

function getMarkedDates(selectedDate: string, colors: any) {
  const marked: any = {};

  // Marcar domingos como indisponíveis
  const currentDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 2); // 2 meses à frente

  for (let d = new Date(currentDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateString = d.toISOString().split('T')[0];
    if (d.getDay() === 0) {
      // Domingo
      marked[dateString] = {
        disabled: true,
        disableTouchEvent: true,
        marked: false,
        dotColor: 'transparent',
        opacity: 0.2,
        textColor: '#ccc',
      };
    }
  }

  // Marcar datas específicas como indisponíveis
  diasIndisponiveis.forEach((date) => {
    marked[date] = {
      disabled: true,
      disableTouchEvent: true,
      marked: false,
      dotColor: 'transparent',
      opacity: 0.2,
      textColor: '#ccc',
    };
  });

  // Marcar data selecionada
  if (selectedDate) {
    marked[selectedDate] = {
      selected: true,
      selectedColor: '#111',
      selectedTextColor: '#fff',
    };
  }

  return marked;
}

function AgendarTab() {
  const { colors, theme } = useTheme();
  const { user } = useAuth();
  const [barbeiros, setBarbeiros] = useState<Barber[]>([]);
  const [barbeiro, setBarbeiro] = useState<string>('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    createBooking,
    loading: bookingLoading,
    error: bookingError,
  } = useCreateBooking(user?.id || '');

  // Carregar barbeiros do Supabase
  useEffect(() => {
    const loadBarbeiros = async () => {
      setLoading(true);
      try {
        const data = await databaseService.barbers.getAll();
        setBarbeiros(data);
        if (data.length > 0) {
          setBarbeiro(data[0].id); // Selecionar primeiro barbeiro
        }
      } catch (error) {
        console.error('Erro ao carregar barbeiros:', error);
        Alert.alert('Erro', 'Não foi possível carregar os barbeiros');
      } finally {
        setLoading(false);
      }
    };

    loadBarbeiros();
  }, []);

  // Carregar horários disponíveis quando barbeiro ou data mudarem
  useEffect(() => {
    const loadHorarios = async () => {
      if (!barbeiro || !data) {
        setHorariosDisponiveis([]);
        return;
      }

      try {
        const slots = await databaseService.bookings.getAvailableSlots(barbeiro, data);
        console.log('Horários disponíveis:', slots); // Log para depuração
        setHorariosDisponiveis(slots);
      } catch (error) {
        console.error('Erro ao carregar horários:', error);
        setHorariosDisponiveis([]);
      }
    };

    loadHorarios();
  }, [barbeiro, data]);

  const handleConfirmar = async () => {
    if (!user?.id || !barbeiro || !data || !horario) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      const barbeiroSelecionado = barbeiros.find((b) => b.id === barbeiro);

      // Usando serviço básico por enquanto (preço fixo)
      const bookingData = {
        barberId: barbeiro,
        serviceId: 'default', // Service ID temporário
        date: data,
        time: horario,
        notes: `Agendamento com ${barbeiroSelecionado?.name}`,
      };

      const result = await createBooking(bookingData, 50.0); // Preço fixo temporário

      if (result?.data) {
        Alert.alert(
          'Sucesso!',
          `Agendamento realizado com ${barbeiroSelecionado?.name} em ${data} às ${horario}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setData('');
                setHorario('');
                // Recarregar horários disponíveis
                databaseService.bookings
                  .getAvailableSlots(barbeiro, data)
                  .then(setHorariosDisponiveis);
              },
            },
          ],
        );
      } else {
        Alert.alert('Erro', bookingError || 'Não foi possível criar o agendamento');
      }
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao confirmar o agendamento');
    }
  };

  const handleBarbeiroChange = (novoBarbeiro: string) => {
    setBarbeiro(novoBarbeiro);
    setHorario(''); // Reset horário ao trocar barbeiro
  };

  const handleDataChange = (novaData: string) => {
    setData(novaData);
    setHorario(''); // Reset horário ao trocar data
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Conteúdo da aba de Agendar */}
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, shadowColor: colors.shadow },
        ]}
      >
        {/* Seção de Agendamento Rápido */}
        <View style={[styles.quickBookSection, { backgroundColor: colors.card }]}>
          <View style={styles.quickBookHeader}>
            <Ionicons name="flash" size={20} color="#25D366" />
            <Text style={[styles.quickBookTitle, { color: colors.text }]}>Agendamento Rápido</Text>
          </View>
          <TouchableOpacity style={styles.quickBookCard}>
            <View style={styles.quickBookInfo}>
              <Text style={[styles.quickBookService, { color: colors.text }]}>
                Corte Degradê - Tiago
              </Text>
              <Text style={[styles.quickBookDate, { color: colors.textSecondary }]}>
                Último: 15/01/2024 às 14:00
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.text }]}>Barbeiro</Text>
        <View style={styles.row}>
          {barbeiros.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[
                styles.barbeiroButton,
                { backgroundColor: colors.card, borderColor: colors.border },
                barbeiro === b.id && {
                  backgroundColor: colors.primary,
                  borderColor: colors.primary,
                },
              ]}
              onPress={() => handleBarbeiroChange(b.id)}
            >
              <Text
                style={
                  barbeiro === b.id
                    ? [styles.barbeiroTextSelected, { color: colors.card }]
                    : [styles.barbeiroText, { color: colors.text }]
                }
              >
                {b.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.label, { color: colors.text }]}>Data</Text>
        <Calendar
          onDayPress={(day) => handleDataChange(day.dateString)}
          markedDates={getMarkedDates(data, colors)}
          minDate={new Date().toISOString().split('T')[0]}
          theme={{
            todayTextColor: colors.accent,
            selectedDayBackgroundColor: '#111',
            selectedDayTextColor: '#fff',
          }}
          style={styles.calendar}
        />
        <Text style={[styles.label, { color: colors.text }]}>Horário</Text>
        {data && horariosDisponiveis.length > 0 ? (
          <View style={styles.row}>
            {horariosDisponiveis.map((h) => (
              <TouchableOpacity
                key={h}
                style={[
                  styles.horarioButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  horario === h && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setHorario(h)}
                disabled={diasIndisponiveis.includes(data)}
              >
                <Text
                  style={
                    horario === h
                      ? [styles.horarioTextSelected, { color: colors.card }]
                      : [styles.horarioText, { color: colors.text }]
                  }
                >
                  {h}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : data ? (
          <Text style={[styles.noHorariosText, { color: colors.error }]}>
            Nenhum horário disponível para esta data
          </Text>
        ) : (
          <Text style={[styles.selectDataText, { color: colors.textSecondary }]}>
            Selecione uma data para ver os horários
          </Text>
        )}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: colors.primary },
              (!data || !horario || diasIndisponiveis.includes(data) || bookingLoading) && {
                opacity: 0.5,
              },
            ]}
            onPress={handleConfirmar}
            accessibilityRole="button"
            disabled={!data || !horario || diasIndisponiveis.includes(data) || bookingLoading}
          >
            <Text style={[styles.confirmButtonText, { color: colors.card }]}>
              {bookingLoading ? 'Confirmando...' : 'Confirmar Agendamento'}
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <Text style={[styles.declarationText, { color: colors.textSecondary }]}>
            *Declaro estar ciente de que o não honrar o compromisso de comparecer à data agendada
            por 3 vezes acarretará em um bloqueio temporário de novos agendamentos*
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function ProfissionaisTab() {
  const { colors } = useTheme();
  const [expandedBarbeiro, setExpandedBarbeiro] = useState<string | null>(null);
  const [barbeiros, setBarbeiros] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar barbeiros do Supabase
  useEffect(() => {
    const loadBarbeiros = async () => {
      try {
        const data = await databaseService.barbers.getAll();
        setBarbeiros(data);
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
      {barbeiros.map((barbeiro) => {
        const isExpanded = expandedBarbeiro === barbeiro.id;

        return (
          <View
            key={barbeiro.id}
            style={[
              styles.professionalCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              onPress={() => toggleExpand(barbeiro.id)}
              style={styles.professionalHeader}
            >
              <View style={styles.professionalInfo}>
                <View style={[styles.avatarContainer, { borderColor: colors.primary }]}>
                  <Image
                    source={
                      barbeiro.avatar
                        ? { uri: barbeiro.avatar }
                        : require('assets/logo-t-black.png')
                    }
                    style={styles.avatar}
                  />
                </View>
                <View style={styles.professionalDetails}>
                  <Text style={[styles.professionalName, { color: colors.text }]}>
                    {barbeiro.name || 'Nome não disponível'}
                  </Text>
                  <Text style={[styles.professionalRole, { color: colors.textSecondary }]}>
                    {barbeiro.specialties &&
                    Array.isArray(barbeiro.specialties) &&
                    barbeiro.specialties.length > 0 ? (
                      barbeiro.specialties.filter((s) => s).join(', ')
                    ) : (
                      <Text>Profissional Especializado</Text>
                    )}
                  </Text>
                  {barbeiro.rating && (
                    <Text style={[styles.professionalRating, { color: colors.accent }]}>
                      ⭐ {barbeiro.rating.toFixed(1)}
                    </Text>
                  )}
                </View>
              </View>
              <View style={[styles.expandIcon, { backgroundColor: colors.accent + '15' }]}>
                <Ionicons
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.accent}
                />
              </View>
            </TouchableOpacity>

            {isExpanded && (
              <View style={[styles.professionalDescription, { borderTopColor: colors.border }]}>
                <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                  Sobre o profissional
                </Text>
                <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                  {barbeiro.description || 'Profissional qualificado do Studio T Black.'}
                </Text>
                {barbeiro.workingHours &&
                  Array.isArray(barbeiro.workingHours) &&
                  barbeiro.workingHours.length > 0 && (
                    <>
                      <Text
                        style={[styles.descriptionTitle, { color: colors.text, marginTop: 16 }]}
                      >
                        Horários de Trabalho
                      </Text>
                      <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                        {barbeiro.workingHours.filter((h) => h).join(', ')}
                      </Text>
                    </>
                  )}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

// TODO: Implementar busca de último agendamento no Supabase
function getLastAppointment(barberId: string): string {
  // Placeholder - será implementado com dados reais do Supabase
  return 'Nenhum agendamento recente';
}

// Garantindo que colors seja acessível no escopo
export default function BookingScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <AppHeader />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textSecondary,
          tabBarIndicatorStyle: [styles.tabBarIndicator, { backgroundColor: colors.primary }],
          tabBarStyle: [
            styles.tabBarStyle,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ],
          tabBarLabelStyle: styles.tabBarLabelStyle,
        }}
      >
        <Tab.Screen name="Agendar" component={AgendarTab} />
        <Tab.Screen name="Profissionais" component={ProfissionaisTab} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  quickBookSection: {
    width: '100%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  quickBookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickBookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  quickBookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  quickBookInfo: {
    flex: 1,
  },
  quickBookService: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickBookDate: {
    fontSize: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    justifyContent: 'flex-start',
    width: '100%',
  },
  barbeiroButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  barbeiroButtonSelected: {},
  barbeiroText: {
    fontWeight: 'bold',
  },
  barbeiroTextSelected: {
    fontWeight: 'bold',
  },
  calendar: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
    borderWidth: 1,
  },
  horarioButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  horarioButtonSelected: {},
  horarioText: {
    fontWeight: 'bold',
  },
  horarioTextSelected: {
    fontWeight: 'bold',
  },
  noHorariosText: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  selectDataText: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    width: '100%',
    marginTop: 24,
    alignItems: 'center',
  },
  confirmButton: {
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  declarationText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 16,
    lineHeight: 16,
  },
  // Estilos do TabNavigator
  safeArea: {
    flex: 1,
  },
  tabBarIndicator: {
    height: 3,
  },
  tabBarStyle: {
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
  },
  tabBarLabelStyle: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'none',
  },
  // Estilos dos cards de profissionais
  professionalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  professionalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  professionalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    padding: 2,
    marginRight: 16,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  professionalDetails: {
    flex: 1,
  },
  professionalName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  professionalRole: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  professionalRating: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  expandIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  professionalDescription: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    paddingTop: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'justify',
  },
});
