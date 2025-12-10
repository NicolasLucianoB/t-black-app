// Booking related types
export interface Barber {
  id: string;
  name: string;
  avatar?: string | null;
  specialties: string[];
  workingHours: string[] | any;
  active: boolean;
  description?: string | null;
  rating?: number;
  position?: string;
  showInBooking?: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  active: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  barberId: string;
  serviceId: string;
  date: string; // ISO date string
  time: string; // HH:MM format
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  totalPrice: number;
  paymentMethod?: 'card' | 'pix' | 'cash' | 'pending';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt?: string;

  // Relations (populated when needed)
  barber?: Barber;
  service?: Service;
}

export interface BookingSlot {
  time: string;
  available: boolean;
  barberId: string;
}

export interface AvailableSlots {
  date: string;
  slots: BookingSlot[];
}

// For creating new bookings (form data)
export interface CreateBookingData {
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  notes?: string;
  paymentMethod?: 'card' | 'pix' | 'cash';
}

// Complete booking data for database insertion
export type CreateBookingRequest = Omit<
  Booking,
  'id' | 'createdAt' | 'barber' | 'service' | 'userId'
> & {
  userId?: string; // Opcional para permitir agendamentos sem usuário cadastrado
  clientName?: string; // Para agendamentos sem usuário cadastrado
};
