import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

const barbeiros = [
  { id: 1, nome: 'Tiago', horarios: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
  { id: 2, nome: 'Lucas', horarios: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
  { id: 3, nome: 'Rafael', horarios: ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'] },
  { id: 4, nome: 'Bruno', horarios: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'] },
  { id: 5, nome: 'Carlos', horarios: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'] },
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

const diasIndisponiveis = [
  '2024-06-28',
  '2024-06-29',
  '2024-07-01',
];

function getMarkedDates(selectedDate: string) {
  const marked: any = {};
  diasIndisponiveis.forEach(date => {
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
      selectedColor: '#111',
      selectedTextColor: '#fff',
    };
  }
  return marked;
}

function getHorariosDisponiveis(barbeiroId: number, data: string) {
  const barbeiro = barbeiros.find(b => b.id === barbeiroId);
  if (!barbeiro || !data) return [];

  const horariosOcupados = agendamentosExistentes
    .filter(ag => ag.barbeiroId === barbeiroId && ag.data === data)
    .map(ag => ag.horario);

  return barbeiro.horarios.filter(horario => !horariosOcupados.includes(horario));
}

export default function BookingScreen() {
  const [barbeiro, setBarbeiro] = useState(barbeiros[0].id);
  const [data, setData] = useState('');
  const [horario, setHorario] = useState('');

  const horariosDisponiveis = useMemo(() => {
    return getHorariosDisponiveis(barbeiro, data);
  }, [barbeiro, data]);

  const handleConfirmar = () => {
    const barbeiroSelecionado = barbeiros.find(b => b.id === barbeiro);
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
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.title}>Agendar Horário</Text>
        
        {/* Seção de Agendamento Rápido */}
        <View style={styles.quickBookSection}>
          <View style={styles.quickBookHeader}>
            <Ionicons name="flash" size={20} color="#25D366" />
            <Text style={styles.quickBookTitle}>Agendamento Rápido</Text>
          </View>
          <TouchableOpacity style={styles.quickBookCard}>
            <View style={styles.quickBookInfo}>
              <Text style={styles.quickBookService}>Corte Degradê - Tiago</Text>
              <Text style={styles.quickBookDate}>Último: 15/01/2024 às 14:00</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Barbeiro</Text>
        <View style={styles.row}>
          {barbeiros.map(b => (
            <TouchableOpacity
              key={b.id}
              style={[styles.barbeiroButton, barbeiro === b.id && styles.barbeiroButtonSelected]}
              onPress={() => handleBarbeiroChange(b.id)}
            >
              <Text style={barbeiro === b.id ? styles.barbeiroTextSelected : styles.barbeiroText}>{b.nome}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.label}>Data</Text>
        <Calendar
          onDayPress={day => handleDataChange(day.dateString)}
          markedDates={getMarkedDates(data)}
          minDate={new Date().toISOString().split('T')[0]}
          theme={{
            todayTextColor: '#007AFF',
            selectedDayBackgroundColor: '#111',
            selectedDayTextColor: '#fff',
            disabledArrowColor: '#ccc',
            textDisabledColor: '#ccc',
            backgroundColor: '#fff',
            calendarBackground: '#fff',
            monthTextColor: '#111',
            textMonthFontWeight: 'bold',
            textMonthFontSize: 18,
            textDayFontSize: 16,
            textDayHeaderFontSize: 14,
          }}
          style={styles.calendar}
        />
        <Text style={styles.label}>Horário</Text>
        {data && horariosDisponiveis.length > 0 ? (
          <View style={styles.row}>
            {horariosDisponiveis.map(h => (
              <TouchableOpacity
                key={h}
                style={[styles.horarioButton, horario === h && styles.horarioButtonSelected]}
                onPress={() => setHorario(h)}
                disabled={diasIndisponiveis.includes(data)}
              >
                <Text style={horario === h ? styles.horarioTextSelected : styles.horarioText}>{h}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : data ? (
          <Text style={styles.noHorariosText}>Nenhum horário disponível para esta data</Text>
        ) : (
          <Text style={styles.selectDataText}>Selecione uma data para ver os horários</Text>
        )}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, (!data || !horario || diasIndisponiveis.includes(data)) && { opacity: 0.5 }]}
            onPress={handleConfirmar}
            accessibilityRole="button"
            disabled={!data || !horario || diasIndisponiveis.includes(data)}
          >
            <Text style={styles.confirmButtonText}>Confirmar Agendamento</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f7f7f7',
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#111',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#111',
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
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  barbeiroButtonSelected: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  barbeiroText: {
    color: '#111',
    fontWeight: 'bold',
  },
  barbeiroTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  calendar: {
    width: '100%',
    maxWidth: 340,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#fff',
  },
  horarioButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  horarioButtonSelected: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  horarioText: {
    color: '#111',
    fontWeight: 'bold',
  },
  horarioTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noHorariosText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  selectDataText: {
    color: '#666',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  footer: {
    width: '100%',
    marginTop: 32,
    alignItems: 'center',
  },
  confirmButton: {
    width: '100%',
    maxWidth: 320,
    height: 52,
    backgroundColor: '#111',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickBookSection: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  quickBookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickBookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#111',
  },
  quickBookCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  quickBookInfo: {
    flex: 1,
  },
  quickBookService: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  quickBookDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 