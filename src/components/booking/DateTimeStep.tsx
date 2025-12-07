import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getMarkedDates } from './utils';

interface DateTimeStepProps {
  data: string;
  horario: string;
  horariosDisponiveis: string[];
  onDateChange: (date: string) => void;
  onTimeSelect: (time: string) => void;
  colors: any;
}

export function DateTimeStep({
  data,
  horario,
  horariosDisponiveis,
  onDateChange,
  onTimeSelect,
  colors,
}: DateTimeStepProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Quando?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Escolha o melhor dia e horário
        </Text>
      </View>

      <View style={styles.calendarSection}>
        <Calendar
          onDayPress={(day) => onDateChange(day.dateString)}
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Horários disponíveis</Text>
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
                  onPress={() => onTimeSelect(h)}
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
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
  },
  calendarSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  timeSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  timeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  noHorariosText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 20,
  },
});
