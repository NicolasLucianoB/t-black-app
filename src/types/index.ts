// Main types export file
// Import and re-export all types from other files

export * from './api';
export * from './booking';
export * from './chat';
export * from './course';
export * from './notification';
export * from './product';
export * from './user';

// Additional shared types
export type Theme = 'light' | 'dark' | 'system';

export type PaymentMethod = 'card' | 'pix' | 'cash';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type BookingStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type NotificationType = 'booking' | 'course' | 'order' | 'system' | 'promotion';

// Generic types
export interface SelectOption {
  label: string;
  value: string;
}

export interface LoadingState {
  loading: boolean;
  error: string | null;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'phone' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
}
