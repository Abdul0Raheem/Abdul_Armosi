export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreCategory {
  id: string;
  label: string;
  group: string;
  order: number;
  showOnHome?: boolean;
  shopPath?: string;
  fallbackKey?: string;
  parentShop?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface OrderLineItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
  lineTotal: number;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email?: string;
  address: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface DeliveryLocation {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  mapLink?: string;
  capturedAt?: string;
}

export interface OrderSummary {
  subtotal: number;
  delivery: number;
  total: number;
}

export interface Order {
  id: string;
  customer: CustomerDetails;
  deliveryLocation?: DeliveryLocation;
  items: OrderLineItem[];
  summary: OrderSummary;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}
