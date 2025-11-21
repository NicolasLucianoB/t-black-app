// Database service using Supabase
import {
  Barber,
  Booking,
  ChatMessage,
  Course,
  CreateBookingRequest,
  CreateMessageRequest,
  CreatePurchaseRequest,
  Product,
  Purchase,
  PurchaseItem,
  User,
} from '../types';
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
          barber_id: booking.barberId || null, // Ensure valid UUID or null
          service_id: booking.serviceId === 'default' ? null : booking.serviceId, // Replace 'default' with null
          date: booking.date,
          time: booking.time,
          status: booking.status,
          notes: booking.notes,
          total_price: booking.totalPrice,
          payment_method: booking.paymentMethod,
          payment_status: booking.paymentStatus,
          updated_at: booking.updatedAt,
        };

        console.log('Booking data before insert:', dbBooking);

        if (!dbBooking.barber_id || (dbBooking.service_id !== null && !dbBooking.service_id)) {
          console.error('Invalid UUID for barber_id or service_id:', dbBooking);
          throw new Error('Invalid UUID for barber_id or service_id');
        }

        // Check if the time slot is already booked for the barber
        const existingBooking = await supabase
          .from('bookings')
          .select('*')
          .eq('barber_id', dbBooking.barber_id)
          .eq('date', dbBooking.date)
          .eq('time', dbBooking.time)
          .eq('status', 'scheduled')
          .single();

        if (existingBooking.data) {
          console.error('Time slot already booked for this barber:', dbBooking);
          throw new Error('Time slot already booked for this barber.');
        }

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
          .eq('status', 'scheduled'); // Certifique-se de que o status é 'scheduled'

        if (error) {
          console.error('Erro ao buscar horários ocupados:', error);
          return [];
        }

        const bookedSlots =
          existingBookings?.map((booking) => {
            const [hour, minute] = booking.time.split(':');
            return `${hour}:${minute}`; // Normalize to HH:mm format
          }) || [];
        console.log('Horários ocupados:', bookedSlots); // Log para depuração

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

        const availableSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));
        console.log('Horários disponíveis após filtro:', availableSlots); // Log para depuração

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

        return data || [];
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

        return data;
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },
  },

  // Purchase operations
  purchases: {
    async create(purchaseData: CreatePurchaseRequest): Promise<Purchase | null> {
      try {
        // Preparar dados dos itens para a função SQL
        const items = purchaseData.items.map((item) => ({
          product_id: item.productId || null,
          course_id: item.courseId || null,
          item_name: item.itemName,
          item_type: item.itemType,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
        }));

        // Usar a função SQL helper para criar pedido + itens em transação (sem pagamento)
        const { data, error } = await supabase.rpc('create_purchase_with_items', {
          p_user_id: purchaseData.userId,
          p_total_amount: purchaseData.totalAmount,
          p_items: items,
          p_notes: purchaseData.notes,
        });

        if (error) {
          console.error('Error creating purchase:', error);
          return null;
        }

        // Buscar a compra criada com todos os dados
        return await this.getById(data);
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },

    async getById(id: string): Promise<Purchase | null> {
      try {
        const { data, error } = await supabase
          .from('purchase_history')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching purchase:', error);
          return null;
        }

        return this.mapViewToPurchase(data);
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },

    async getByUserId(userId: string): Promise<Purchase[]> {
      try {
        const { data, error } = await supabase
          .from('purchase_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching purchases:', error);
          return [];
        }

        return (data || []).map(this.mapViewToPurchase);
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },

    // Helper para converter dados da view para o tipo Purchase (sem pagamento)
    mapViewToPurchase(viewData: any): Purchase {
      return {
        id: viewData.id,
        userId: viewData.user_id,
        totalAmount: parseFloat(viewData.total_amount),
        // 💳 PAGAMENTO: Campos removidos para evitar taxas de gateway
        // paymentMethod: viewData.payment_method,
        // paymentStatus: viewData.payment_status,
        status: viewData.status,
        notes: viewData.notes,
        items: (viewData.items || []).map(
          (item: any): PurchaseItem => ({
            id: item.id,
            purchaseId: viewData.id,
            productId: item.product_id,
            courseId: item.course_id,
            itemName: item.item_name,
            itemType: item.item_type,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unit_price),
            totalPrice: parseFloat(item.total_price),
          }),
        ),
        createdAt: viewData.created_at,
        updatedAt: viewData.updated_at,
      };
    },
  },

  // Chat operations
  chat: {
    async getMessages(limit: number = 50): Promise<ChatMessage[]> {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          console.error('Error fetching messages:', error);
          return [];
        }

        // Convert snake_case to camelCase and reverse to show oldest first
        return (data || []).reverse().map((message) => ({
          id: message.id,
          content: message.content,
          senderId: message.sender_id,
          senderName: message.sender_name,
          senderAvatar: message.sender_avatar,
          timestamp: message.created_at, // Keep for compatibility
          createdAt: message.created_at,
          updatedAt: message.updated_at,
        }));
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },

    async sendMessage(messageData: CreateMessageRequest): Promise<ChatMessage | null> {
      try {
        // Convert camelCase to snake_case for database
        const dbMessage = {
          content: messageData.content,
          sender_id: messageData.senderId,
          sender_name: messageData.senderName,
          sender_avatar: messageData.senderAvatar,
        };

        const { data, error } = await supabase.from('messages').insert(dbMessage).select().single();

        if (error) {
          console.error('Error sending message:', error);
          return null;
        }

        // Convert back to camelCase
        return {
          id: data.id,
          content: data.content,
          senderId: data.sender_id,
          senderName: data.sender_name,
          senderAvatar: data.sender_avatar,
          timestamp: data.created_at,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },

    async deleteMessage(messageId: string): Promise<boolean> {
      try {
        const { error } = await supabase.from('messages').delete().eq('id', messageId);

        if (error) {
          console.error('Error deleting message:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error:', error);
        return false;
      }
    },
  },
};
