import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useCreateBooking } from 'src/hooks/useBookings';
import { useBookingNotifications } from 'src/hooks/useNotifications';
import { databaseService } from 'src/services';
import { Barber } from 'src/types';

export type BookingStep = 'professional' | 'datetime' | 'summary';

/**
 * Hook para gerenciar lógica de agendamento de serviços
 */
export function useBookingFlow(userId: string) {
  const [allServices, setAllServices] = useState<any[]>([]);
  const [step, setStep] = useState<BookingStep>('professional');
  const [servicoSelecionado, setServicoSelecionado] = useState<any>(null);
  const [barbeiros, setBarbeiros] = useState<Barber[]>([]);
  const [barbeiro, setBarbeiro] = useState<string>('');
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const [horariosDisponiveis, setHorariosDisponiveis] = useState<string[]>([]);
  const [noConversation, setNoConversation] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  const { createBooking, loading: bookingLoading, error: bookingError } = useCreateBooking(userId);
  const { scheduleBookingNotifications } = useBookingNotifications();

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

  const resetFlow = () => {
    setStep('professional');
    setServicoSelecionado(null);
    setBarbeiro('');
    setData('');
    setHorario('');
    setHorariosDisponiveis([]);
    setNoConversation(false);
    setObservacoes('');
  };

  const handleServiceSelect = async (servico: any) => {
    setServicoSelecionado(servico);

    try {
      const allBarbers = await databaseService.barbers.getAll();

      // Filtrar barbeiros visíveis e que oferecem o serviço selecionado
      const availableBarbers = allBarbers.filter((barber) => {
        // Filtrar apenas profissionais visíveis no booking
        if (barber.showInBooking === false) return false;

        // Filtrar apenas profissionais que oferecem este serviço
        if (barber.services && Array.isArray(barber.services)) {
          return barber.services.includes(servico.id);
        }

        // Se não tem lista de serviços definida, não mostrar
        return false;
      });

      console.log('🔍 Filtro de barbeiros:', {
        servicoId: servico.id,
        servicoNome: servico.name,
        totalBarbers: allBarbers.length,
        barbeirosVisiveis: availableBarbers.length,
        barbeiros: availableBarbers.map((b) => ({ nome: b.name, services: b.services })),
      });

      setBarbeiros(availableBarbers);
      setStep('professional');
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      Alert.alert('Erro', 'Não foi possível carregar os profissionais');
    }
  };

  const handleProfessionalSelect = (barbeiroId: string) => {
    setBarbeiro(barbeiroId);
    setStep('datetime');
  };

  const handleTimeSelect = (time: string) => {
    setHorario(time);
    setStep('summary');
  };

  const handleDataChange = (novaData: string) => {
    setData(novaData);
    setHorario('');
  };

  const handleBack = () => {
    if (step === 'datetime') {
      setStep('professional');
      setBarbeiro('');
      setData('');
      setHorario('');
    } else if (step === 'summary') {
      setStep('datetime');
      setHorario('');
    }
  };

  const handleConfirmar = async (onSuccess: () => void) => {
    if (!userId || !barbeiro || !servicoSelecionado || !data || !horario) {
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
        await scheduleBookingNotifications(
          result.data.id,
          data,
          horario,
          barbeiroSelecionado?.name || 'Barbeiro',
        );

        Alert.alert(
          'Sucesso!',
          `Agendamento realizado com ${barbeiroSelecionado?.name} em ${data} às ${horario}\n\n🔔 Você receberá lembretes antes do horário!`,
          [{ text: 'OK', onPress: onSuccess }],
        );
      } else {
        Alert.alert('Erro', bookingError || 'Não foi possível criar o agendamento');
      }
    } catch (error) {
      console.error('Erro ao confirmar agendamento:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao confirmar o agendamento');
    }
  };

  return {
    // Estados
    allServices,
    step,
    servicoSelecionado,
    barbeiros,
    barbeiro,
    data,
    horario,
    horariosDisponiveis,
    noConversation,
    observacoes,
    loading,
    bookingLoading,

    // Setters
    setNoConversation,
    setObservacoes,
    setStep,

    // Handlers
    handleServiceSelect,
    handleProfessionalSelect,
    handleTimeSelect,
    handleDataChange,
    handleBack,
    handleConfirmar,
    resetFlow,
  };
}
