// Database service using Supabase
import { Barber, Booking, Course, CreateBookingRequest, Product, User } from '../types';
import { supabase } from './supabase';

export const databaseService = {
  // User operations
  users: {
    async getById(id: string): Promise<User | null> {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

        if (error) {
          console.error('Error fetching user:', error);
          return null;
        }

        return data;
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },
  },

  // Booking operations
  bookings: {
    async create(booking: CreateBookingRequest): Promise<Booking | null> {
      try {
        // Convert camelCase to snake_case for database
        const dbBooking = {
          user_id: booking.userId,
          barber_id: booking.barberId,
          service_id: booking.serviceId,
          date: booking.date,
          time: booking.time,
          status: booking.status,
          notes: booking.notes,
          total_price: booking.totalPrice,
          payment_method: booking.paymentMethod,
          payment_status: booking.paymentStatus,
          updated_at: booking.updatedAt,
        };

        const { data, error } = await supabase.from('bookings').insert(dbBooking).select().single();

        if (error) {
          console.error('Error creating booking:', error);
          return null;
        }

        // Convert back to camelCase
        return {
          id: data.id,
          userId: data.user_id,
          barberId: data.barber_id,
          serviceId: data.service_id,
          date: data.date,
          time: data.time,
          status: data.status,
          notes: data.notes,
          totalPrice: data.total_price,
          paymentMethod: data.payment_method,
          paymentStatus: data.payment_status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },

    async getByUserId(userId: string): Promise<Booking[]> {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) {
          console.error('Error fetching bookings:', error);
          return [];
        }

        // Convert snake_case to camelCase
        return (data || []).map((booking) => ({
          id: booking.id,
          userId: booking.user_id,
          barberId: booking.barber_id,
          serviceId: booking.service_id,
          date: booking.date,
          time: booking.time,
          status: booking.status,
          notes: booking.notes,
          totalPrice: booking.total_price,
          paymentMethod: booking.payment_method,
          paymentStatus: booking.payment_status,
          createdAt: booking.created_at,
          updatedAt: booking.updated_at,
        }));
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },

    async getAvailableSlots(barberId: string, date: string): Promise<string[]> {
      try {
        // Get existing bookings for the barber on the specified date
        const { data: existingBookings, error } = await supabase
          .from('bookings')
          .select('time')
          .eq('barber_id', barberId)
          .eq('date', date)
          .eq('status', 'confirmed');

        if (error) {
          console.error('Error fetching bookings:', error);
          return [];
        }

        // Define available time slots (9am to 6pm, 1-hour slots)
        const allSlots = [
          '09:00',
          '10:00',
          '11:00',
          '12:00',
          '13:00',
          '14:00',
          '15:00',
          '16:00',
          '17:00',
          '18:00',
        ];

        const bookedSlots = existingBookings?.map((booking) => booking.time) || [];
        const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

        return availableSlots;
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },

    async cancel(id: string): Promise<boolean> {
      try {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', id);

        if (error) {
          console.error('Error cancelling booking:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error:', error);
        return false;
      }
    },
  },

  // Product operations
  products: {
    async getAll(): Promise<Product[]> {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('active', true);

        if (error) {
          console.error('Error fetching products:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },

    async getById(id: string): Promise<Product | null> {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

        if (error) {
          console.error('Error fetching product:', error);
          return null;
        }

        return data;
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },
  },

  // Course operations
  courses: {
    async getAll(): Promise<Course[]> {
      try {
        const { data, error } = await supabase.from('courses').select('*').eq('active', true);

        if (error) {
          console.error('Error fetching courses:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },

    async getById(id: string): Promise<Course | null> {
      try {
        const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();

        if (error) {
          console.error('Error fetching course:', error);
          return null;
        }

        return data;
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },

    async getPurchasedByUser(userId: string): Promise<Course[]> {
      try {
        const { data, error } = await supabase
          .from('course_purchases')
          .select(
            `
            *,
            course:courses(*)
          `,
          )
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching purchased courses:', error);
          return [];
        }

        return data?.map((p) => p.course).filter(Boolean) || [];
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },
  },

  // Barber operations
  barbers: {
    async getAll(): Promise<Barber[]> {
      try {
        const { data, error } = await supabase.from('barbers').select('*').eq('active', true);

        if (error) {
          console.error('Error fetching barbers:', error);
          return [];
        }

        // Convert snake_case to camelCase and ensure arrays are properly handled
        return (data || []).map((barber) => ({
          id: barber.id,
          name: barber.name,
          avatar: barber.avatar,
          specialties: Array.isArray(barber.specialties) ? barber.specialties : [],
          workingHours: Array.isArray(barber.working_hours) ? barber.working_hours : [],
          active: barber.active,
          description: barber.description,
          rating: barber.rating,
        }));
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },

    async getById(id: string): Promise<Barber | null> {
      try {
        const { data, error } = await supabase.from('barbers').select('*').eq('id', id).single();

        if (error) {
          console.error('Error fetching barber:', error);
          return null;
        }

        if (!data) return null;

        // Convert snake_case to camelCase
        return {
          id: data.id,
          name: data.name,
          avatar: data.avatar,
          specialties: Array.isArray(data.specialties) ? data.specialties : [],
          workingHours: Array.isArray(data.working_hours) ? data.working_hours : [],
          active: data.active,
          description: data.description,
          rating: data.rating,
        };
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },
  },
};
