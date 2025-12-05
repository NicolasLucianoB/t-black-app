import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

// Third party imports
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Calendar } from 'react-native-calendars';

// Local imports
import AppHeader from 'src/components/AppHeader';
import { useAdminMode } from 'src/contexts/AdminModeContext';
import { useAuth } from 'src/contexts/AuthContext';
import { useTheme } from 'src/contexts/ThemeContext';
import { useCreateBooking } from 'src/hooks/useBookings';
import { useBookingNotifications } from 'src/hooks/useNotifications';
import { databaseService } from 'src/services';
import { Barber } from 'src/types';

/**
 * BookingScreen - Interface híbrida de agendamentos
 *
 * Funcionalidades:
 * - Modo cliente: interface de agendamento tradicional
 * - Modo admin: agenda estilo Apple Calendar com CRUD completo
 * - Timeline com horário atual em tempo real
 * - Carrossel de profissionais
 * - Modal de CRUD com date/time pickers nativos
 */

const Tab = createMaterialTopTabNavigator();

// Constants
const WORKING_HOURS = {
  START: 7,
  END: 19,
  SLOT_DURATION: 30, // minutes
};

const TIME_FORMAT_OPTIONS = {
  hour: '2-digit' as const,
  minute: '2-digit' as const,
};

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
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);

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
                        <View style={styles.timeGridCentered}>
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

              {/* Step 2: Resumo e Finalização */}
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
                          {new Date(data + 'T00:00:00')
                            .toLocaleDateString('pt-BR', { month: 'short' })
                            .toUpperCase()}
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

// Componente da Agenda Administrativa - Estilo Apple Calendar
function AgendaAdminTab() {
  const { colors } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBarberId, setSelectedBarberId] = useState<string>('');
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [barbeiros, setBarbeiros] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estados do modal CRUD
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    barberId: '',
    serviceId: '',
    date: '',
    time: '',
    notes: '',
  });
  const [isNewClient, setIsNewClient] = useState(false);

  // Estados para date/time pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());

  // Estados para dropdowns
  const [selectedBarbierModal, setSelectedBarbierModal] = useState<any>(null);

  // Função auxiliar para garantir data válida
  const getSafeDate = (date: Date | string | undefined): Date => {
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date;
    }
    if (typeof date === 'string') {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime()) ? parsed : new Date();
    }
    return new Date();
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();

    // Fallback para garantir que loading não fique travado
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Loading timeout - forçando setLoading(false)');
      setLoading(false);
    }, 5000); // 5 segundos

    return () => clearTimeout(timeoutId);
  }, []);

  // UseEffect separado para garantir inicialização dos estados de data/hora
  useEffect(() => {
    const now = new Date();
    setSelectedDate(now);
    setSelectedTime(now);
  }, []); // Remove dependências para evitar loops

  // Carregar agendamentos quando data ou barbeiro mudam
  useEffect(() => {
    if (selectedBarberId) {
      loadBookingsForDate();
    }
  }, [currentDate, selectedBarberId]);

  // Atualizar horário atual a cada minuto - pausar quando modal estiver aberta
  useEffect(() => {
    // Não iniciar timer se modal estiver aberta
    if (showBookingModal) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualiza a cada 60 segundos

    return () => clearInterval(interval);
  }, [showBookingModal]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [barbersData, servicesData, clientsData] = await Promise.all([
        databaseService.barbers.getAll(),
        databaseService.services.getAll(),
        databaseService.users.getAll(),
      ]);

      setBarbeiros(barbersData);
      setAllServices(servicesData);
      // Filtrar apenas usuários com role 'client' ou 'cliente'
      const filteredClients = clientsData.filter(
        (user: any) =>
          user.user_role === 'client' ||
          user.user_role === 'cliente' ||
          (!user.user_role && user.email), // Fallback para usuários sem role definida
      );
      setAllClients(filteredClients);

      if (barbersData.length > 0) {
        setSelectedBarberId(barbersData[0].id);
        // Carregar agendamentos após definir o barbeiro
        await loadBookingsForDateWithBarber(barbersData[0].id);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookingsForDateWithBarber = async (barberId: string) => {
    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const allBookings = await databaseService.bookings.getByDate(dateStr);

      const barberBookings = allBookings.filter((booking) => booking.barber_id === barberId);

      setAgendamentos(barberBookings);
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
    }
  };

  const loadBookingsForDate = async () => {
    if (!selectedBarberId) return;

    try {
      const dateStr = currentDate.toISOString().split('T')[0];
      const allBookings = await databaseService.bookings.getByDate(dateStr);

      const barberBookings = allBookings.filter(
        (booking) => booking.barber_id === selectedBarberId,
      );

      setAgendamentos(barberBookings);
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
    }
  };

  // Gerar dias da semana
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Gerar horários (8h às 20h)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 20) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  // Obter horário atual para a agulha (apenas no dia atual)
  const getCurrentTimePosition = () => {
    const now = currentTime;
    const today = now.toDateString();
    const selectedDay = currentDate.toDateString();

    // Só mostrar agulha se o dia selecionado for hoje
    if (today !== selectedDay) return null;

    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Só mostrar agulha no horário de funcionamento (8h às 20h)
    if (hours < 8 || hours > 20) return null;

    const totalMinutes = (hours - 8) * 60 + minutes;
    const slotHeight = 60; // altura de cada slot
    const position = (totalMinutes / 30) * slotHeight;
    return position;
  };
  const weekDays = getWeekDays();
  const timeSlots = generateTimeSlots();
  const currentTimePosition = getCurrentTimePosition();

  // Função para abrir modal de criação
  const openCreateModal = () => {
    setEditingBooking(null);

    // Resetar dados do formulário
    const today = new Date();
    const currentTime = new Date();
    setSelectedDate(today);
    setSelectedTime(currentTime);
    setSelectedBarbierModal(barbeiros.find((b) => b.id === selectedBarberId) || null);
    setFormData({
      clientId: '',
      clientName: '',
      barberId: selectedBarberId || '',
      serviceId: '',
      date: today.toISOString().split('T')[0],
      time: currentTime.toLocaleTimeString('pt-BR', TIME_FORMAT_OPTIONS),
      notes: '',
    });

    setShowBookingModal(true);
  };

  // Função para editar agendamento
  const handleEditBooking = (booking: any) => {
    setEditingBooking(booking);

    // Preencher dados do agendamento para edição
    const bookingDate = booking.date ? new Date(booking.date) : new Date();
    const bookingTime = new Date();
    if (booking.time) {
      const [hours, minutes] = booking.time.split(':');
      bookingTime.setHours(parseInt(hours) || 0, parseInt(minutes) || 0);
    }

    setSelectedDate(bookingDate);
    setSelectedTime(bookingTime);
    setSelectedBarbierModal(barbeiros.find((b) => b.id === booking.barber_id) || null);
    setFormData({
      clientId: booking.user_id || '',
      clientName: booking.client_name || '',
      barberId: booking.barber_id || '',
      serviceId: booking.service_id || '',
      date: booking.date,
      time: booking.time,
      notes: booking.notes || '',
    });

    setShowBookingModal(true);
  };

  // Função para salvar agendamento
  const handleSaveBooking = async () => {
    try {
      // Pegar dados do modal (usando closure para acessar os estados internos)
      // Validação será feita aqui com os dados corretos

      if (!formData.barberId || !formData.serviceId) {
        Alert.alert('Erro', 'Selecione o profissional e o serviço');
        return;
      }

      // Cliente: pode ser ID (cadastrado) ou nome customizado
      const clientId = formData.clientId || null;
      const clientName = formData.clientName || '';

      if (!clientId && !clientName) {
        Alert.alert('Erro', 'Selecione um cliente ou digite o nome');
        return;
      }

      if (editingBooking) {
        // Editar agendamento existente
        const updates = {
          user_id: clientId,
          barber_id: formData.barberId,
          service_id: formData.serviceId,
          date: formData.date,
          time: formData.time,
          notes: formData.notes,
          client_name: clientName, // Para clientes não cadastrados
        };

        const updated = await databaseService.bookings.update(editingBooking.id, updates);

        if (updated) {
          Alert.alert('Sucesso', 'Agendamento atualizado com sucesso!');
          await loadBookingsForDate();
        } else {
          Alert.alert('Erro', 'Não foi possível atualizar o agendamento');
        }
      } else {
        // Criar novo agendamento
        const bookingData: any = {
          barberId: formData.barberId,
          serviceId: formData.serviceId,
          date: formData.date,
          time: formData.time,
          notes: formData.notes,
          clientName: clientName, // Para clientes não cadastrados
        };

        // Só adiciona userId se existir
        if (clientId) {
          bookingData.userId = clientId;
        }

        const newBooking = await databaseService.bookings.create(bookingData);

        if (newBooking) {
          Alert.alert('Sucesso', 'Agendamento criado com sucesso!');
          await loadBookingsForDate();
        } else {
          Alert.alert('Erro', 'Não foi possível criar o agendamento');
        }
      }

      setShowBookingModal(false);
    } catch (error) {
      console.error('❌ Erro ao salvar agendamento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o agendamento');
    }
  };

  // Função para deletar agendamento
  const handleDeleteBooking = async () => {
    if (!editingBooking) return;

    Alert.alert('Confirmar Exclusão', 'Tem certeza que deseja excluir este agendamento?', [
      {
        text: 'Cancelar',
        style: 'cancel',
      },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await databaseService.bookings.delete(editingBooking.id);

            if (success) {
              Alert.alert('Sucesso', 'Agendamento excluído com sucesso!');
              await loadBookingsForDate();
              setShowBookingModal(false);
            } else {
              Alert.alert('Erro', 'Não foi possível excluir o agendamento');
            }
          } catch (error) {
            console.error('❌ Erro ao deletar agendamento:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao excluir o agendamento');
          }
        },
      },
    ]);
  };

  // Função para cancelar agendamento (muda status para 'cancelled')
  const handleCancelBooking = async () => {
    if (!editingBooking) return;

    Alert.alert('Cancelar Agendamento', 'Tem certeza que deseja cancelar este agendamento?', [
      {
        text: 'Não',
        style: 'cancel',
      },
      {
        text: 'Sim, Cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = await databaseService.bookings.update(editingBooking.id, {
              status: 'cancelled',
            });

            if (updated) {
              Alert.alert('Sucesso', 'Agendamento cancelado com sucesso!');
              await loadBookingsForDate();
              setShowBookingModal(false);
            } else {
              Alert.alert('Erro', 'Não foi possível cancelar o agendamento');
            }
          } catch (error) {
            console.error('❌ Erro ao cancelar agendamento:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao cancelar o agendamento');
          }
        },
      },
    ]);
  };

  // Navegação de semana
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Obter agendamento para um horário específico
  const getBookingForTime = (time: string) => {
    // time vem no formato "08:00", booking.time vem como "16:00:00"
    return agendamentos.find((booking) => {
      const bookingTime = booking.time.substring(0, 5); // Pega só HH:MM
      return bookingTime === time;
    });
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Carregando agenda...</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.calendarContainer,
        {
          backgroundColor: colors.background,
          minHeight: 500,
        },
      ]}
    >
      {/* Container da agenda */}
      {/* Header do Mês */}
      <View
        style={[
          styles.monthHeader,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.monthText, { color: colors.text }]}>
          {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </Text>

        <TouchableOpacity onPress={goToNextWeek} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Dias da Semana */}
      <View
        style={[
          styles.weekHeader,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = day.toDateString() === currentDate.toDateString();

          return (
            <TouchableOpacity
              key={index}
              style={styles.dayButton}
              onPress={() => setCurrentDate(day)}
            >
              <Text style={[styles.dayName, { color: colors.textSecondary }]}>
                {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
              </Text>
              <View
                style={[
                  styles.dayNumberContainer,
                  isSelected && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    { color: isToday ? colors.primary : colors.text },
                    isSelected && { color: colors.card },
                  ]}
                >
                  {day.getDate()}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Carrossel de Profissionais */}
      <View
        style={[
          styles.professionalsCarousel,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
        >
          {barbeiros.map((barber) => (
            <TouchableOpacity
              key={barber.id}
              style={[
                styles.professionalChip,
                {
                  backgroundColor: selectedBarberId === barber.id ? colors.primary : colors.card,
                  borderColor: selectedBarberId === barber.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedBarberId(barber.id)}
            >
              <View
                style={[
                  styles.professionalAvatar,
                  {
                    backgroundColor: selectedBarberId === barber.id ? colors.card : colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.professionalInitial,
                    { color: selectedBarberId === barber.id ? colors.primary : colors.card },
                  ]}
                >
                  {barber.name.charAt(0)}
                </Text>
              </View>
              <Text
                style={[
                  styles.professionalName,
                  { color: selectedBarberId === barber.id ? colors.card : colors.text },
                ]}
              >
                {barber.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Timeline da Agenda */}
      <View
        style={[
          styles.timelineContainer,
          {
            flex: 1,
            backgroundColor: colors.background,
            minHeight: 300,
          },
        ]}
      >
        <ScrollView style={styles.timelineScroll} showsVerticalScrollIndicator={false}>
          {/* Container para a agulha do horário atual */}
          {currentTimePosition !== null && (
            <View
              style={[
                styles.currentTimeIndicator,
                {
                  top: currentTimePosition + 8, // offset reduzido para headers compactos
                  backgroundColor: '#FF3B30',
                },
              ]}
            >
              <View style={[styles.currentTimeLabel, { backgroundColor: '#FF3B30' }]}>
                <Text style={[styles.currentTimeLabelText, { color: '#FFFFFF' }]}>
                  {new Date().getHours().toString().padStart(2, '0')}:
                  {new Date().getMinutes().toString().padStart(2, '0')}
                </Text>
              </View>
              <View style={[styles.currentTimeLine, { backgroundColor: '#FF3B30' }]} />
            </View>
          )}

          {timeSlots.map((time, index) => {
            const booking = getBookingForTime(time);
            const isCancelled = booking?.status === 'cancelled';
            const isCompleted = booking?.status === 'completed';
            const isScheduled = booking?.status === 'scheduled' || booking?.status === 'confirmed';

            return (
              <View key={time} style={[styles.timeSlot, { borderBottomColor: colors.border }]}>
                {/* Horário */}
                <View style={styles.timeColumn}>
                  <Text style={[styles.timeText, { color: colors.textSecondary }]}>{time}</Text>
                </View>

                {/* Evento ou slot vazio */}
                <View style={styles.eventColumn}>
                  {booking ? (
                    <TouchableOpacity
                      style={[
                        styles.eventBlock,
                        {
                          backgroundColor: isCancelled
                            ? '#FF3B3020'
                            : isCompleted
                              ? '#8E8E9320'
                              : '#34C75920',
                          borderColor: isCancelled
                            ? '#FF3B30'
                            : isCompleted
                              ? '#8E8E93'
                              : '#34C759',
                          opacity: isCancelled || isCompleted ? 0.6 : 1,
                        },
                      ]}
                      onPress={() => handleEditBooking(booking)}
                    >
                      <Text
                        style={[
                          styles.eventTitle,
                          {
                            color: colors.text,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {booking.client_name || 'Cliente'}
                      </Text>
                      <Text
                        style={[styles.eventSubtitle, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {booking.service_name || 'Serviço'} • {booking.service_duration || 30}min
                      </Text>
                      {booking.notes && (
                        <Text
                          style={[
                            styles.eventSubtitle,
                            { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
                          ]}
                          numberOfLines={1}
                        >
                          💬 {booking.notes}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.emptyEventSlot} />
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: colors.primary }]}
        onPress={openCreateModal}
      >
        <Ionicons name="add" size={24} color={colors.card} />
      </TouchableOpacity>

      {/* Modal CRUD */}
      <BookingCRUDModal />
    </View>
  );

  // Componente do Modal CRUD
  function BookingCRUDModal() {
    const { colors } = useTheme();
    const colorScheme = useColorScheme();
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [showClientPicker, setShowClientPicker] = useState(false);
    const [showServicePicker, setShowServicePicker] = useState(false);
    const [customClientName, setCustomClientName] = useState('');
    const [observations, setObservations] = useState('');

    // Sincronizar estados quando estiver editando
    useEffect(() => {
      if (editingBooking && showBookingModal) {
        // Carregar cliente
        const client = allClients.find((c) => c.id === editingBooking.user_id);
        setSelectedClient(client || null);

        // Carregar serviço
        const service = allServices.find((s) => s.id === editingBooking.service_id);
        setSelectedService(service || null);

        // Carregar observações
        setObservations(editingBooking.notes || '');

        // Se não tem cliente cadastrado, mostrar nome customizado
        if (!client && editingBooking.client_name) {
          setCustomClientName(editingBooking.client_name);
        }
      }
    }, [editingBooking, showBookingModal]);

    // Função para fechar o modal
    const closeModal = () => {
      setShowBookingModal(false);
      setEditingBooking(null);
      // Reset all internal states
      setSelectedClient(null);
      setSelectedService(null);
      setShowClientPicker(false);
      setShowServicePicker(false);
      setCustomClientName('');
      setObservations('');
    };

    // Não renderiza nada se o modal não deveria estar visível
    if (!showBookingModal) {
      return null;
    }

    return (
      <Modal visible={showBookingModal} animationType="slide" onRequestClose={closeModal}>
        <View style={[{ flex: 1, backgroundColor: colors.background }]}>
          {/* Header */}
          <SafeAreaView style={{ backgroundColor: colors.background }}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingBooking ? 'Editar Agendamento' : 'Novo Agendamento'}
              </Text>
              <View style={styles.headerSpacer} />
            </View>
          </SafeAreaView>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* 1. Data e Horário */}
            <View style={styles.formSection}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Data e Horário</Text>
              </View>

              <View style={styles.dateTimeRow}>
                <View style={styles.dateField}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Data</Text>
                  <TouchableOpacity
                    style={[
                      styles.inputField,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={[styles.inputText, { color: colors.text }]}>
                      {getSafeDate(selectedDate).toLocaleDateString('pt-BR')}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.timeField}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Horário</Text>
                  <TouchableOpacity
                    style={[
                      styles.inputField,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={[styles.inputText, { color: colors.text }]}>
                      {getSafeDate(selectedTime).toLocaleTimeString('pt-BR', TIME_FORMAT_OPTIONS)}
                    </Text>
                    <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* 2. Profissional */}
            <View style={styles.formSection}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Profissional</Text>
              </View>

              {barbeiros.map((barber) => (
                <TouchableOpacity
                  key={barber.id}
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: colors.card,
                      borderColor:
                        selectedBarbierModal?.id === barber.id || formData.barberId === barber.id
                          ? colors.primary
                          : colors.border,
                      borderWidth:
                        selectedBarbierModal?.id === barber.id || formData.barberId === barber.id
                          ? 2
                          : 1,
                      marginBottom: 12,
                    },
                  ]}
                  onPress={() => {
                    setSelectedBarbierModal(barber);
                    setFormData((prev) => ({ ...prev, barberId: barber.id }));
                  }}
                >
                  <View style={styles.professionalOption}>
                    <View style={[styles.professionalAvatar, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.professionalInitial, { color: colors.card }]}>
                        {barber.name?.charAt(0) || 'P'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.inputText, { color: colors.text }]}>{barber.name}</Text>
                      {barber.description && (
                        <Text style={[{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }]}>
                          {barber.description}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* 3. Cliente */}
            <View style={styles.formSection}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="people-outline" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Cliente</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.inputField,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowClientPicker(true)}
              >
                <Text
                  style={[
                    styles.inputText,
                    { color: selectedClient ? colors.text : colors.textSecondary },
                  ]}
                >
                  {selectedClient?.name || 'Selecionar cliente cadastrado'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <Text style={[styles.orText, { color: colors.textSecondary }]}>ou</Text>

              <TextInput
                style={[
                  styles.inputField,
                  { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="Digite o nome do novo cliente"
                placeholderTextColor={colors.textSecondary}
                value={customClientName}
                onChangeText={(text) => {
                  setCustomClientName(text);
                  if (text) {
                    setSelectedClient(null);
                    setFormData((prev) => ({
                      ...prev,
                      clientId: '',
                      clientName: text,
                    }));
                  }
                }}
              />
            </View>

            {/* 4. Serviço */}
            <View style={styles.formSection}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="cut-outline" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Serviço</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.inputField,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => setShowServicePicker(true)}
              >
                <Text
                  style={[
                    styles.inputText,
                    { color: selectedService ? colors.text : colors.textSecondary },
                  ]}
                >
                  {selectedService?.name || 'Selecionar serviço'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {selectedService && (
                <Text style={[styles.servicePrice, { color: colors.primary }]}>
                  R$ {selectedService.price}
                </Text>
              )}
            </View>

            {/* 5. Observações */}
            <View style={styles.formSection}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Observações</Text>
              </View>

              <TextInput
                style={[
                  styles.inputField,
                  styles.textArea,
                  { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                ]}
                placeholder="Adicione observações sobre o agendamento..."
                placeholderTextColor={colors.textSecondary}
                value={observations}
                onChangeText={(text) => {
                  setObservations(text);
                  setFormData((prev) => ({
                    ...prev,
                    notes: text,
                  }));
                }}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Botão Agendar */}
            <View style={styles.agendarButtonContainer}>
              <TouchableOpacity
                style={[styles.agendarButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveBooking}
                disabled={modalLoading}
              >
                <Text style={[styles.agendarButtonText, { color: colors.card }]}>
                  {modalLoading ? 'Agendando...' : editingBooking ? 'Atualizar' : 'Agendar'}
                </Text>
              </TouchableOpacity>

              {/* Botões de ação para edição */}
              {editingBooking && (
                <>
                  <TouchableOpacity
                    style={[
                      styles.agendarButton,
                      {
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: '#FF9500',
                        marginTop: 12,
                      },
                    ]}
                    onPress={handleCancelBooking}
                    disabled={modalLoading}
                  >
                    <Text style={[styles.agendarButtonText, { color: '#FF9500' }]}>
                      Cancelar Agendamento
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.agendarButton,
                      {
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: '#FF3B30',
                        marginTop: 12,
                      },
                    ]}
                    onPress={handleDeleteBooking}
                    disabled={modalLoading}
                  >
                    <Text style={[styles.agendarButtonText, { color: '#FF3B30' }]}>
                      Excluir Agendamento
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>

          {/* Client Picker Modal */}
          <Modal visible={showClientPicker} animationType="slide" presentationStyle="pageSheet">
            <View style={{ flex: 1, backgroundColor: colors.background }}>
              <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => setShowClientPicker(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.pickerTitle, { color: colors.text }]}>Selecionar Cliente</Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView style={styles.pickerList}>
                {allClients.map((client) => (
                  <TouchableOpacity
                    key={client.id}
                    style={[styles.clientItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setSelectedClient(client);
                      setCustomClientName('');
                      setFormData((prev) => ({
                        ...prev,
                        clientId: client.id,
                        clientName: client.name,
                      }));
                      setShowClientPicker(false);
                    }}
                  >
                    <Text style={[styles.clientName, { color: colors.text }]}>{client.name}</Text>
                    <Text style={[styles.clientEmail, { color: colors.textSecondary }]}>
                      {client.email}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Modal>

          {/* Service Picker Modal */}
          <Modal visible={showServicePicker} animationType="slide" presentationStyle="pageSheet">
            <View style={{ flex: 1, backgroundColor: colors.background }}>
              <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => setShowServicePicker(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.pickerTitle, { color: colors.text }]}>Selecionar Serviço</Text>
                <View style={{ width: 40 }} />
              </View>

              <ScrollView style={styles.pickerList}>
                {allServices.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={[styles.serviceItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setSelectedService(service);
                      setFormData((prev) => ({
                        ...prev,
                        serviceId: service.id,
                      }));
                      setShowServicePicker(false);
                    }}
                  >
                    <View style={styles.serviceInfo}>
                      <Text style={[styles.serviceName, { color: colors.text }]}>
                        {service.name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.serviceDuration, { color: colors.textSecondary }]}>
                          {service.duration} min
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.servicePrice, { color: colors.primary }]}>
                      R$ {service.price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Modal>
        </View>
        {/* Date Picker */}
        {showDatePicker && (
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          >
            <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.pickerTitle, { color: colors.text }]}>Selecionar Data</Text>
              <DateTimePicker
                value={getSafeDate(selectedDate)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
                textColor={colors.text}
                accentColor={colors.primary}
                onChange={(event, date) => {
                  if (event.type === 'set' && date) {
                    setSelectedDate(date);
                  }
                }}
              />
              <View style={styles.pickerButtons}>
                <TouchableOpacity
                  style={[styles.pickerButton, styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.pickerButton,
                    styles.confirmButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => {
                    setFormData((prev) => ({
                      ...prev,
                      date: selectedDate.toISOString().split('T')[0],
                    }));
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={[styles.confirmButtonText, { color: colors.card }]}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        {/* Time Picker */}
        {showTimePicker && (
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowTimePicker(false)}
          >
            <TouchableOpacity
              style={[styles.pickerContainer, { backgroundColor: colors.background }]}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <DateTimePicker
                value={getSafeDate(selectedTime)}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
                textColor={colors.text}
                accentColor={colors.primary}
                onChange={(event, time) => {
                  if (event.type === 'dismissed') {
                    setShowTimePicker(false);
                    return;
                  }
                  if (event.type === 'set' && time) {
                    setSelectedTime(time);
                    const timeString = time.toLocaleTimeString('pt-BR', TIME_FORMAT_OPTIONS);
                    setFormData((prev) => ({
                      ...prev,
                      time: timeString,
                    }));
                    // Fechar o picker após seleção
                    setShowTimePicker(false);
                  }
                }}
                onTouchCancel={() => setShowTimePicker(false)}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      </Modal>
    );
  }
}

export default function BookingScreen() {
  const { colors } = useTheme();
  const { isAdminMode } = useAdminMode();
  const colorScheme = useColorScheme();

  // Se está em modo admin, mostra apenas a agenda administrativa
  if (isAdminMode) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <AppHeader />
        <AgendaAdminTab />
      </SafeAreaView>
    );
  }

  // Modo cliente normal
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
  // Removed duplicate definition of confirmButton
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
    flex: 1,
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    lineHeight: 20,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
    paddingVertical: 2,
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
  // Estilos para Agenda Administrativa
  agendaContainer: {
    flex: 1,
  },
  agendaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  agendaScroll: {
    flex: 1,
  },
  timelineContainer: {
    flex: 1,
    minWidth: '100%',
  },
  timelineHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  timeColumn: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  barberColumn: {
    width: 120,
    alignItems: 'center',
  },
  barberHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '100%',
    borderRadius: 8,
    margin: 4,
  },
  barberAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  barberInitial: {
    fontSize: 14,
    fontWeight: '700',
  },
  barberName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  timelineGrid: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
    minHeight: 60,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  appointmentSlot: {
    margin: 2,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    minHeight: 50,
    justifyContent: 'center',
    width: 116,
  },
  appointmentClient: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  appointmentService: {
    fontSize: 10,
    fontWeight: '400',
  },
  emptySlot: {
    margin: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    minHeight: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 116,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Estilos Apple Calendar
  calendarContainer: {
    flex: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  weekHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    marginHorizontal: 2,
  },
  dayName: {
    fontSize: 8,
    fontWeight: '500',
    marginBottom: 1,
    textTransform: 'uppercase',
  },
  dayNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  professionalsCarousel: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  carouselContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  professionalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  professionalAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  professionalInitial: {
    fontSize: 12,
    fontWeight: '700',
  },
  timelineScroll: {
    flex: 1,
  },
  timeSlot: {
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 0.5,
    position: 'relative',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  eventColumn: {
    flex: 1,
    paddingLeft: 12,
    paddingRight: 16,
    paddingVertical: 4,
  },
  eventBlock: {
    backgroundColor: '#007AFF20',
    borderLeftWidth: 3,
    borderRadius: 6,
    padding: 8,
    minHeight: 50,
    justifyContent: 'center',
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventSubtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  emptyEventSlot: {
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  currentTimeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentTimeLabel: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
    marginRight: 10,
    minWidth: 45,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentTimeLabelText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 13,
    textAlignVertical: 'center',
    includeFontPadding: false,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    marginRight: 16,
  },
  // Estilos Modal CRUD
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 2,
  },
  timeField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  inputText: {
    fontSize: 16,
    flex: 1,
  },
  professionalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginVertical: 8,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickerList: {
    flex: 1,
  },
  clientItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 14,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  serviceInfo: {
    flex: 1,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  formSection: {
    marginVertical: 12,
  },
  formRow: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  picker: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clientToggle: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  clientChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  clientChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  serviceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    minWidth: 100,
  },
  serviceChipTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  serviceChipPrice: {
    fontSize: 12,
    fontWeight: '500',
  },
  deleteButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
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
  timeGridCentered: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  closeButton: {
    padding: 8,
  },
  headerSpacer: {
    width: 40,
  },
  agendarButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  agendarButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  agendarButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerContainer: {
    borderRadius: 12,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pickerButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  pickerButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {},
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
