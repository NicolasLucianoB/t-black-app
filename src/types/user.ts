// User related types
import { UserRole } from './auth';

export interface User {
  id?: string;
  email?: string;
  name?: string;
  phone?: string | null;
  avatar?: string | null;
  user_role?: UserRole;
  createdAt?: string;
  updatedAt?: string;
  isBanned?: boolean;
}

export interface UserProfile extends User {
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  addresses?: Address[];
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}
