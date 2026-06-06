import { NextResponse } from 'next/server';
import { createFirestoreDocument } from '@/lib/firestoreRest';
import { CheckoutCustomer } from '@/lib/orderTypes';
import { buildOrderItems, buildOrderSummary } from '@/lib/orderUtils';

interface OrderItemInput {
  id: number | string;
  name: string;
  price: number;
  qty: number;
}

function normalizeCustomer(customer: Partial<CheckoutCustomer> | undefined): CheckoutCustomer {
  return {
    name: String(customer?.name || '').trim(),
    phone: String(customer?.phone || '').trim(),
    email: String(customer?.email || '').trim(),
    address: String(customer?.address || '').trim(),
  };
}

export async function POST(request: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: 'Razorpay keys are not configured.' },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items as OrderItemInput[] : [];
  const customer = normalizeCustomer(body?.customer);

  if (!customer.name || !customer.phone || !customer.address) {
    return NextResponse.json({ error: 'Customer name, phone and address are required.' }, { status: 400 });
  }

  const orderItems = buildOrderItems(items);

  if (orderItems.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }

  const summary = buildOrderSummary(orderItems);
  const amount = summary.total * 100;
  const appOrderId = `AR${Date.now()}`;

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount,
      currency: 'INR',
      receipt: appOrderId,
      notes: {
        appOrderId,
        source: 'armosi-frontend',
      },
    }),
  });

  const razorpayOrder = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { error: razorpayOrder?.error?.description || 'Could not create Razorpay order.' },
      { status: response.status },
    );
  }

  const now = new Date().toISOString();

  try {
    await createFirestoreDocument('orders', appOrderId, {
      id: appOrderId,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address,
      },
      items: orderItems.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        lineTotal: item.lineTotal,
      })),
      summary: {
        subtotal: summary.subtotal,
        delivery: summary.delivery,
        total: summary.total,
      },
      orderStatus: 'placed',
      paymentStatus: 'pending',
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      razorpayPaymentId: '',
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save order.';

    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    appOrderId,
    keyId,
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    summary,
  });
}
