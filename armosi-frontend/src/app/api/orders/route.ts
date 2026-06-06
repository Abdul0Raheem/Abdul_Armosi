import { NextResponse } from 'next/server';
import { createFirestoreDocument, updateFirestoreDocument } from '@/lib/firestoreRest';
import { CheckoutCustomer } from '@/lib/orderTypes';
import { buildOrderItems, buildOrderSummary } from '@/lib/orderUtils';

interface OrderItemInput {
  id: number | string;
  name: string;
  price: number;
  qty: number;
}

type PaymentMethod = 'cod' | 'online';

function normalizeCustomer(customer: Partial<CheckoutCustomer> | undefined): CheckoutCustomer {
  const latitude = Number(customer?.location?.latitude);
  const longitude = Number(customer?.location?.longitude);
  const accuracy = Number(customer?.location?.accuracy);

  return {
    name: String(customer?.name || '').trim(),
    phone: String(customer?.phone || '').trim(),
    email: String(customer?.email || '').trim(),
    address: String(customer?.address || '').trim(),
    landmark: String(customer?.landmark || '').trim(),
    city: String(customer?.city || '').trim(),
    state: String(customer?.state || '').trim(),
    pincode: String(customer?.pincode || '').trim(),
    location: Number.isFinite(latitude) && Number.isFinite(longitude)
      ? {
          latitude,
          longitude,
          accuracy: Number.isFinite(accuracy) ? accuracy : 0,
          mapLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
          capturedAt: String(customer?.location?.capturedAt || new Date().toISOString()),
        }
      : undefined,
  };
}

function buildFirestoreOrderPayload(
  appOrderId: string,
  customer: CheckoutCustomer,
  orderItems: ReturnType<typeof buildOrderItems>,
  summary: ReturnType<typeof buildOrderSummary>,
  paymentMethod: PaymentMethod,
  extras?: {
    razorpayOrderId?: string;
    paymentStatus?: string;
    userId?: string;
  },
) {
  const now = new Date().toISOString();

  return {
    id: appOrderId,
    userId: extras?.userId || '',
    customer: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address,
      landmark: customer.landmark || '',
      city: customer.city || '',
      state: customer.state || '',
      pincode: customer.pincode || '',
    },
    deliveryLocation: {
      latitude: customer.location?.latitude || 0,
      longitude: customer.location?.longitude || 0,
      accuracy: customer.location?.accuracy || 0,
      mapLink: customer.location?.mapLink || '',
      capturedAt: customer.location?.capturedAt || '',
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
    paymentStatus: extras?.paymentStatus || (paymentMethod === 'cod' ? 'cod_pending' : 'pending'),
    paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
    razorpayOrderId: extras?.razorpayOrderId || '',
    razorpayPaymentId: '',
    createdAt: now,
    updatedAt: now,
  };
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization') || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
}

async function saveUserDeliveryDetails(userId: string, customer: CheckoutCustomer, authToken?: string) {
  const now = new Date().toISOString();
  await updateFirestoreDocument('users', userId, {
    name: customer.name,
    phone: customer.phone,
    email: customer.email || '',
    address: customer.address,
    landmark: customer.landmark || '',
    city: customer.city || '',
    state: customer.state || '',
    pincode: customer.pincode || '',
    deliveryLocation: {
      latitude: customer.location?.latitude || 0,
      longitude: customer.location?.longitude || 0,
      accuracy: customer.location?.accuracy || 0,
      mapLink: customer.location?.mapLink || '',
      capturedAt: customer.location?.capturedAt || '',
    },
    updatedAt: now,
  }, authToken);
}

export async function POST(request: Request) {
  const authToken = getBearerToken(request);
  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.items) ? (body.items as OrderItemInput[]) : [];
  const customer = normalizeCustomer(body?.customer);
  const paymentMethod: PaymentMethod = body?.paymentMethod === 'cod' ? 'cod' : 'online';
  const userId = String(body?.userId || '').trim();

  if (!customer.name) {
    return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
  }

  if (!customer.phone) {
    return NextResponse.json({ error: 'Please enter your mobile number.' }, { status: 400 });
  }

  if (!/^[6-9]\d{9}$/.test(customer.phone)) {
    return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
  }

  if (!customer.address) {
    return NextResponse.json({ error: 'Please enter your delivery address.' }, { status: 400 });
  }

  if (!customer.city) {
    return NextResponse.json({ error: 'Please enter your city.' }, { status: 400 });
  }

  if (!customer.pincode) {
    return NextResponse.json({ error: 'Please enter your pincode.' }, { status: 400 });
  }

  if (!/^\d{6}$/.test(customer.pincode)) {
    return NextResponse.json({ error: 'Please enter a valid 6-digit pincode.' }, { status: 400 });
  }

  const orderItems = buildOrderItems(items);

  if (orderItems.length === 0) {
    return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
  }

  const summary = buildOrderSummary(orderItems);
  const appOrderId = `AR${Date.now()}`;

  if (paymentMethod === 'cod') {
    try {
      await createFirestoreDocument(
        'orders',
        appOrderId,
        buildFirestoreOrderPayload(appOrderId, customer, orderItems, summary, 'cod', { userId }),
        authToken,
      );
      if (userId) {
        await saveUserDeliveryDetails(userId, customer, authToken).catch(() => null);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save order.';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      appOrderId,
      paymentMethod: 'cod',
      summary,
    });
  }

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: 'Online payment is not configured. Please choose Cash on Delivery.' },
      { status: 500 },
    );
  }

  const amount = summary.total * 100;

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

  try {
    await createFirestoreDocument(
      'orders',
      appOrderId,
      buildFirestoreOrderPayload(appOrderId, customer, orderItems, summary, 'online', {
        razorpayOrderId: razorpayOrder.id,
        paymentStatus: 'pending',
        userId,
      }),
      authToken,
    );
    if (userId) {
      await saveUserDeliveryDetails(userId, customer, authToken).catch(() => null);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save order.';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    appOrderId,
    paymentMethod: 'online',
    keyId,
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    summary,
  });
}
