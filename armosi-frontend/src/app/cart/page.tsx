'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { CartItem } from '@/components/cart/CartItem';
import { CartEmpty } from '@/components/cart/CartEmpty';
import { db } from '@/lib/firebase';

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

type PaymentMethod = 'online' | 'cod';

interface CheckoutDetails {
  name: string;
  phone: string;
  email: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
}

interface DeliveryLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  mapLink: string;
  capturedAt: string;
}

interface ReverseGeocodeAddress {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
}

interface ReverseGeocodeResponse {
  display_name?: string;
  address?: ReverseGeocodeAddress;
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
}

interface OrderApiResponse {
  success?: boolean;
  appOrderId: string;
  paymentMethod: PaymentMethod;
  keyId?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  summary: {
    subtotal: number;
    delivery: number;
    total: number;
  };
  error?: string;
}

interface PlacedOrder {
  orderId: string;
  paymentMethod: PaymentMethod;
  paymentId?: string;
  total: number;
}

const inputStyle = {
  width: '100%',
  height: 44,
  background: 'var(--surf)',
  border: '1.5px solid var(--line)',
  borderRadius: 'var(--r)',
  padding: '0 13px',
  fontSize: 14,
  fontFamily: 'var(--ff-body)',
  color: 'var(--ink)',
  outline: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--mute)',
  marginBottom: 6,
};

function loadRazorpayScript() {
  return new Promise<boolean>(resolve => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function reverseGeocode(latitude: number, longitude: number) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', latitude.toString());
  url.searchParams.set('lon', longitude.toString());
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('zoom', '18');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) return null;

  const data = await response.json() as ReverseGeocodeResponse;
  const address = data.address || {};
  const addressLine = [
    address.road,
    address.neighbourhood,
    address.suburb,
  ].filter(Boolean).join(', ');

  return {
    address: addressLine || data.display_name || '',
    city: address.city || address.town || address.village || address.municipality || address.county || '',
    state: address.state || '',
    pincode: address.postcode || '',
  };
}

function getBestCurrentPosition() {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is unavailable.'));
      return;
    }

    let bestPosition: GeolocationPosition | null = null;
    let resolved = false;
    let watchId = 0;

    const finish = () => {
      if (resolved) return;
      resolved = true;
      navigator.geolocation.clearWatch(watchId);

      if (bestPosition) {
        resolve(bestPosition);
      } else {
        reject(new Error('Could not capture location.'));
      }
    };

    watchId = navigator.geolocation.watchPosition(
      position => {
        if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
          bestPosition = position;
        }

        if (position.coords.accuracy <= 35) {
          finish();
        }
      },
      error => {
        if (bestPosition) {
          finish();
          return;
        }

        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );

    window.setTimeout(finish, 10000);
  });
}

function PaymentOption({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        padding: '14px 14px',
        borderRadius: 'var(--r)',
        border: active ? '2px solid var(--v)' : '1.5px solid var(--line)',
        background: active ? 'var(--vmid)' : 'white',
        cursor: 'pointer',
        transition: 'border-color .15s ease, background .15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: active ? '5px solid var(--v)' : '2px solid var(--mute)',
            flexShrink: 0,
            marginTop: 2,
          }}
        />
        <span>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{title}</span>
          <span style={{ display: 'block', fontSize: 12, color: 'var(--mute)', marginTop: 3, lineHeight: 1.45 }}>
            {description}
          </span>
        </span>
      </div>
    </button>
  );
}

export default function CartPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [details, setDetails] = useState<CheckoutDetails>({
    name: '',
    phone: '',
    email: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  const subtotal = cartTotal();
  const delivery = subtotal > 0 && subtotal < 999 ? 49 : 0;
  const total = subtotal + delivery;
  const checkoutDetails = {
    ...details,
    name: details.name || user?.displayName || '',
    email: details.email || user?.email || '',
  };

  useEffect(() => {
    if (!user) return;

    getDoc(doc(db, 'users', user.uid))
      .then(snapshot => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        setDetails(prev => ({
          ...prev,
          phone: prev.phone || String(data.phone || ''),
          address: prev.address || String(data.address || ''),
          landmark: prev.landmark || String(data.landmark || ''),
          city: prev.city || String(data.city || ''),
          state: prev.state || String(data.state || ''),
          pincode: prev.pincode || String(data.pincode || ''),
        }));

        const savedLocation = data.deliveryLocation;
        if (savedLocation && Number(savedLocation.latitude) && Number(savedLocation.longitude)) {
          const latitude = Number(savedLocation.latitude);
          const longitude = Number(savedLocation.longitude);
          setDeliveryLocation({
            latitude,
            longitude,
            accuracy: Number(savedLocation.accuracy || 0),
            mapLink: String(savedLocation.mapLink || `https://www.google.com/maps?q=${latitude},${longitude}`),
            capturedAt: String(savedLocation.capturedAt || ''),
          });
        }
      })
      .catch(() => null);
  }, [user]);

  const updateDetails = (key: keyof CheckoutDetails, value: string) => {
    setDetails(prev => ({ ...prev, [key]: value }));
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast('Location is not supported on this device.');
      return;
    }

    setIsLocating(true);
    getBestCurrentPosition()
      .then(async position => {
        const { latitude, longitude, accuracy } = position.coords;
        setDeliveryLocation({
          latitude,
          longitude,
          accuracy,
          mapLink: `https://www.google.com/maps?q=${latitude},${longitude}`,
          capturedAt: new Date().toISOString(),
        });

        try {
          const locationDetails = await reverseGeocode(latitude, longitude);

          if (locationDetails) {
            setDetails(prev => ({
              ...prev,
              address: prev.address || locationDetails.address,
              city: prev.city || locationDetails.city,
              state: prev.state || locationDetails.state,
              pincode: prev.pincode || locationDetails.pincode.replace(/\D/g, '').slice(0, 6),
            }));

            if (locationDetails.city && locationDetails.pincode) {
              toast('Location added. City, state and pincode filled.');
            } else {
              toast('Location added. Please check city and pincode before payment.');
            }
          } else {
            toast('Location added. Please enter address details manually.');
          }
        } catch {
          toast('Location added. Could not auto-fill address details.');
        } finally {
          setIsLocating(false);
        }
      })
      .catch(() => {
        setIsLocating(false);
        toast('Could not access location. You can still enter your address manually.');
      });
  };

  const getOrderPayload = () => ({
    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: item.qty,
    })),
    customer: {
      ...checkoutDetails,
      location: deliveryLocation || undefined,
    },
    paymentMethod,
    userId: user?.uid || '',
  });

  const openRazorpayCheckout = async (order: OrderApiResponse, authToken: string) => {
    const scriptReady = await loadRazorpayScript();

    if (!scriptReady || !window.Razorpay || !order.keyId || !order.orderId) {
      toast('Could not load payment gateway. Try Cash on Delivery.');
      return;
    }

    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: order.amount!,
      currency: order.currency || 'INR',
      name: 'Armosi',
      description: 'Stationery order',
        order_id: order.orderId,
        prefill: {
        name: checkoutDetails.name,
        email: checkoutDetails.email,
        contact: checkoutDetails.phone,
      },
      notes: {
        address: `${checkoutDetails.address}, ${checkoutDetails.city} ${checkoutDetails.pincode}`.trim(),
      },
      theme: {
        color: '#6C48C5',
      },
      handler: async response => {
        const verifyResponse = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            app_order_id: order.appOrderId,
            ...response,
          }),
        });
        const verification = await verifyResponse.json();

        if (!verifyResponse.ok || !verification.verified) {
          toast(verification.error || 'Payment verification failed.');
          return;
        }

        setPlacedOrder({
          orderId: verification.appOrderId,
          paymentMethod: 'online',
          paymentId: verification.paymentId,
          total: order.summary?.total ?? total,
        });
        clearCart();
        toast('Payment successful. Order placed!');
      },
    });

    razorpay.on('payment.failed', response => {
      toast(response.error?.description || 'Payment failed. Please try again.');
    });

    razorpay.open();
  };

  const placeOrder = async () => {
    if (!user) {
      toast('Please login before placing your order.');
      return;
    }

    if (!checkoutDetails.name.trim()) {
      toast('Please enter your full name.');
      return;
    }

    if (!checkoutDetails.phone.trim()) {
      toast('Please enter your mobile number.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(checkoutDetails.phone.trim())) {
      toast('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!checkoutDetails.address.trim()) {
      toast('Please enter your delivery address.');
      return;
    }

    if (!checkoutDetails.city.trim()) {
      toast('Please enter your city.');
      return;
    }

    if (!checkoutDetails.pincode.trim()) {
      toast('Please enter your pincode.');
      return;
    }

    if (!/^\d{6}$/.test(checkoutDetails.pincode.trim())) {
      toast('Please enter a valid 6-digit pincode.');
      return;
    }

    if (cart.length === 0) {
      toast('Your cart is empty.');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const authToken = await user.getIdToken();
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(getOrderPayload()),
      });

      const order = await orderResponse.json() as OrderApiResponse;

      if (!orderResponse.ok) {
        toast(order.error || 'Could not place order.');
        return;
      }

      if (paymentMethod === 'cod') {
        setPlacedOrder({
          orderId: order.appOrderId,
          paymentMethod: 'cod',
          total: order.summary?.total ?? total,
        });
        clearCart();
        toast('Order placed! Pay cash when your order is delivered.');
        return;
      }

      await openRazorpayCheckout(order, authToken);
    } catch {
      toast('Something went wrong. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ padding: 'calc(var(--nav) + 20px) 18px 18px' }}>
        <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 32, fontWeight: 400, marginBottom: 4 }}>My Cart</h1>
      </div>

      {placedOrder ? (
        <div style={{ padding: '32px 18px', textAlign: 'center' }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%', background: '#EAFBF1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px', color: 'var(--green)', fontSize: 34,
          }}>
            ✓
          </div>
          <h2 style={{ fontFamily: 'var(--ff-head)', fontSize: 30, fontWeight: 400, marginBottom: 8 }}>Order Placed</h2>
          <p style={{ color: 'var(--mute)', fontSize: 14, lineHeight: 1.6 }}>
            Order ID: {placedOrder.orderId}
            <br />
            {placedOrder.paymentMethod === 'cod' ? (
              <>Payment: <strong>Cash on Delivery</strong><br />Please keep Rs. {placedOrder.total.toLocaleString('en-IN')} ready at delivery.</>
            ) : (
              <>Payment ID: {placedOrder.paymentId}</>
            )}
          </p>
        </div>
      ) : cart.length === 0 ? (
        <CartEmpty />
      ) : (
        <>
          {cart.map(item => (
            <CartItem key={item.id} item={item} />
          ))}

          <div style={{ padding: '18px', borderTop: '2px solid var(--line)', marginTop: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--mute)' }}>Subtotal</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Rs. {subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--mute)' }}>Delivery</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>{delivery === 0 ? 'Free' : `Rs. ${delivery}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
              <span style={{ fontSize: 14, color: 'var(--mute)' }}>Total</span>
              <span style={{ fontFamily: 'var(--ff-head)', fontSize: 30 }}>
                Rs. {total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div style={{ padding: '0 18px 20px' }}>
            <div style={{
              background: 'white',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--sh-sm)',
              padding: 16,
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, marginBottom: 14 }}>Checkout Details</h2>

              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Full name</label>
                  <input
                    value={checkoutDetails.name}
                    onChange={event => updateDetails('name', event.target.value)}
                    placeholder="Your name"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    value={details.phone}
                    onChange={event => updateDetails('phone', event.target.value)}
                    placeholder="10-digit mobile number"
                    inputMode="tel"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    value={checkoutDetails.email}
                    onChange={event => updateDetails('email', event.target.value)}
                    placeholder="Optional"
                    inputMode="email"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Delivery address</label>
                  <textarea
                    value={details.address}
                    onChange={event => updateDetails('address', event.target.value)}
                    placeholder="House number, building and street"
                    style={{ ...inputStyle, height: 78, paddingTop: 12, resize: 'vertical' }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Landmark</label>
                  <input
                    value={details.landmark}
                    onChange={event => updateDetails('landmark', event.target.value)}
                    placeholder="Nearby shop, school or area"
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={labelStyle}>City</label>
                    <input
                      value={details.city}
                      onChange={event => updateDetails('city', event.target.value)}
                      placeholder="City"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Pincode</label>
                    <input
                      value={details.pincode}
                      onChange={event => updateDetails('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6 digits"
                      inputMode="numeric"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>State</label>
                  <input
                    value={details.state}
                    onChange={event => updateDetails('state', event.target.value)}
                    placeholder="State"
                    style={inputStyle}
                  />
                </div>

                <div style={{
                  border: '1.5px solid var(--line)',
                  borderRadius: 'var(--r)',
                  padding: 12,
                  background: 'var(--surf)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Map location</p>
                      <p style={{ fontSize: 12, color: 'var(--mute)', marginTop: 3, lineHeight: 1.45 }}>
                        {deliveryLocation
                          ? `Added with ${Math.round(deliveryLocation.accuracy)}m accuracy`
                          : 'Optional, but helps with faster delivery.'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={captureLocation}
                      disabled={isLocating}
                      style={{
                        minWidth: 118,
                        height: 38,
                        border: 'none',
                        borderRadius: 'var(--r)',
                        background: isLocating ? 'var(--vl)' : 'var(--v)',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: isLocating ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isLocating ? 'Locating...' : deliveryLocation ? 'Update' : 'Use Location'}
                    </button>
                  </div>
                  {deliveryLocation && (
                    <a
                      href={deliveryLocation.mapLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: 'var(--v)', textDecoration: 'none', fontWeight: 600 }}
                    >
                      Open map location
                    </a>
                  )}
                </div>
              </div>

              <h2 style={{ fontSize: 17, fontWeight: 600, margin: '20px 0 12px' }}>Payment Method</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                <PaymentOption
                  active={paymentMethod === 'cod'}
                  title="Cash on Delivery"
                  description="Pay with cash when your order arrives at your doorstep."
                  onClick={() => setPaymentMethod('cod')}
                />
                <PaymentOption
                  active={paymentMethod === 'online'}
                  title="Pay Online"
                  description="Pay securely now using UPI, card, or net banking."
                  onClick={() => setPaymentMethod('online')}
                />
              </div>

              <button
                onClick={placeOrder}
                disabled={isPlacingOrder}
                style={{
                  width: '100%', height: 50,
                  background: isPlacingOrder ? 'var(--vl)' : 'var(--v)',
                  color: 'white', border: 'none',
                  borderRadius: 'var(--r)', fontSize: 15, fontFamily: 'var(--ff-body)',
                  fontWeight: 600, cursor: isPlacingOrder ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 22px rgba(108,72,197,.3)',
                  marginTop: 16,
                }}
              >
                {isPlacingOrder
                  ? 'Placing Order...'
                  : paymentMethod === 'cod'
                    ? `Place Order · Rs. ${total.toLocaleString('en-IN')} COD`
                    : `Pay Rs. ${total.toLocaleString('en-IN')} Online`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
