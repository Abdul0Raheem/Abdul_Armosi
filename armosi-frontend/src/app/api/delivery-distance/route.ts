import { NextResponse } from 'next/server';
import {
  buildDeliveryQuote,
  getFallbackDeliveryQuote,
  isValidCoordinates,
  type Coordinates,
} from '@/lib/delivery';
import { ARMOSI_SHOP } from '@/lib/shopConfig';

interface GoogleDistanceMatrixResponse {
  rows?: Array<{
    elements?: Array<{
      status?: string;
      distance?: { value?: number };
    }>;
  }>;
}

async function getGoogleDistanceQuote(destination: Coordinates) {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
  url.searchParams.set('origins', `${ARMOSI_SHOP.latitude},${ARMOSI_SHOP.longitude}`);
  url.searchParams.set('destinations', `${destination.latitude},${destination.longitude}`);
  url.searchParams.set('mode', 'driving');
  url.searchParams.set('units', 'metric');
  url.searchParams.set('key', key);

  const response = await fetch(url, { next: { revalidate: 300 } });
  if (!response.ok) return null;

  const payload = await response.json() as GoogleDistanceMatrixResponse;
  const element = payload.rows?.[0]?.elements?.[0];
  const meters = Number(element?.distance?.value);

  if (element?.status !== 'OK' || !Number.isFinite(meters)) return null;
  return buildDeliveryQuote(meters / 1000, 'google-distance-matrix');
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const destination = {
    latitude: Number(body?.latitude),
    longitude: Number(body?.longitude),
  };

  if (!isValidCoordinates(destination)) {
    return NextResponse.json({ error: 'Please select a valid delivery location.' }, { status: 400 });
  }

  const googleQuote = await getGoogleDistanceQuote(destination).catch(() => null);
  return NextResponse.json(googleQuote || getFallbackDeliveryQuote(destination));
}
