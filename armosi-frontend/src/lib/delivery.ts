import { ARMOSI_SHOP } from '@/lib/shopConfig';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface DeliveryQuote {
  distanceKm: number;
  fee: number;
  available: boolean;
  message?: string;
  source: 'google-distance-matrix' | 'haversine';
}

const EARTH_RADIUS_KM = 6371;
export const DELIVERY_MAX_DISTANCE_KM = 100;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function isValidCoordinates(coords: Partial<Coordinates> | null | undefined): coords is Coordinates {
  if (!coords) return false;
  const latitude = Number(coords.latitude);
  const longitude = Number(coords.longitude);
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function calculateHaversineDistanceKm(origin: Coordinates, destination: Coordinates) {
  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLon = toRadians(destination.longitude - origin.longitude);
  const originLat = toRadians(origin.latitude);
  const destinationLat = toRadians(destination.latitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(destinationLat) * Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateDeliveryFee(distanceKm: number, freeDelivery = false) {
  if (freeDelivery) return 0;
  if (distanceKm <= 5) return 40;

  const additionalBands = Math.ceil(Math.max(0, distanceKm - 5) / 20);
  return 50 + additionalBands * 10;
}

export function buildDeliveryQuote(distanceKm: number, source: DeliveryQuote['source'], freeDelivery = false): DeliveryQuote {
  const roundedDistance = Math.round(distanceKm * 10) / 10;

  if (roundedDistance > DELIVERY_MAX_DISTANCE_KM) {
    return {
      distanceKm: roundedDistance,
      fee: 0,
      available: false,
      message: 'Delivery currently unavailable for this location',
      source,
    };
  }

  return {
    distanceKm: roundedDistance,
    fee: calculateDeliveryFee(roundedDistance, freeDelivery),
    available: true,
    source,
  };
}

export function getFallbackDeliveryQuote(destination: Coordinates, freeDelivery = false) {
  const distanceKm = calculateHaversineDistanceKm(
    { latitude: ARMOSI_SHOP.latitude, longitude: ARMOSI_SHOP.longitude },
    destination,
  );
  return buildDeliveryQuote(distanceKm, 'haversine', freeDelivery);
}
