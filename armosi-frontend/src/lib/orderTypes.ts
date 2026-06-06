import { CartItem } from './types';

export interface CheckoutCustomer {
  name: string;
  phone: string;
  email?: string;
  address: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  location?: DeliveryLocation;
}

export interface DeliveryLocation {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  mapLink?: string;
  capturedAt?: string;
}

export interface OrderLineItem {
  productId: number | string;
  name: string;
  price: number;
  qty: number;
  lineTotal: number;
}

export interface OrderSummary {
  subtotal: number;
  delivery: number;
  total: number;
}

export interface OrderDraft {
  customer: CheckoutCustomer;
  items: CartItem[];
}

export interface StoredOrder {
  id: string;
  customer: CheckoutCustomer;
  deliveryLocation?: DeliveryLocation;
  items: OrderLineItem[];
  summary: OrderSummary;
  orderStatus: 'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivering' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cod_pending';
  paymentMethod: 'razorpay' | 'cod';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}
