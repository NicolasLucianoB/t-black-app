import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Calendar } from 'react-native-calendars';

import AppHeader from '../components/AppHeader';
import { useTheme } from '../contexts/ThemeContext';

const barbeiros = [
  {
    id: 1,
    nome: 'Tiago',
    horarios: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
  },
  {
    id: 2,
    nome: 'Lucas',
    horarios: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
  },
  {
    id: 3,
    nome: 'Rafael',
    horarios: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'],
  },
  {
    id: 4,
    nome: 'Bruno',
    horarios: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
  },
  {
    id: 5,
    nome: 'Carlos',
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
  diasIndisponiveis.forEach((date) => {
    marked[date] = {
      disabled: true,
      disableTouchEvent: true,
      marked: false,
      dotColor: 'transparent',
      opacity: 0.4,
    };
  });
  if (selectedDate) {
    marked[selectedDate] = {
      selected: true,
      selectedColor: colors.primary,
      selectedTextColor: colors.card,
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

export default function BookingScreen({ navigation }: any) {
  const { colors, theme } = useTheme();
  const [barbeiro, setBarbeiro] = useState(barbeiros[0].id);
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');

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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader navigation={navigation} />
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Remover o antigo header */}
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
              <Text style={[styles.quickBookTitle, { color: colors.text }]}>
                Agendamento Rápido
              </Text>
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
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.card,
              disabledArrowColor: colors.textSecondary,
              textDisabledColor: theme === 'dark' ? '#333' : '#ccc',
              textDayStyle: {
                color: theme === 'dark' ? '#fff' : '#111',
              },
              backgroundColor: theme === 'dark' ? colors.surface : colors.card,
              calendarBackground: theme === 'dark' ? colors.surface : colors.card,
              monthTextColor: colors.text,
              textMonthFontWeight: 'bold',
              textMonthFontSize: 18,
              textDayFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
            style={[
              styles.calendar,
              { backgroundColor: theme === 'dark' ? colors.surface : colors.card },
            ]}
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
        </View>
      </ScrollView>
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
});
