// Database service using Supabase
// This will handle all database operations

// import { supabase } from './supabase';
import { Barber, Booking, Course, CreateBookingRequest, Product, User } from '../types';

export const databaseService = {
  // User operations
  users: {
    async getById(id: string): Promise<User | null> {
      // TODO: Replace with Supabase query
      // const { data, error } = await supabase
      //   .from('users')
      //   .select('*')
      //   .eq('id', id)
      //   .single();
      // return data;
      return null;
    },

    async update(id: string, updates: Partial<User>): Promise<User | null> {
      // TODO: Replace with Supabase query
      // const { data, error } = await supabase
      //   .from('users')
      //   .update(updates)
      //   .eq('id', id)
      //   .select()
      //   .single();
      // return data;
      return null;
    },
  },

  // Booking operations
  bookings: {
    async create(booking: CreateBookingRequest): Promise<Booking | null> {
      // TODO: Replace with Supabase query
      // const { data, error } = await supabase
      //   .from('bookings')
      //   .insert(booking)
      //   .select()
      //   .single();
      // return data;
      return null;
    },

    async getByUserId(userId: string): Promise<Booking[]> {
      // TODO: Replace with Supabase query
      // const { data, error } = await supabase
      //   .from('bookings')
      //   .select(`
      //     *,
      //     barber:barbers(*)
      //   `)
      //   .eq('user_id', userId)
      //   .order('date', { ascending: false });
      // return data || [];
      return [];
    },

    async getAvailableSlots(barberId: string, date: string): Promise<string[]> {
      // TODO: Replace with Supabase query
      // Logic to get available time slots for a barber on a specific date
      return [];
    },

    async cancel(id: string): Promise<boolean> {
      // TODO: Replace with Supabase query
      // const { error } = await supabase
      //   .from('bookings')
      //   .update({ status: 'cancelled' })
      //   .eq('id', id);
      // return !error;
      return false;
    },
  },

  // Barber operations
  barbers: {
    async getAll(): Promise<Barber[]> {
      // TODO: Replace with Supabase query
      // const { data, error } = await supabase
      //   .from('barbers')
      //   .select('*')
      //   .eq('active', true);
      // return data || [];

      // Mock data for now
      return [
        {
          id: '1',
          name: 'Tiago',
          avatar: null,
          specialties: ['Corte tradicional', 'Barba'],
          workingHours: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
          active: true,
        },
        {
          id: '2',
          name: 'João',
          avatar: null,
          specialties: ['Corte moderno', 'Design'],
          workingHours: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
          active: true,
        },
      ];
    },

    async getById(id: string): Promise<Barber | null> {
      // TODO: Replace with Supabase query
      // const { data, error } = await supabase
      //   .from('barbers')
      //   .select('*')
      //   .eq('id', id)
      //   .single();
      // return data;
      return null;
    },
  },

  // Course operations
  courses: {
    async getAll(): Promise<Course[]> {
      // TODO: Replace with Supabase query
      // const { data, error } = await supabase
      //   .from('courses')
      //   .select('*')
      //   .eq('active', true);
      // return data || [];
      return [];
    },

    async getPurchasedByUser(userId: string): Promise<Course[]> {
      // TODO: Replace with Supabase query
      // const { data, error } = await supabase
      //   .from('course_purchases')
      //   .select(`
      //     *,
      //     course:courses(*)
      //   `)
      //   .eq('user_id', userId);
      // return data?.map(p => p.course) || [];
      return [];
    },
  },

  // Product operations
  products: {
    async getAll(): Promise<Product[]> {
      // TODO: Replace with Supabase query
      // const { data, error } = await supabase
      //   .from('products')
      //   .select('*')
      //   .eq('active', true);
      // return data || [];
      return [];
    },

    async getById(id: string): Promise<Product | null> {
      // TODO: Replace with Supabase query
      // const { data, error } = await supabase
      //   .from('products')
      //   .select('*')
      //   .eq('id', id)
      //   .single();
      // return data;
      return null;
    },
  },
};
