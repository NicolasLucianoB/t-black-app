import { useCallback, useEffect, useState } from 'react';

import { databaseService } from '../services';
import { Barber } from '../types';
import { useApi } from './useApi';

export function useBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const { loading, error, execute } = useApi<Barber[]>();

  const loadBarbers = useCallback(async () => {
    await execute(async () => {
      const data = await databaseService.barbers.getAll();
      setBarbers(data);
      return { data, error: null };
    });
  }, [execute]);

  useEffect(() => {
    loadBarbers();
  }, [loadBarbers]);

  return {
    barbers,
    loading,
    error,
    refetch: loadBarbers,
  };
}

export function useBarber(barberId?: string) {
  const [barber, setBarber] = useState<Barber | null>(null);
  const { loading, error, execute } = useApi<Barber>();

  const loadBarber = useCallback(async () => {
    if (!barberId) return;

    await execute(async () => {
      const data = await databaseService.barbers.getById(barberId);
      setBarber(data);
      return { data, error: data ? null : 'Barbeiro não encontrado' };
    });
  }, [barberId, execute]);

  useEffect(() => {
    loadBarber();
  }, [loadBarber]);

  return {
    barber,
    loading,
    error,
    refetch: loadBarber,
  };
}
