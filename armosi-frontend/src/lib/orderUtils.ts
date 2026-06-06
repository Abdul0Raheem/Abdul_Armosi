import { CartItem } from './types';
import { OrderLineItem, OrderSummary } from './orderTypes';

export function getDeliveryCharge(subtotal: number) {
  if (subtotal <= 0 || subtotal >= 999) return 0;
  return 49;
}

export function buildOrderItems(items: Pick<CartItem, 'id' | 'name' | 'price' | 'qty'>[]) {
  return items
    .map(item => ({
      id: item.id,
      name: String(item.name || '').trim(),
      price: Math.max(0, Number(item.price) || 0),
      qty: Math.max(0, Math.floor(Number(item.qty))),
    }))
    .filter(item => item.name && item.price > 0 && item.qty > 0)
    .map<OrderLineItem>(item => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
      lineTotal: item.price * item.qty,
    }));
}

export function buildOrderSummary(items: OrderLineItem[]): OrderSummary {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const delivery = getDeliveryCharge(subtotal);

  return {
    subtotal,
    delivery,
    total: subtotal + delivery,
  };
}
