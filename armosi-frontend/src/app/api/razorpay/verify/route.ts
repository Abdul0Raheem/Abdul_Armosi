import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { updateFirestoreDocument } from '@/lib/firestoreRest';

interface VerifyBody {
  app_order_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

function safeCompare(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization') || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
}

export async function POST(request: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const authToken = getBearerToken(request);

  if (!keySecret) {
    return NextResponse.json(
      { error: 'Razorpay secret is not configured.' },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null) as VerifyBody | null;
  const appOrderId = body?.app_order_id;
  const orderId = body?.razorpay_order_id;
  const paymentId = body?.razorpay_payment_id;
  const signature = body?.razorpay_signature;

  if (!appOrderId || !orderId || !paymentId || !signature) {
    return NextResponse.json({ error: 'Missing payment verification fields.' }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  if (!safeCompare(expectedSignature, signature)) {
    await updateFirestoreDocument('orders', appOrderId, {
      paymentStatus: 'failed',
      updatedAt: new Date().toISOString(),
    }, authToken).catch(() => null);

    return NextResponse.json({ error: 'Payment signature verification failed.' }, { status: 400 });
  }

  await updateFirestoreDocument('orders', appOrderId, {
    paymentStatus: 'paid',
    razorpayPaymentId: paymentId,
    updatedAt: new Date().toISOString(),
  }, authToken);

  return NextResponse.json({
    verified: true,
    appOrderId,
    orderId,
    paymentId,
  });
}
