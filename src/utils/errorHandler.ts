// Error handling utilities
import { Alert } from 'react-native';

export enum ErrorType {
  NETWORK = 'network',
  AUTH = 'auth',
  VALIDATION = 'validation',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
}

// Error messages in Portuguese
const ERROR_MESSAGES = {
  [ErrorType.NETWORK]: 'Erro de conexão. Verifique sua internet.',
  [ErrorType.AUTH]: 'Erro de autenticação. Faça login novamente.',
  [ErrorType.VALIDATION]: 'Dados inválidos. Verifique os campos.',
  [ErrorType.SERVER]: 'Erro no servidor. Tente novamente.',
  [ErrorType.UNKNOWN]: 'Erro inesperado. Tente novamente.',
};

export class ErrorHandler {
  static createError(type: ErrorType, message?: string, code?: string, details?: any): AppError {
    return {
      type,
      message: message || ERROR_MESSAGES[type],
      code,
      details,
    };
  }

  static handleError(error: AppError | Error | string, showAlert = true): AppError {
    let appError: AppError;

    if (typeof error === 'string') {
      appError = this.createError(ErrorType.UNKNOWN, error);
    } else if (error instanceof Error) {
      appError = this.createError(ErrorType.UNKNOWN, error.message);
    } else {
      appError = error;
    }

    // Log error for debugging
    console.error('App Error:', appError);

    // Show alert if requested
    if (showAlert) {
      Alert.alert('Erro', appError.message, [{ text: 'OK' }]);
    }

    return appError;
  }

  static handleNetworkError(error: any): AppError {
    if (!error.response) {
      return this.createError(ErrorType.NETWORK, 'Sem conexão com a internet');
    }

    const status = error.response.status;
    let message = ERROR_MESSAGES[ErrorType.SERVER];

    switch (status) {
      case 401:
        message = 'Não autorizado. Faça login novamente.';
        return this.createError(ErrorType.AUTH, message, '401');
      case 403:
        message = 'Acesso negado.';
        return this.createError(ErrorType.AUTH, message, '403');
      case 404:
        message = 'Recurso não encontrado.';
        return this.createError(ErrorType.SERVER, message, '404');
      case 422:
        message = 'Dados inválidos.';
        return this.createError(ErrorType.VALIDATION, message, '422');
      case 500:
        message = 'Erro interno do servidor.';
        return this.createError(ErrorType.SERVER, message, '500');
      default:
        return this.createError(ErrorType.SERVER, message, status.toString());
    }
  }

  static isAuthError(error: AppError): boolean {
    return error.type === ErrorType.AUTH || error.code === '401' || error.code === '403';
  }

  static isNetworkError(error: AppError): boolean {
    return error.type === ErrorType.NETWORK;
  }

  static shouldRetry(error: AppError): boolean {
    return error.type === ErrorType.NETWORK || error.code === '500';
  }
}

// Validation utilities
export const ValidationUtils = {
  email: (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email é obrigatório';
    if (!emailRegex.test(email)) return 'Email inválido';
    return null;
  },

  password: (password: string): string | null => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    return null;
  },

  name: (name: string): string | null => {
    if (!name.trim()) return 'Nome é obrigatório';
    if (name.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
    return null;
  },

  phone: (phone: string): string | null => {
    if (!phone) return null; // Phone is optional
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(phone)) return 'Telefone inválido. Use o formato (11) 99999-9999';
    return null;
  },

  required: (value: any, fieldName: string): string | null => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} é obrigatório`;
    }
    return null;
  },
};

// Loading state utilities
export interface LoadingState {
  [key: string]: boolean;
}

export class LoadingManager {
  private static instance: LoadingManager;
  private loadingStates: LoadingState = {};
  private listeners: ((states: LoadingState) => void)[] = [];

  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  setLoading(key: string, loading: boolean): void {
    this.loadingStates[key] = loading;
    this.notifyListeners();
  }

  isLoading(key: string): boolean {
    return this.loadingStates[key] || false;
  }

  isAnyLoading(): boolean {
    return Object.values(this.loadingStates).some((loading) => loading);
  }

  getLoadingStates(): LoadingState {
    return { ...this.loadingStates };
  }

  addListener(listener: (states: LoadingState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getLoadingStates()));
  }
}
