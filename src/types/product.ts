// Product and e-commerce related types
import { Course } from './course';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  brand?: string;
  stock: number;
  active: boolean;
  featured: boolean;
  specifications?: Record<string, string>;
  createdAt: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  type: 'product' | 'course';
  productId?: string;
  courseId?: string;
  quantity: number;
  price: number;

  // Relations (populated when needed)
  product?: Product;
  course?: Course;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod: 'card' | 'pix' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  deliveryMethod: 'pickup'; // Only pickup for now
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  type: 'product' | 'course';
  productId?: string;
  courseId?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;

  // Relations
  product?: Product;
  course?: Course;
}

// For creating orders
export interface CreateOrderData {
  items: Array<{
    type: 'product' | 'course';
    id: string;
    quantity: number;
  }>;
  paymentMethod: 'card' | 'pix' | 'cash';
  notes?: string;
}

// Purchase system (pedidos sem pagamento - evita taxas de gateway)
export interface Purchase {
  id: string;
  userId: string;
  totalAmount: number;
  // 💳 PAGAMENTO: Campos removidos para evitar taxas de gateway
  // paymentMethod: 'card' | 'pix' | 'cash' | 'pending';
  // paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'requested' | 'confirmed' | 'ready' | 'completed' | 'cancelled';
  notes?: string;
  items: PurchaseItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId?: string;
  courseId?: string;
  itemName: string; // Nome no momento da compra (para histórico)
  itemType: 'product' | 'course';
  quantity: number;
  unitPrice: number;
  totalPrice: number;

  // Relations (populated when needed)
  product?: Product;
  course?: Course;
}

// For creating orders from cart (sem pagamento)
export interface CreatePurchaseRequest {
  userId: string;
  totalAmount: number;
  // 💳 PAGAMENTO: Campo removido para evitar taxas de gateway
  // paymentMethod: 'card' | 'pix' | 'cash' | 'pending';
  notes?: string;
  items: Array<{
    productId?: string;
    courseId?: string;
    itemName: string;
    itemType: 'product' | 'course';
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
}
