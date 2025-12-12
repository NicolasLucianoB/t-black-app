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

    async getAll(): Promise<User[]> {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching users:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },

    async update(id: string, updates: Partial<User>): Promise<User | null> {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({
            name: updates.name,
            email: updates.email,
            phone: updates.phone,
            is_banned: updates.isBanned,
          })
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating user:', error);
          return null;
        }

        return data;
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },

    async create(userData: Partial<User>): Promise<User | null> {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            is_banned: userData.isBanned || false,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating user:', error);
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
        const dbBooking: any = {
          user_id: booking.userId || null,
          barber_id: booking.barberId || null,
          service_id: booking.serviceId === 'default' ? null : booking.serviceId,
          date: booking.date,
          time: booking.time,
          status: booking.status,
          notes: booking.notes,
          total_price: booking.totalPrice,
          payment_method: booking.paymentMethod,
          payment_status: booking.paymentStatus,
          updated_at: booking.updatedAt,
        };

        // Adicionar client_name para agendamentos sem user_id
        if (booking.clientName && !booking.userId) {
          dbBooking.client_name = booking.clientName;
        }

        if (!dbBooking.barber_id || !dbBooking.service_id) {
          console.error('Missing required fields for booking:', dbBooking);
          throw new Error(
            'Campos obrigatórios não preenchidos: barbeiro e serviço são obrigatórios',
          );
        }

        // Check if the time slot is already booked for the barber
        const { data: existingBookings, error: checkError } = await supabase
          .from('bookings')
          .select('*')
          .eq('barber_id', dbBooking.barber_id)
          .eq('date', dbBooking.date)
          .eq('time', dbBooking.time)
          .in('status', ['scheduled', 'confirmed', 'in_progress']);

        if (checkError) {
          console.error('Error checking existing bookings:', checkError);
          // Continue anyway, don't block on this check
        }

        if (existingBookings && existingBookings.length > 0) {
          console.warn('Time slot may be already booked for this barber:', dbBooking);
          // For admin, we'll allow overbooking but warn
        }

        const { data, error } = await supabase.from('bookings').insert(dbBooking).select().single();

        if (error) {
          console.error('❌ Error creating booking:', error);
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

    async getByDate(date: string): Promise<any[]> {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(
            `
            *,
            users(name),
            barbers(name),
            services(name, price, duration)
          `,
          )
          .eq('date', date)
          .order('time', { ascending: true });

        if (error) {
          console.error('❌ Error fetching bookings by date:', error);
          return [];
        }

        // Transform data for agenda view
        return (data || []).map((booking) => ({
          id: booking.id,
          user_id: booking.user_id,
          barber_id: booking.barber_id,
          service_id: booking.service_id,
          date: booking.date,
          time: booking.time,
          status: booking.status,
          notes: booking.notes,
          total_price: booking.total_price,
          client_name: booking.client_name || booking.users?.name || 'Cliente',
          barber_name: booking.barbers?.name || 'Barbeiro',
          service_name: booking.services?.name || 'Serviço',
          service_price: booking.services?.price || 0,
          service_duration: booking.services?.duration || 30,
          created_at: booking.created_at,
          updated_at: booking.updated_at,
        }));
      } catch (error) {
        console.error('💥 Error:', error);
        return [];
      }
    },

    async getAvailableSlots(barberId: string, date: string): Promise<string[]> {
      try {
        // Get barber info to get working hours
        const { data: barber, error: barberError } = await supabase
          .from('barbers')
          .select('working_hours')
          .eq('id', barberId)
          .single();

        if (barberError || !barber) {
          console.error('Erro ao buscar barbeiro:', barberError);
          return [];
        }

        // Get existing bookings for the barber on the specified date
        const { data: existingBookings, error } = await supabase
          .from('bookings')
          .select('time')
          .eq('barber_id', barberId)
          .eq('date', date)
          .in('status', ['scheduled', 'confirmed', 'in_progress']); // Múltiplos status que bloqueiam horário

        if (error) {
          console.error('Erro ao buscar horários ocupados:', error);
          return [];
        }

        // Get booked slots
        const bookedSlots =
          existingBookings?.map((booking) => {
            const [hour, minute] = booking.time.split(':');
            return `${hour}:${minute}`; // Normalize to HH:mm format
          }) || [];

        // Parse real working hours from database
        const workingHours = barber.working_hours || [];

        const dayOfWeek = new Date(date + 'T00:00:00').getDay(); // 0=Sunday, 1=Monday, etc.
        const dayNames = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
        const currentDay = dayNames[dayOfWeek];

        // Find working hours for current day
        const todaySchedule = workingHours.find((schedule: string) =>
          schedule.toLowerCase().includes(currentDay.toLowerCase()),
        );

        if (!todaySchedule) {
          return [];
        }

        // Extract time ranges from schedule (e.g., "segunda:09:00-12:00,13:00-19:00")
        // Split by first colon to separate day from times
        const colonIndex = todaySchedule.indexOf(':');
        const timeRanges = todaySchedule.substring(colonIndex + 1);
        const ranges = timeRanges.split(',');

        const allSlots: string[] = [];

        ranges.forEach((range: string) => {
          const [start, end] = range.split('-');

          if (start && end) {
            const [startHour] = start.split(':').map(Number);
            const [endHour] = end.split(':').map(Number);

            // Generate hourly slots
            for (let hour = startHour; hour < endHour; hour++) {
              const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
              if (!allSlots.includes(timeSlot)) {
                allSlots.push(timeSlot);
              }
            }
          }
        });

        // Filter out past times if it's today
        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date();
        const currentHour = currentTime.getHours();

        let availableSlots = allSlots.filter((slot) => {
          // Remove booked slots
          if (bookedSlots.includes(slot)) {
            return false;
          }

          // If it's today, remove past times (add 1 hour buffer)
          if (date === today) {
            const [slotHour] = slot.split(':').map(Number);
            return slotHour > currentHour;
          }

          return true;
        });

        return availableSlots.sort();
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

    async update(id: string, updates: any): Promise<Booking | null> {
      try {
        const dbUpdates: any = {};

        if (updates.userId !== undefined) dbUpdates.user_id = updates.userId;
        if (updates.barberId !== undefined) dbUpdates.barber_id = updates.barberId;
        if (updates.serviceId !== undefined) dbUpdates.service_id = updates.serviceId;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.time !== undefined) dbUpdates.time = updates.time;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.totalPrice !== undefined) dbUpdates.total_price = updates.totalPrice;
        if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
        if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
        if (updates.clientName !== undefined) dbUpdates.client_name = updates.clientName;

        dbUpdates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
          .from('bookings')
          .update(dbUpdates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating booking:', error);
          return null;
        }

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

    async delete(id: string): Promise<boolean> {
      try {
        const { error } = await supabase.from('bookings').delete().eq('id', id);

        if (error) {
          console.error('Error deleting booking:', error);
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

        // Map database fields to interface fields
        return (data || []).map((barber) => ({
          id: barber.id,
          name: barber.name,
          avatar: barber.profile_image,
          specialties: barber.specialty ? [barber.specialty] : [],
          workingHours: barber.working_hours || [],
          active: barber.active,
          description: barber.description,
          rating: barber.rating,
          position: barber.position,
          showInBooking: barber.show_in_booking,
          userId: barber.user_id,
          services: barber.services,
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

        // Map database fields to interface fields
        return {
          id: data.id,
          name: data.name,
          avatar: data.profile_image,
          specialties: data.specialty ? [data.specialty] : [],
          workingHours: data.working_hours || [],
          active: data.active,
          description: data.description,
          rating: data.rating,
          position: data.position,
          showInBooking: data.show_in_booking,
          userId: data.user_id,
          services: data.services,
        };
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },

    async update(id: string, updates: Partial<Barber>): Promise<Barber | null> {
      try {
        // Build update object only with defined fields
        const updateData: any = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.position !== undefined) updateData.position = updates.position;
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.showInBooking !== undefined) updateData.show_in_booking = updates.showInBooking;
        if (updates.workingHours !== undefined) updateData.working_hours = updates.workingHours;
        if (updates.avatar !== undefined) updateData.profile_image = updates.avatar;
        if (updates.userId !== undefined) updateData.user_id = updates.userId;
        if (updates.services !== undefined) updateData.services = updates.services;

        const { data, error } = await supabase
          .from('barbers')
          .update(updateData)
          .eq('id', id)
          .select();

        if (error) {
          console.error('Error updating barber:', error);
          return null;
        }

        if (!data || data.length === 0) {
          return null;
        }

        const barberData = data[0];

        return {
          id: barberData.id,
          name: barberData.name,
          avatar: barberData.profile_image,
          specialties: barberData.specialty ? [barberData.specialty] : [],
          workingHours: barberData.working_hours || [],
          active: barberData.active,
          description: barberData.description,
          rating: barberData.rating,
          position: barberData.position,
          showInBooking: barberData.show_in_booking,
          userId: barberData.user_id,
          services: barberData.services,
        };
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },

    async create(barberData: Partial<Barber>): Promise<Barber | null> {
      try {
        const { data, error } = await supabase
          .from('barbers')
          .insert({
            name: barberData.name,
            position: barberData.position || 'Barbeiro',
            description: barberData.description,
            show_in_booking: barberData.showInBooking ?? true,
            working_hours: barberData.workingHours || {},
            profile_image: barberData.avatar,
            user_id: barberData.userId,
            services: barberData.services,
            active: true,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating barber:', error);
          return null;
        }

        return {
          id: data.id,
          name: data.name,
          avatar: data.profile_image,
          specialties: data.specialty ? [data.specialty] : [],
          workingHours: data.working_hours || [],
          active: data.active,
          description: data.description,
          rating: data.rating,
          position: data.position,
          showInBooking: data.show_in_booking,
          userId: data.user_id,
          services: data.services,
        };
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },

    async delete(id: string): Promise<boolean> {
      try {
        const { error } = await supabase.from('barbers').delete().eq('id', id);

        if (error) {
          console.error('Error deleting barber:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error:', error);
        return false;
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

    async updateMessage(messageId: string, newContent: string): Promise<boolean> {
      try {
        const { error } = await supabase
          .from('messages')
          .update({ content: newContent, updated_at: new Date().toISOString() })
          .eq('id', messageId);

        if (error) {
          console.error('Error updating message:', error);
          return false;
        }

        return true;
      } catch (error) {
        console.error('Error:', error);
        return false;
      }
    },
  },

  // Services operations
  services: {
    async getById(id: string) {
      try {
        const { data, error } = await supabase.from('services').select('*').eq('id', id).single();

        if (error) {
          console.error('Error fetching service:', error);
          return null;
        }

        return data;
      } catch (error) {
        console.error('Error:', error);
        return null;
      }
    },

    async getByBarberId(barberId: string) {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('barber_id', barberId)
          .eq('active', true)
          .order('name');

        if (error) {
          console.error('Error fetching services:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },

    async getAll() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('active', true)
          .order('name');

        if (error) {
          console.error('Error fetching all services:', error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error('Error:', error);
        return [];
      }
    },
  },
};
