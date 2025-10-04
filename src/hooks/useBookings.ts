import { useCallback, useEffect, useState } from 'react';

import { databaseService } from '../services';
import { Booking, CreateBookingData, CreateBookingRequest } from '../types';
import { useApi } from './useApi';

export function useBookings(userId?: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { loading, error, execute } = useApi<Booking[]>();

  const loadBookings = useCallback(async () => {
    if (!userId) return;

    await execute(async () => {
      const data = await databaseService.bookings.getByUserId(userId);
      setBookings(data);
      return { data, error: null };
    });
  }, [userId, execute]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: loadBookings,
  };
}

export function useCreateBooking(userId: string) {
  const { loading, error, execute } = useApi<Booking>();

  const createBooking = async (bookingData: CreateBookingData, totalPrice: number) => {
    return await execute(async () => {
      // Transform CreateBookingData into the format expected by the database
      const bookingToCreate: CreateBookingRequest = {
        userId,
        barberId: bookingData.barberId,
        serviceId: bookingData.serviceId,
        date: bookingData.date,
        time: bookingData.time,
        status: 'scheduled',
        notes: bookingData.notes,
        totalPrice,
        paymentMethod: bookingData.paymentMethod || 'pending',
        paymentStatus: 'pending',
        updatedAt: new Date().toISOString(),
      };

      const data = await databaseService.bookings.create(bookingToCreate);
      return { data, error: data ? null : 'Erro ao criar agendamento' };
    });
  };

  return {
    createBooking,
    loading,
    error,
  };
}

export function useAvailableSlots(barberId?: string, date?: string) {
  const [slots, setSlots] = useState<string[]>([]);
  const { loading, error, execute } = useApi<string[]>();

  const loadSlots = useCallback(async () => {
    if (!barberId || !date) return;

    await execute(async () => {
      const data = await databaseService.bookings.getAvailableSlots(barberId, date);
      setSlots(data);
      return { data, error: null };
    });
  }, [barberId, date, execute]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  return {
    slots,
    loading,
    error,
    refetch: loadSlots,
  };
}
