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
import { useAdminMode } from 'src/contexts/AdminModeContext';
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
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estados do modal CRUD
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<any>(null);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);

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
  const [modalLoading, setModalLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  // Carregar agendamentos quando data ou barbeiro mudam
  useEffect(() => {
    if (selectedBarberId) {
      loadBookingsForDate();
    }
  }, [currentDate, selectedBarberId]);

  // Atualizar horário atual a cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualiza a cada 60 segundos

    return () => clearInterval(interval);
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [barbersData, servicesData, clientsData] = await Promise.all([
        databaseService.barbers.getAll(),
        databaseService.services.getAll(),
        databaseService.users.getAll(), // Assumindo que temos este método
      ]);

      setBarbeiros(barbersData);
      setAllServices(servicesData);
      setAllClients(clientsData.filter((user) => user.role === 'client'));

      if (barbersData.length > 0) {
        setSelectedBarberId(barbersData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
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
      console.error('Erro ao carregar agendamentos:', error);
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
    return agendamentos.find((booking) => booking.time === time);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Carregando agenda...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.calendarContainer, { backgroundColor: colors.background }]}>
      {/* Header do Mês */}
      <View
        style={[
          styles.monthHeader,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
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
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
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
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
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
      <View style={styles.timelineContainer}>
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
                        { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                      ]}
                      onPress={() => handleEditBooking(booking)}
                    >
                      <Text
                        style={[styles.eventTitle, { color: colors.primary }]}
                        numberOfLines={1}
                      >
                        {booking.client_name}
                      </Text>
                      <Text
                        style={[styles.eventSubtitle, { color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {booking.service_name}
                      </Text>
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
    return (
      <Modal
        visible={showBookingModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowBookingModal(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingBooking ? 'Editar Agendamento' : 'Novo Agendamento'}
            </Text>
            <TouchableOpacity onPress={handleSaveBooking} disabled={modalLoading}>
              <Text style={[styles.saveButton, { color: colors.primary }]}>
                {modalLoading ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Seleção de Cliente */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Cliente</Text>

              <View style={styles.clientToggle}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    {
                      backgroundColor: !isNewClient ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setIsNewClient(false)}
                >
                  <Text
                    style={[styles.toggleText, { color: !isNewClient ? colors.card : colors.text }]}
                  >
                    Cliente Cadastrado
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    {
                      backgroundColor: isNewClient ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setIsNewClient(true)}
                >
                  <Text
                    style={[styles.toggleText, { color: isNewClient ? colors.card : colors.text }]}
                  >
                    Novo Cliente
                  </Text>
                </TouchableOpacity>
              </View>

              {isNewClient ? (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Nome do cliente"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.clientName}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, clientName: text }))}
                />
              ) : (
                <View
                  style={[
                    styles.picker,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {allClients.map((client) => (
                      <TouchableOpacity
                        key={client.id}
                        style={[
                          styles.clientChip,
                          {
                            backgroundColor:
                              formData.clientId === client.id ? colors.primary : 'transparent',
                            borderColor: colors.border,
                          },
                        ]}
                        onPress={() =>
                          setFormData((prev) => ({
                            ...prev,
                            clientId: client.id,
                            clientName: client.name,
                          }))
                        }
                      >
                        <Text
                          style={[
                            styles.clientChipText,
                            { color: formData.clientId === client.id ? colors.card : colors.text },
                          ]}
                        >
                          {client.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Seleção de Profissional */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Profissional</Text>
              <View
                style={[
                  styles.picker,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {barbeiros.map((barber) => (
                    <TouchableOpacity
                      key={barber.id}
                      style={[
                        styles.professionalChip,
                        {
                          backgroundColor:
                            formData.barberId === barber.id ? colors.primary : 'transparent',
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setFormData((prev) => ({ ...prev, barberId: barber.id }))}
                    >
                      <Text
                        style={[
                          styles.clientChipText,
                          { color: formData.barberId === barber.id ? colors.card : colors.text },
                        ]}
                      >
                        {barber.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Seleção de Serviço */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Serviço</Text>
              <View
                style={[
                  styles.picker,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {allServices.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.serviceChip,
                        {
                          backgroundColor:
                            formData.serviceId === service.id ? colors.primary : 'transparent',
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={() => setFormData((prev) => ({ ...prev, serviceId: service.id }))}
                    >
                      <Text
                        style={[
                          styles.serviceChipTitle,
                          { color: formData.serviceId === service.id ? colors.card : colors.text },
                        ]}
                      >
                        {service.name}
                      </Text>
                      <Text
                        style={[
                          styles.serviceChipPrice,
                          {
                            color:
                              formData.serviceId === service.id
                                ? colors.card + '80'
                                : colors.textSecondary,
                          },
                        ]}
                      >
                        R$ {service.price?.toFixed(2)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Data e Horário */}
            <View style={styles.formRow}>
              <View style={[styles.formSection, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Data</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={formData.date}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, date: text }))}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={[styles.formSection, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Horário</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  value={formData.time}
                  onChangeText={(text) => setFormData((prev) => ({ ...prev, time: text }))}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {/* Observações */}
            <View style={styles.formSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Observações</Text>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: colors.card, color: colors.text, borderColor: colors.border },
                ]}
                placeholder="Observações especiais..."
                placeholderTextColor={colors.textSecondary}
                value={formData.notes}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, notes: text }))}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Botão de Deletar */}
            {editingBooking && (
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: '#FF3B30' }]}
                onPress={handleDeleteBooking}
              >
                <Text style={styles.deleteButtonText}>Cancelar Agendamento</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  }

  // Funções CRUD
  const openCreateModal = () => {
    setEditingBooking(null);
    setFormData({
      clientId: '',
      clientName: '',
      barberId: selectedBarberId,
      serviceId: '',
      date: currentDate.toISOString().split('T')[0],
      time: '09:00',
      notes: '',
    });
    setIsNewClient(false);
    setShowBookingModal(true);
  };

  const handleEditBooking = (booking: any) => {
    setEditingBooking(booking);
    setFormData({
      clientId: booking.user_id || '',
      clientName: booking.client_name || '',
      barberId: booking.barber_id,
      serviceId: booking.service_id,
      date: booking.date,
      time: booking.time,
      notes: booking.notes || '',
    });
    setIsNewClient(!booking.user_id);
    setShowBookingModal(true);
  };

  const handleSaveBooking = async () => {
    // Validar campos obrigatórios
    if (!formData.barberId || !formData.serviceId || !formData.date || !formData.time) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (isNewClient && !formData.clientName.trim()) {
      Alert.alert('Erro', 'Informe o nome do cliente');
      return;
    }

    if (!isNewClient && !formData.clientId) {
      Alert.alert('Erro', 'Selecione um cliente cadastrado');
      return;
    }

    setModalLoading(true);
    try {
      console.log('🔧 Form data:', formData);
      console.log('🔧 Is new client:', isNewClient);

      const selectedService = allServices.find((s) => s.id === formData.serviceId);
      console.log('🔧 Selected service:', selectedService);
      const servicePrice = selectedService?.price || 0;

      const bookingData = {
        userId: isNewClient ? null : formData.clientId,
        barberId: formData.barberId,
        serviceId: formData.serviceId,
        date: formData.date,
        time: formData.time,
        status: 'scheduled' as const,
        notes: formData.notes || '',
        totalPrice: servicePrice,
        paymentMethod: 'pending' as const,
        paymentStatus: 'pending' as const,
        updatedAt: new Date().toISOString(),
        clientName: isNewClient ? formData.clientName : undefined,
      };

      console.log('🔧 Booking data to save:', bookingData);

      let result;
      if (editingBooking) {
        console.log('🔧 Updating booking:', editingBooking.id);
        // Editar agendamento existente
        result = await databaseService.bookings.update(editingBooking.id, bookingData);
        console.log('🔧 Update result:', result);
        if (result) {
          Alert.alert('Sucesso', 'Agendamento atualizado com sucesso!');
        } else {
          throw new Error('Falha ao atualizar agendamento');
        }
      } else {
        console.log('🔧 Creating new booking');
        // Criar novo agendamento
        result = await databaseService.bookings.create(bookingData);
        console.log('🔧 Create result:', result);
        if (result) {
          Alert.alert('Sucesso', 'Agendamento criado com sucesso!');
        } else {
          throw new Error('Falha ao criar agendamento');
        }
      }

      setShowBookingModal(false);
      await loadBookingsForDate(); // Recarregar agendamentos
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar o agendamento');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!editingBooking) return;

    Alert.alert('Confirmar Exclusão', 'Tem certeza que deseja cancelar este agendamento?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          try {
            await databaseService.bookings.delete(editingBooking.id);
            Alert.alert('Sucesso', 'Agendamento cancelado!');
            setShowBookingModal(false);
            loadBookingsForDate();
          } catch (error) {
            console.error('Erro ao deletar agendamento:', error);
            Alert.alert('Erro', 'Não foi possível cancelar o agendamento');
          }
        },
      },
    ]);
  };
}

export default function BookingScreen() {
  const { colors } = useTheme();
  const { isAdminMode } = useAdminMode();

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
  professionalName: {
    fontSize: 12,
    fontWeight: '500',
  },
  timelineContainer: {
    flex: 1,
    position: 'relative',
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
  timeColumn: {
    width: 70,
    alignItems: 'flex-end',
    paddingRight: 12,
    paddingTop: 8,
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
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 4,
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formSection: {
    marginVertical: 12,
  },
  formRow: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
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
  // Estilo para horários centralizados
  timeGridCentered: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
});
