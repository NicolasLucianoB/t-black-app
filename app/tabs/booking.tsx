import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import AppHeader from 'src/components/AppHeader';
import { useAuth } from 'src/contexts/AuthContext';
import { useTheme } from 'src/contexts/ThemeContext';
import { useCreateBooking } from 'src/hooks/useBookings';
import { useBookingNotifications } from 'src/hooks/useNotifications';
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
  const [allServices, setAllServices] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalAnimation] = useState(new Animated.Value(0));
  const [step, setStep] = useState<'professional' | 'datetime' | 'summary'>('professional');
  const [servicoSelecionado, setServicoSelecionado] = useState<any>(null);
  const [barbeiros, setBarbeiros] = useState<Barber[]>([]);
  const [barbeiro, setBarbeiro] = useState<string>('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [noConversation, setNoConversation] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);


  const {
    createBooking,
    loading: bookingLoading,
    error: bookingError,
  } = useCreateBooking(user?.id || '');

  const { scheduleBookingNotifications, isScheduling } = useBookingNotifications();

  // Carregar todos os serviços disponíveis
  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      try {
        const services = await databaseService.services.getAll();
        setAllServices(services);
      } catch (error) {
        console.error('Erro ao carregar serviços:', error);
        Alert.alert('Erro', 'Não foi possível carregar os serviços');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
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
        setHorariosDisponiveis(slots);
      } catch (error) {
        console.error('Erro ao carregar horários:', error);
        setHorariosDisponiveis([]);
      }
    };

    loadHorarios();
  }, [barbeiro, data]);

  // Funções para controlar o modal
  const openModal = () => {
    setIsModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      // Reset do modal
      setStep('professional');
      setServicoSelecionado(null);
      setBarbeiro('');
      setData('');
      setHorario('');
      setHorariosDisponiveis([]);
      setNoConversation(false);
      setObservacoes('');
    });
  };

  const handleConfirmar = async () => {
    if (!user?.id || !barbeiro || !servicoSelecionado || !data || !horario) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    try {
      const barbeiroSelecionado = barbeiros.find((b) => b.id === barbeiro);

      const bookingData = {
        barberId: barbeiro,
        serviceId: servicoSelecionado.id,
        date: data,
        time: horario,
        notes: `${servicoSelecionado.name} com ${barbeiroSelecionado?.name}`,
      };

      const result = await createBooking(bookingData, servicoSelecionado.price || 0);

      if (result?.data) {
        // Schedule smart notifications for this booking
        await scheduleBookingNotifications(
          result.data.id,
          data,
          horario,
          barbeiroSelecionado?.name || 'Barbeiro',
        );

        Alert.alert(
          'Sucesso!',
          `Agendamento realizado com ${barbeiroSelecionado?.name} em ${data} às ${horario}\n\n🔔 Você receberá lembretes antes do horário!`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Fechar modal e resetar
                closeModal();
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

  // Função para selecionar serviço e avançar para profissionais
  const handleServiceSelect = async (servico: any) => {
    setServicoSelecionado(servico);

    // Carregar barbeiros que oferecem este serviço
    try {
      const allBarbers = await databaseService.barbers.getAll();
      setBarbeiros(allBarbers);

      // Abrir modal e ir para seleção de profissional
      setStep('professional');
      openModal();
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      Alert.alert('Erro', 'Não foi possível carregar os profissionais');
    }
  };

  // Função para selecionar profissional e avançar para data/horário
  const handleProfessionalSelect = (barbeiroId: string) => {
    setBarbeiro(barbeiroId);
    setStep('datetime');
  };

  // Função para avançar para resumo após selecionar horário
  const handleTimeSelect = (time: string) => {
    setHorario(time);
    setStep('summary');
  };

  // Função para voltar ao passo anterior
  const handleBack = () => {
    if (step === 'professional') {
      closeModal();
    } else if (step === 'datetime') {
      setStep('professional');
      setBarbeiro('');
      setData('');
      setHorario('');
    } else if (step === 'summary') {
      setStep('datetime');
      setHorario('');
    }
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
      {/* Conteúdo Principal - Grid de Serviços */}
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, shadowColor: colors.shadow },
        ]}
      >
        <View style={styles.mainContent}>
          <Text style={[styles.mainTitle, { color: colors.text }]}>Nossos Serviços</Text>
          <Text style={[styles.mainSubtitle, { color: colors.textSecondary }]}>
            Escolha o serviço que deseja agendar
          </Text>

          <View style={styles.servicesGrid}>
            {loading ? (
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Carregando serviços...
              </Text>
            ) : (
              allServices.map((servico) => (
                <TouchableOpacity
                  key={servico.id}
                  style={[
                    styles.serviceCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={() => handleServiceSelect(servico)}
                >
                  <View style={styles.serviceHeader}>
                    <Text style={[styles.serviceName, { color: colors.text }]}>{servico.name}</Text>
                    <Text style={[styles.servicePrice, { color: colors.primary }]}>
                      R$ {servico.price.toFixed(2)}
                    </Text>
                  </View>
                  <Text
                    style={[styles.serviceDescription, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {servico.description}
                  </Text>
                  <View style={styles.serviceFooter}>
                    <View style={styles.serviceDurationContainer}>
                      <Ionicons name="time" size={14} color={colors.textSecondary} />
                      <Text style={[styles.serviceDuration, { color: colors.textSecondary }]}>
                        {servico.duration} min
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </View>

      {/* Modal Bottom Sheet para Agendamento */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeModal} />
          <Animated.View
            style={[
              styles.modalContainer,
              { backgroundColor: colors.background },
              {
                transform: [
                  {
                    translateY: modalAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [Dimensions.get('window').height, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Header do Modal - Minimalista */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={handleBack} style={styles.modalBackButton}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>

              <View style={styles.modalHeaderContent}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Agendamento</Text>
              </View>

              <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Indicador de Progresso Moderno */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.primary,
                      width:
                        step === 'professional'
                          ? '33%'
                          : step === 'datetime'
                            ? '66%'
                            : step === 'summary'
                              ? '100%'
                              : '0%',
                    },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text
                  style={[
                    styles.progressLabel,
                    {
                      color: step === 'professional' ? colors.primary : colors.textSecondary,
                      fontWeight: step === 'professional' ? '600' : '400',
                    },
                  ]}
                >
                  Profissional
                </Text>
                <Text
                  style={[
                    styles.progressLabel,
                    {
                      color: step === 'datetime' ? colors.primary : colors.textSecondary,
                      fontWeight: step === 'datetime' ? '600' : '400',
                    },
                  ]}
                >
                  Data/Hora
                </Text>
                <Text
                  style={[
                    styles.progressLabel,
                    {
                      color: step === 'summary' ? colors.primary : colors.textSecondary,
                      fontWeight: step === 'summary' ? '600' : '400',
                    },
                  ]}
                >
                  Confirmar
                </Text>
              </View>
            </View>

            {/* Conteúdo do Modal */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Step 1: Seleção de Profissional */}
              {step === 'professional' && (
                <View style={styles.modalStep}>
                  <View style={styles.stepHeader}>
                    <Text style={[styles.modalStepTitle, { color: colors.text }]}>
                      Profissional
                    </Text>
                    <Text style={[styles.modalStepSubtitle, { color: colors.textSecondary }]}>
                      Quem vai te atender?
                    </Text>
                  </View>

                  <View style={styles.professionalsGrid}>
                    {barbeiros.map((barber) => (
                      <TouchableOpacity
                        key={barber.id}
                        style={styles.professionalItem}
                        onPress={() => handleProfessionalSelect(barber.id)}
                      >
                        <View style={styles.professionalAvatarSimple}>
                          <View
                            style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}
                          >
                            <Text style={[styles.avatarText, { color: colors.card }]}>
                              {barber.name.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.professionalNameSimple, { color: colors.text }]}>
                          {barber.name.split(' ')[0]}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Step 2: Seleção de Data e Horário */}
              {step === 'datetime' && (
                <View style={styles.modalStep}>
                  <View style={styles.stepHeader}>
                    <Text style={[styles.modalStepTitle, { color: colors.text }]}>Quando?</Text>
                    <Text style={[styles.modalStepSubtitle, { color: colors.textSecondary }]}>
                      Escolha o melhor dia e horário
                    </Text>
                  </View>

                  <View style={styles.calendarSection}>
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
                  </View>

                  {data && (
                    <View style={styles.timeSection}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Horários disponíveis
                      </Text>
                      {horariosDisponiveis.length > 0 ? (
                        <View style={styles.timeGrid}>
                          {horariosDisponiveis.map((h) => (
                            <TouchableOpacity
                              key={h}
                              style={[
                                styles.timeButton,
                                { backgroundColor: colors.card, borderColor: colors.border },
                                horario === h && {
                                  backgroundColor: colors.primary,
                                  borderColor: colors.primary,
                                },
                              ]}
                              onPress={() => handleTimeSelect(h)}
                            >
                              <Text
                                style={[
                                  styles.timeButtonText,
                                  { color: horario === h ? colors.card : colors.text },
                                ]}
                              >
                                {h}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : (
                        <Text style={[styles.noHorariosText, { color: colors.textSecondary }]}>
                          Nenhum horário disponível para esta data
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Step 3: Resumo e Finalização */}
              {step === 'summary' && (
                <View style={styles.modalStep}>
                  <View style={styles.stepHeader}>
                    <Text style={[styles.modalStepTitle, { color: colors.text }]}>
                      Confirmar agendamento
                    </Text>
                    <Text style={[styles.modalStepSubtitle, { color: colors.textSecondary }]}>
                      Revise os detalhes antes de finalizar
                    </Text>
                  </View>

                  {/* Resumo do Agendamento - Design Minimalista */}
                  <View
                    style={[
                      styles.compactSummaryCard,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    {/* Nome do Serviço */}
                    <Text style={[styles.serviceTitle, { color: colors.text }]}>
                      {servicoSelecionado?.name}
                    </Text>

                    {/* Linha principal com profissional e data */}
                    <View style={styles.mainSummaryRow}>
                      {/* Profissional (esquerda) */}
                      <View style={styles.professionalSummary}>
                        <View style={styles.professionalAvatarSmall}>
                          <Text style={styles.avatarInitials}>
                            {barbeiros.find((b) => b.id === barbeiro)?.name?.charAt(0) || 'T'}
                          </Text>
                        </View>
                        <Text style={[styles.professionalNameSmall, { color: colors.text }]}>
                          {barbeiros.find((b) => b.id === barbeiro)?.name}
                        </Text>
                      </View>

                      {/* Data (direita) */}
                      <View style={styles.dateSummary}>
                        <Text style={[styles.dayNumber, { color: colors.text }]}>
                          {new Date(data + 'T00:00:00').getDate()}
                        </Text>
                        <Text style={[styles.monthAbbr, { color: colors.textSecondary }]}>
                          {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {/* Linha inferior com preço e horário */}
                    <View style={styles.bottomSummaryRow}>
                      <Text style={[styles.priceCompact, { color: '#25D366' }]}>
                        R$ {servicoSelecionado?.price.toFixed(2)}
                      </Text>
                      <Text style={[styles.timeCompact, { color: colors.textSecondary }]}>
                        {horario} • {servicoSelecionado?.duration}min
                      </Text>
                    </View>
                  </View>

                  {/* Preferências */}
                  <View style={styles.preferencesSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferências</Text>

                    <View
                      style={[
                        styles.preferenceCard,
                        { backgroundColor: colors.card, borderColor: colors.border },
                      ]}
                    >
                      <View style={styles.preferenceRow}>
                        <View style={styles.preferenceInfo}>
                          <Text style={[styles.preferenceTitle, { color: colors.text }]}>
                            Atendimento silencioso
                          </Text>
                          <Text
                            style={[styles.preferenceSubtitle, { color: colors.textSecondary }]}
                          >
                            Não quero conversar durante o atendimento
                          </Text>
                        </View>
                        <Switch
                          value={noConversation}
                          onValueChange={setNoConversation}
                          trackColor={{ false: colors.border, true: colors.primary }}
                          thumbColor={noConversation ? '#fff' : '#f4f3f4'}
                        />
                      </View>
                    </View>

                    <View style={styles.observationsSection}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Observações</Text>
                      <TextInput
                        style={[
                          styles.observationsInput,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                            color: colors.text,
                          },
                        ]}
                        placeholder="Alguma observação especial? (opcional)"
                        placeholderTextColor={colors.textSecondary}
                        value={observacoes}
                        onChangeText={setObservacoes}
                        multiline
                        numberOfLines={3}
                        maxLength={200}
                      />
                      <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                        {observacoes.length}/200 caracteres
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Botão de confirmar fixo no bottom */}
            {step === 'summary' && (
              <View
                style={[
                  styles.modalFooter,
                  { backgroundColor: colors.background, borderTopColor: colors.border },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: colors.primary },
                    bookingLoading && { opacity: 0.7 },
                  ]}
                  onPress={handleConfirmar}
                  disabled={bookingLoading}
                >
                  <Text style={[styles.confirmButtonText, { color: colors.card }]}>
                    {bookingLoading
                      ? 'Confirmando...'
                      : `Confirmar Agendamento - R$ ${servicoSelecionado?.price.toFixed(2)}`}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </View>
      </Modal>
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
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              borderRadius: 16,
              marginHorizontal: 16,
              marginBottom: 16,
              overflow: 'hidden',
            }}
          >
            {/* Header do Profissional */}
            <TouchableOpacity
              onPress={() => toggleExpand(barbeiro.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 20,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={[styles.professionalName, { color: colors.text }]}>
                    {barbeiro.name || 'Nome não disponível'}
                  </Text>
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

            {/* Conteúdo Expandido */}
            {expandedBarbeiro === barbeiro.id && (
              <View
                style={{
                  backgroundColor: colors.card,
                  padding: 20,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontSize: 15,
                    lineHeight: 22,
                    textAlign: 'justify',
                  }}
                >
                  {barbeiro.description || 'Profissional qualificado do Studio T Black.'}
                </Text>
                {barbeiro.specialties && barbeiro.specialties.length > 0 && (
                  <View style={{ marginTop: 16 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 8,
                      }}
                    >
                      Especialidades
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.textSecondary,
                      }}
                    >
                      {barbeiro.specialties.join(' • ')}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}


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
  // Novos estilos para o fluxo step-by-step
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  // Estilos para serviços
  servicesGrid: {
    gap: 12,
  },
  serviceCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  serviceDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceDuration: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Estilos para profissionais
  professionalsContainer: {
    gap: 12,
  },
  professionalInfoModal: {
    flex: 1,
  },
  specialties: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  // Estilos para tela principal
  mainContent: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  mainSubtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  // Estilos para o Modal Bottom Sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    minHeight: '90%',
    maxHeight: '95%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalBackButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderContent: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    textAlign: 'center',
    flex: 1,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalStep: {
    paddingVertical: 16,
  },
  modalStepTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalStepSubtitle: {
    fontSize: 15,
    marginBottom: 20,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  // Novos estilos para o modal aprimorado
  stepHeader: {
    marginBottom: 24,
  },
  professionalAvatar: {
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  calendarSection: {
    marginBottom: 24,
  },
  timeSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    marginVertical: 12,
    marginLeft: 32,
  },
  preferencesSection: {
    marginBottom: 24,
  },
  preferenceCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 12,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  preferenceSubtitle: {
    fontSize: 14,
  },
  observationsSection: {
    marginTop: 8,
  },
  observationsInput: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  // Estilos para o resumo compacto
  compactSummaryCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'left',
  },
  mainSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  professionalSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  professionalAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  professionalNameSmall: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateSummary: {
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  monthAbbr: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  bottomSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceCompact: {
    fontSize: 16,
    fontWeight: '700',
  },
  timeCompact: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Estilos para grid de profissionais sem cards
  professionalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  professionalItem: {
    alignItems: 'center',
    marginBottom: 24,
    width: '30%',
    minWidth: 80,
  },
  professionalAvatarSimple: {
    marginBottom: 8,
  },
  professionalNameSimple: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
});
