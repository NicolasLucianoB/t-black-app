import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
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

// Local imports
import AppHeader from 'src/components/AppHeader';
import { AgendarTab, ProfessionalsTab } from 'src/components/booking';
import { useAdminMode } from 'src/contexts/AdminModeContext';
import { useTheme } from 'src/contexts/ThemeContext';
import { databaseService } from 'src/services';
import { Barber } from 'src/types';

/**
 * BookingScreen - Interface híbrida de agendamentos
 *
 * REFATORADO: AgendarTab e ProfessionalsTab extraídos para componentes separados
 * TODO: AgendaAdminTab ainda precisa ser componentizado (muito complexo)
 *
 * Funcionalidades:
 * - Modo cliente: interface de agendamento tradicional
 * - Modo admin: agenda estilo Apple Calendar com CRUD completo
 */

const Tab = createMaterialTopTabNavigator();

const TIME_FORMAT_OPTIONS = {
  hour: '2-digit' as const,
  minute: '2-digit' as const,
};

// AgendaAdminTab - Mantido inline por complexidade (será refatorado em iteração futura)
function AgendaAdminTab() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
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

  // Estados para date/time pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date>(new Date());

  // Refs temporários para pickers (NÃO causam re-render durante rolagem)
  const tempDateRef = useRef<Date>(new Date());
  const tempTimeRef = useRef<Date>(new Date());

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

  // Função para converter Date para string YYYY-MM-DD no timezone local
  const formatDateToLocalString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();

    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Loading timeout - forçando setLoading(false)');
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const now = new Date();
    setSelectedDate(now);
    setSelectedTime(now);
  }, []);

  useEffect(() => {
    if (selectedBarberId) {
      loadBookingsForDate();
    }
  }, [currentDate, selectedBarberId]);

  useEffect(() => {
    if (showBookingModal) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

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
      const filteredClients = clientsData.filter(
        (user: any) =>
          user.user_role === 'client' ||
          user.user_role === 'cliente' ||
          (!user.user_role && user.email),
      );
      setAllClients(filteredClients);

      if (barbersData.length > 0) {
        setSelectedBarberId(barbersData[0].id);
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
      const dateStr = formatDateToLocalString(currentDate);
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
      const dateStr = formatDateToLocalString(currentDate);
      const allBookings = await databaseService.bookings.getByDate(dateStr);
      const barberBookings = allBookings.filter(
        (booking) => booking.barber_id === selectedBarberId,
      );
      setAgendamentos(barberBookings);
    } catch (error) {
      console.error('❌ Erro ao carregar agendamentos:', error);
    }
  };

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

  const getCurrentTimePosition = () => {
    const now = currentTime;
    const today = now.toDateString();
    const selectedDay = currentDate.toDateString();

    if (today !== selectedDay) return null;

    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (hours < 8 || hours > 20) return null;

    const totalMinutes = (hours - 8) * 60 + minutes;
    const slotHeight = 60;
    const position = (totalMinutes / 30) * slotHeight;
    return position;
  };

  const weekDays = getWeekDays();
  const timeSlots = generateTimeSlots();
  const currentTimePosition = getCurrentTimePosition();

  const openCreateModal = () => {
    setEditingBooking(null);
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
      date: formatDateToLocalString(today),
      time: currentTime.toLocaleTimeString('pt-BR', TIME_FORMAT_OPTIONS),
      notes: '',
    });
    setShowBookingModal(true);
  };

  const handleEditBooking = (booking: any) => {
    setEditingBooking(booking);
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

  const handleSaveBooking = async (overrides?: Partial<typeof formData>) => {
    try {
      // Usar overrides se fornecidos, senão usar formData
      const dataToSave = { ...formData, ...overrides };

      console.log('🔍 DEBUG - formData ao salvar:', dataToSave);
      console.log('🔍 DEBUG - barberId:', dataToSave.barberId);
      console.log('🔍 DEBUG - serviceId:', dataToSave.serviceId);
      console.log('🔍 DEBUG - clientId:', dataToSave.clientId);
      console.log('🔍 DEBUG - clientName:', dataToSave.clientName);
      console.log('🔍 DEBUG - notes:', dataToSave.notes);

      if (!dataToSave.barberId || !dataToSave.serviceId) {
        Alert.alert('Erro', 'Selecione o profissional e o serviço');
        return;
      }

      const clientId = dataToSave.clientId || null;
      const clientName = dataToSave.clientName || '';

      if (!clientId && !clientName) {
        Alert.alert('Erro', 'Selecione um cliente ou digite o nome');
        return;
      }

      if (editingBooking) {
        const updates = {
          user_id: clientId,
          barber_id: dataToSave.barberId,
          service_id: dataToSave.serviceId,
          date: dataToSave.date,
          time: dataToSave.time,
          notes: dataToSave.notes || '',
          client_name: clientName,
        };

        console.log('📝 DEBUG - Atualizando agendamento:', updates);

        const updated = await databaseService.bookings.update(editingBooking.id, updates);

        if (updated) {
          Alert.alert('Sucesso', 'Agendamento atualizado com sucesso!');
          await loadBookingsForDate();
        } else {
          Alert.alert('Erro', 'Não foi possível atualizar o agendamento');
        }
      } else {
        const bookingData: any = {
          barberId: dataToSave.barberId,
          serviceId: dataToSave.serviceId,
          date: dataToSave.date,
          time: dataToSave.time,
          notes: dataToSave.notes || '',
          clientName: clientName,
        };

        console.log('📝 DEBUG - Criando agendamento:', bookingData);

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

  const getBookingForTime = (time: string) => {
    return agendamentos.find((booking) => {
      const bookingTime = booking.time.substring(0, 5);
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
      style={[styles.calendarContainer, { backgroundColor: colors.background, minHeight: 500 }]}
    >
      {/* Header do Mês */}
      <View
        style={[
          styles.monthHeader,
          { backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1 },
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
          { backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1 },
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
          { backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1 },
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
          { flex: 1, backgroundColor: colors.background, minHeight: 300 },
        ]}
      >
        <ScrollView style={styles.timelineScroll} showsVerticalScrollIndicator={false}>
          {currentTimePosition !== null && (
            <View
              style={[
                styles.currentTimeIndicator,
                { top: currentTimePosition + 8, backgroundColor: '#FF3B30' },
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

            return (
              <View key={time} style={[styles.timeSlot, { borderBottomColor: colors.border }]}>
                <View style={styles.timeColumn}>
                  <Text style={[styles.timeText, { color: colors.textSecondary }]}>{time}</Text>
                </View>

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
                      <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
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

      {/* Modal CRUD - Implementação simplificada inline */}
      <BookingCRUDModal />
    </View>
  );

  // Componente do Modal CRUD - inline para manter o estado
  function BookingCRUDModal() {
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<any>(null);
    const [showClientPicker, setShowClientPicker] = useState(false);
    const [showServicePicker, setShowServicePicker] = useState(false);
    const [customClientName, setCustomClientName] = useState('');
    const [observations, setObservations] = useState('');

    useEffect(() => {
      if (editingBooking && showBookingModal) {
        const client = allClients.find((c) => c.id === editingBooking.user_id);
        setSelectedClient(client || null);

        const service = allServices.find((s) => s.id === editingBooking.service_id);
        setSelectedService(service || null);

        setObservations(editingBooking.notes || '');

        if (!client && editingBooking.client_name) {
          setCustomClientName(editingBooking.client_name);
        }
      } else if (showBookingModal && !editingBooking) {
        // Resetar ao abrir para novo
        setSelectedClient(null);
        setSelectedService(null);
        setCustomClientName('');
        setObservations('');
      }
    }, [editingBooking, showBookingModal]);

    const closeModal = () => {
      setShowBookingModal(false);
      setEditingBooking(null);
      setSelectedClient(null);
      setSelectedService(null);
      setShowClientPicker(false);
      setShowServicePicker(false);
      setCustomClientName('');
      setObservations('');
    };

    const handleSave = () => {
      try {
        // Coletar valores dos estados locais
        const barberId = selectedBarbierModal?.id || formData.barberId || '';
        const serviceId = selectedService?.id || formData.serviceId || '';
        const clientId = selectedClient?.id || formData.clientId || '';
        const clientName = customClientName || selectedClient?.name || formData.clientName || '';
        const notes = observations || '';

        console.log('📝 DEBUG handleSave:', {
          barberId,
          serviceId,
          clientId,
          clientName,
          notes,
        });

        // Passar os valores diretamente para handleSaveBooking
        handleSaveBooking({
          barberId,
          serviceId,
          clientId,
          clientName,
          notes,
        });
      } catch (error) {
        console.error('❌ Erro em handleSave:', error);
        Alert.alert('Erro', 'Erro ao preparar dados para salvar');
      }
    };

    if (!showBookingModal) {
      return null;
    }

    // Modal CRUD UI - versão simplificada
    return (
      <Modal visible={showBookingModal} animationType="slide" onRequestClose={closeModal}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingBooking ? 'Editar Agendamento' : 'Novo Agendamento'}
            </Text>
            <View style={styles.headerSpacer} />
          </View>

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 200 }}
              keyboardShouldPersistTaps="handled"
            >
              {/* Data e Horário */}
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
                      onPress={() => {
                        tempDateRef.current = selectedDate;
                        setShowDatePicker(true);
                      }}
                    >
                      <Text style={[styles.inputText, { color: colors.text }]}>
                        {getSafeDate(selectedDate).toLocaleDateString('pt-BR')}
                      </Text>
                      <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeField}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                      Horário
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.inputField,
                        { backgroundColor: colors.card, borderColor: colors.border },
                      ]}
                      onPress={() => {
                        tempTimeRef.current = selectedTime;
                        setShowTimePicker(true);
                      }}
                    >
                      <Text style={[styles.inputText, { color: colors.text }]}>
                        {getSafeDate(selectedTime).toLocaleTimeString('pt-BR', TIME_FORMAT_OPTIONS)}
                      </Text>
                      <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Profissional */}
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
                          selectedBarbierModal?.id === barber.id ? colors.primary : colors.border,
                        borderWidth: selectedBarbierModal?.id === barber.id ? 2 : 1,
                        marginBottom: 12,
                      },
                    ]}
                    onPress={() => {
                      setSelectedBarbierModal(barber);
                    }}
                  >
                    <View style={styles.professionalOption}>
                      <View
                        style={[styles.professionalAvatar, { backgroundColor: colors.primary }]}
                      >
                        <Text style={[styles.professionalInitial, { color: colors.card }]}>
                          {barber.name?.charAt(0) || 'P'}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.inputText, { color: colors.text }]}>
                          {barber.name}
                        </Text>
                        {barber.description && (
                          <Text
                            style={[{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }]}
                          >
                            {barber.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Cliente */}
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
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Digite o nome do novo cliente"
                  placeholderTextColor={colors.textSecondary}
                  value={customClientName}
                  onChangeText={(text) => {
                    setCustomClientName(text);
                    if (text) {
                      setSelectedClient(null);
                    }
                  }}
                />
              </View>

              {/* Serviço */}
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

              {/* Observações */}
              <View style={styles.formSection}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Observações</Text>
                </View>

                <TextInput
                  style={[
                    styles.inputField,
                    styles.textArea,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  placeholder="Adicione observações sobre o agendamento..."
                  placeholderTextColor={colors.textSecondary}
                  value={observations}
                  onChangeText={setObservations}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>

              {/* Botões */}
              <View style={styles.agendarButtonContainer}>
                <TouchableOpacity
                  style={[styles.agendarButton, { backgroundColor: colors.primary }]}
                  onPress={handleSave}
                  disabled={modalLoading}
                >
                  <Text style={[styles.agendarButtonText, { color: colors.card }]}>
                    {modalLoading ? 'Agendando...' : editingBooking ? 'Atualizar' : 'Agendar'}
                  </Text>
                </TouchableOpacity>

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
          </KeyboardAvoidingView>

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

          {/* Date Picker */}
          <Modal
            visible={showDatePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <TouchableOpacity
              style={styles.pickerOverlay}
              activeOpacity={1}
              onPress={() => setShowDatePicker(false)}
            >
              <TouchableOpacity
                style={[styles.pickerContainer, { backgroundColor: colors.background }]}
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
              >
                <Text style={[styles.pickerTitle, { color: colors.text }]}>Selecionar Data</Text>
                <DateTimePicker
                  value={getSafeDate(tempDateRef.current)}
                  mode="date"
                  display="spinner"
                  themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
                  textColor={colors.text}
                  accentColor={colors.primary}
                  onChange={(event, date) => {
                    if (date) {
                      tempDateRef.current = date;
                    }
                  }}
                />
                <View style={styles.pickerButtons}>
                  <TouchableOpacity
                    style={[
                      styles.pickerButton,
                      styles.cancelButton,
                      { borderColor: colors.border },
                    ]}
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
                      setSelectedDate(tempDateRef.current);
                      setFormData((prev) => ({
                        ...prev,
                        date: formatDateToLocalString(tempDateRef.current),
                      }));
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={[styles.confirmButtonText, { color: colors.card }]}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>

          {/* Time Picker */}
          <Modal
            visible={showTimePicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowTimePicker(false)}
          >
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
                <Text style={[styles.pickerTitle, { color: colors.text, marginBottom: 12 }]}>
                  Selecionar Horário
                </Text>
                <DateTimePicker
                  value={getSafeDate(tempTimeRef.current)}
                  mode="time"
                  display="spinner"
                  themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
                  textColor={colors.text}
                  accentColor={colors.primary}
                  onChange={(event, time) => {
                    if (time) {
                      tempTimeRef.current = time;
                    }
                  }}
                />
                <View style={styles.pickerButtons}>
                  <TouchableOpacity
                    style={[
                      styles.pickerButton,
                      styles.cancelButton,
                      { borderColor: colors.border },
                    ]}
                    onPress={() => setShowTimePicker(false)}
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
                      setSelectedTime(tempTimeRef.current);
                      const timeString = tempTimeRef.current.toLocaleTimeString(
                        'pt-BR',
                        TIME_FORMAT_OPTIONS,
                      );
                      setFormData((prev) => ({
                        ...prev,
                        time: timeString,
                      }));
                      setShowTimePicker(false);
                    }}
                  >
                    <Text style={[styles.confirmButtonText, { color: colors.card }]}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        </SafeAreaView>
      </Modal>
    );
  }
}

export default function BookingScreen() {
  const { colors } = useTheme();
  const { isAdminMode } = useAdminMode();

  if (isAdminMode) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <AppHeader />
        <AgendaAdminTab />
      </SafeAreaView>
    );
  }

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
        <Tab.Screen name="Profissionais" component={ProfessionalsTab} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

// Styles mantidos do arquivo original
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  tabBarIndicator: {
    height: 3,
    borderRadius: 3,
  },
  tabBarStyle: {
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
  },
  tabBarLabelStyle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'none',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  calendarContainer: {
    flex: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  navButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  dayName: {
    fontSize: 12,
    marginBottom: 4,
  },
  dayNumberContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  professionalsCarousel: {
    padding: 12,
  },
  carouselContent: {
    paddingHorizontal: 4,
    gap: 12,
  },
  professionalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  professionalAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  professionalInitial: {
    fontSize: 14,
    fontWeight: '600',
  },
  professionalName: {
    fontSize: 14,
    fontWeight: '500',
  },
  timelineContainer: {
    position: 'relative',
  },
  timelineScroll: {
    flex: 1,
  },
  timeSlot: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
  },
  timeColumn: {
    width: 60,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
  },
  timeText: {
    fontSize: 12,
  },
  eventColumn: {
    flex: 1,
    padding: 4,
  },
  eventBlock: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    borderLeftWidth: 3,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventSubtitle: {
    fontSize: 12,
  },
  emptyEventSlot: {
    flex: 1,
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
    position: 'absolute',
    left: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentTimeLabelText: {
    fontSize: 10,
    fontWeight: '600',
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    marginLeft: 60,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  formSection: {
    padding: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  timeField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  inputText: {
    fontSize: 15,
  },
  professionalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orText: {
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 14,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  agendarButtonContainer: {
    padding: 20,
  },
  agendarButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  agendarButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
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
    padding: 16,
    borderBottomWidth: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  clientEmail: {
    fontSize: 14,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
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
    shadowOffset: { width: 0, height: 2 },
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
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
