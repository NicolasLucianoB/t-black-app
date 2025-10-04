import { useState } from 'react';

import { ApiResponse } from '../types';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(options?: UseApiOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (apiCall: () => Promise<ApiResponse<T>>): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiCall();

      if (response.error) {
        setError(response.error);
        options?.onError?.(response.error);
      } else {
        setData(response.data);
        options?.onSuccess?.(response.data);
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado';
      setError(errorMessage);
      options?.onError?.(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}
