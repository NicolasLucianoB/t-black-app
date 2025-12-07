// Utilitários compartilhados do sistema de agendamento

import { UNAVAILABLE_DATES } from './constants';

/**
 * Gera marcações do calendário incluindo domingos e datas indisponíveis
 */
export function getMarkedDates(selectedDate: string, colors: any) {
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
  UNAVAILABLE_DATES.forEach((date) => {
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

/**
 * Gera dias da semana a partir de uma data
 */
export function getWeekDays(currentDate: Date) {
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
}

/**
 * Gera slots de horários (8h às 20h)
 */
export function generateTimeSlots() {
  const slots = [];
  for (let hour = 8; hour <= 20; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 20) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
}

/**
 * Garante que uma data seja válida
 */
export function getSafeDate(date: Date | string | undefined): Date {
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date;
  }
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime()) ? parsed : new Date();
  }
  return new Date();
}
