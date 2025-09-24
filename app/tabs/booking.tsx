import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import React, { useMemo, useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Calendar } from 'react-native-calendars';

import { useRouter } from 'expo-router';
import AppHeader from 'src/components/AppHeader';
import { useTheme } from 'src/contexts/ThemeContext';

const Tab = createMaterialTopTabNavigator();

const barbeiros = [
  {
    id: 1,
    nome: 'Tiago',
    horarios: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
  },
  {
    id: 2,
    nome: 'João',
    horarios: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
  },
  {
    id: 3,
    nome: 'Vanessa',
    horarios: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
  },
  {
    id: 4,
    nome: 'Wallacy',
    horarios: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
  },
  {
    id: 5,
    nome: 'Wando',
    horarios: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
  },
];

// Mock de agendamentos existentes (barbeiro_id, data, horario)
const agendamentosExistentes = [
  { barbeiroId: 1, data: '2024-06-27', horario: '14:00' },
  { barbeiroId: 1, data: '2024-06-27', horario: '16:00' },
  { barbeiroId: 2, data: '2024-06-27', horario: '11:00' },
  { barbeiroId: 3, data: '2024-06-28', horario: '09:00' },
  { barbeiroId: 4, data: '2024-06-28', horario: '15:00' },
  { barbeiroId: 5, data: '2024-06-29', horario: '10:00' },
];

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

function getHorariosDisponiveis(barbeiroId: number, data: string) {
  const barbeiro = barbeiros.find((b) => b.id === barbeiroId);
  if (!barbeiro || !data) return [];

  const horariosOcupados = agendamentosExistentes
    .filter((ag) => ag.barbeiroId === barbeiroId && ag.data === data)
    .map((ag) => ag.horario);

  return barbeiro.horarios.filter((horario) => !horariosOcupados.includes(horario));
}

function AgendarTab() {
  const { colors, theme } = useTheme();
  const [barbeiro, setBarbeiro] = useState(barbeiros[0].id);
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');
  const router = useRouter();

  const horariosDisponiveis = useMemo(() => {
    return getHorariosDisponiveis(barbeiro, data);
  }, [barbeiro, data]);

  const handleConfirmar = () => {
    const barbeiroSelecionado = barbeiros.find((b) => b.id === barbeiro);
    alert(`Agendamento realizado com ${barbeiroSelecionado?.nome} em ${data} às ${horario}`);
  };

  const handleBarbeiroChange = (novoBarbeiro: number) => {
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
                {b.nome}
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
              (!data || !horario || diasIndisponiveis.includes(data)) && { opacity: 0.5 },
            ]}
            onPress={handleConfirmar}
            accessibilityRole="button"
            disabled={!data || !horario || diasIndisponiveis.includes(data)}
          >
            <Text style={[styles.confirmButtonText, { color: colors.card }]}>
              Confirmar Agendamento
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
  const [expandedBarbeiro, setExpandedBarbeiro] = useState<number | null>(null);

  const barbeirosDetalhes = [
    {
      id: 1,
      nome: 'Tiago',
      descricao:
        'Tiago é um especialista em cachos e um verdadeiro apaixonado por atender as pessoas! Com um olhar atento e uma vasta experiência, ele transforma cada cabelo cacheado em uma obra de arte, ressaltando a beleza única de cada cliente. O que mais encanta no Tiago é seu amor pelo que faz. Ele acredita que cada atendimento é uma oportunidade de fazer alguém se sentir incrível e confiante. Sua dedicação e carinho são refletidos em cada sorriso de satisfação! @tiagoblackoficial',
      avatar: require('assets/logo-t-black.png'),
    },
    {
      id: 2,
      nome: 'João',
      descricao:
        "João é um verdadeiro artista no que faz! Desde que se juntou ao Studio T'black, sua evolução tem sido impressionante. Ele não só domina as técnicas de corte, mas também traz um olhar único para cada atendimento, garantindo que cada cliente saia satisfeito e confiante. A paixão e o empenho do João são inspiradores, e ele continua se aprimorando a cada dia. Venha conhecer o trabalho dele e descubra por todos aqui no Studio! Estamos muito orgulhosos de ter o João em nossa equipe! @joaobarber0Z",
      avatar: require('assets/logo-t-black.png'),
    },
    {
      id: 3,
      nome: 'Vanessa',
      descricao:
        "A Vanessa é uma verdadeira paixão pela beleza e pelo cuidado com os cabelos! Com um talento incrível, ela consegue transformar cada cabelo em uma obra-prima, sempre atenta às necessidades de cada cliente. Desde que chegou ao Studio T'black, a Vanessa tem se destacado pelo seu profissionalismo e dedicação. Ela não só entrega resultados maravilhosos, mas também faz com uma experiência única e acolhedora. Venha conhecer o trabalho da Vanessa e descubra como ela pode realçar ainda mais a sua beleza! Estamos ansiosos para que você se encante com o talento dela! @vanessaboasorte_cachos",
      avatar: require('assets/logo-t-black.png'),
    },
    {
      id: 4,
      nome: 'Wallacy',
      descricao:
        "Com essa cara de novo, o Wallacy já se destaca como um verdadeiro talento no Studio T'black. Ele possui um olhar apurado e uma habilidade incrível para cortes de cabelo, além de um atendimento que faz cada cliente se sentir especial. Wallacy está conosco há um ano e meio e tem mostrado que a paixão pela beleza e o compromisso com a qualidade são muito mais importantes do que a experiência em anos. Não julgue pela aparência; venha conferir o trabalho excepcional dele! Estamos ansiosos para que você conheça o talento do Wallacy. @barber_wallacy",
      avatar: require('assets/logo-t-black.png'),
    },
    {
      id: 5,
      nome: 'Wando',
      descricao:
        'Conheça o Wando! Um profissional talentoso e apaixonado pelo que faz. Com dedicação e foco, ele oferece um atendimento excelente, garantindo a satisfação de todos os clientes. Sempre pronto para realçar a sua beleza!',
      avatar: require('assets/logo-t-black.png'),
    },
  ];

  const toggleExpand = (id: number) => {
    setExpandedBarbeiro((prev) => (prev === id ? null : id));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: 16 }}
    >
      {barbeirosDetalhes.map((barbeiro) => {
        const isExpanded = expandedBarbeiro === barbeiro.id;
        const preview = barbeiro.descricao.split(' ').slice(0, 20).join(' ') + '...';

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
                  <Image source={barbeiro.avatar} style={styles.avatar} />
                </View>
                <View style={styles.professionalDetails}>
                  <Text style={[styles.professionalName, { color: colors.text }]}>
                    {barbeiro.nome}
                  </Text>
                  <Text style={[styles.professionalRole, { color: colors.textSecondary }]}>
                    Profissional Especializado
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

            {isExpanded && (
              <View style={[styles.professionalDescription, { borderTopColor: colors.border }]}>
                <Text style={[styles.descriptionTitle, { color: colors.text }]}>
                  Sobre o profissional
                </Text>
                <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                  {barbeiro.descricao}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

// Adicionando tipos para barbeiroId e corrigindo a função getLastAppointment
function getLastAppointment(barbeiroId: number): string {
  const lastAppointment = agendamentosExistentes
    .filter((ag) => ag.barbeiroId === barbeiroId)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];

  return lastAppointment
    ? `Data: ${lastAppointment.data}, Horário: ${lastAppointment.horario}`
    : 'Nenhum agendamento recente';
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
