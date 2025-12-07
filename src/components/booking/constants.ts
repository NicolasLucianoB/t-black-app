// Constantes compartilhadas do sistema de agendamento

export const WORKING_HOURS = {
  START: 7,
  END: 19,
  SLOT_DURATION: 30, // minutes
};

export const TIME_FORMAT_OPTIONS = {
  hour: '2-digit' as const,
  minute: '2-digit' as const,
};

export const UNAVAILABLE_DATES = ['2024-06-28', '2024-06-29', '2024-07-01'];
