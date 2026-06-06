'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';

interface CustomerOrder {
  id: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  summary: { total: number };
  createdAt: string;
}

const trackingSteps = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivering', label: 'Out for delivery' },
  { key: 'delivered', label: 'Delivered' },
];

function statusColor(status: string) {
  if (status === 'delivered') return 'var(--green)';
  if (status === 'cancelled') return 'var(--rose)';
  return 'var(--v)';
}

function statusLabel(status: string) {
  if (status === 'delivering') return 'Out for delivery';
  return status;
}

function TrackingTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return (
      <div style={{ marginTop: 14, padding: 12, background: '#FFF0F3', borderRadius: 'var(--r)', color: 'var(--rose)', fontSize: 13, fontWeight: 600 }}>
        Order cancelled
      </div>
    );
  }

  const activeIndex = Math.max(0, trackingSteps.findIndex(step => step.key === status));

  return (
    <div style={{ display: 'grid', gap: 9, marginTop: 14 }}>
      {trackingSteps.map((step, index) => {
        const isDone = index <= activeIndex;

        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: isDone ? 'var(--v)' : 'white',
              border: isDone ? 'none' : '1.5px solid var(--line)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {isDone && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />}
            </span>
            <span style={{ fontSize: 12.5, color: isDone ? 'var(--ink)' : 'var(--mute)', fontWeight: isDone ? 600 : 500 }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/orders');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      query(collection(db, 'orders'), where('userId', '==', user.uid)),
      snapshot => {
        const data: CustomerOrder[] = [];
        snapshot.forEach(document => {
          const order = document.data();
          data.push({
            id: order.id || document.id,
            orderStatus: order.orderStatus || 'placed',
            paymentStatus: order.paymentStatus || 'pending',
            paymentMethod: order.paymentMethod || 'cod',
            summary: order.summary || { total: 0 },
            createdAt: order.createdAt || '',
          });
        });
        setOrders(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        setFetching(false);
      },
      error => {
        console.error('Failed to load orders', error);
        setFetching(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="page-body" style={{ padding: '120px 18px', textAlign: 'center' }}>
        <p style={{ color: 'var(--mute)' }}>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="page-body">
      <div style={{ padding: 'calc(var(--nav) + 20px) 18px 18px' }}>
        <Link href="/profile" style={{ fontSize: 13, color: 'var(--v)', textDecoration: 'none' }}>← Profile</Link>
        <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 32, fontWeight: 400, marginTop: 8 }}>My Orders</h1>
      </div>

      <div style={{ padding: '0 18px 24px' }}>
        {fetching ? (
          <p style={{ color: 'var(--mute)', textAlign: 'center', padding: '32px 0' }}>Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: 'var(--surf)',
            borderRadius: 'var(--r-lg)',
          }}>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>No orders yet</p>
            <p style={{ fontSize: 13, color: 'var(--mute)', marginBottom: 16 }}>Your placed orders will appear here.</p>
            <Link href="/shop" style={{ color: 'var(--v)', fontWeight: 600, textDecoration: 'none' }}>Start shopping →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {orders.map(order => (
              <div
                key={order.id}
                style={{
                  background: 'white',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-lg)',
                  padding: 16,
                  boxShadow: 'var(--sh-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600 }}>{order.id}</p>
                    <p style={{ fontSize: 12, color: 'var(--mute)', marginTop: 2 }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : '—'}
                    </p>
                  </div>
                  <p style={{ fontFamily: 'var(--ff-head)', fontSize: 22 }}>Rs. {order.summary.total}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: statusColor(order.orderStatus), background: 'var(--vpale)', padding: '4px 10px', borderRadius: 100, textTransform: 'capitalize' }}>
                    {statusLabel(order.orderStatus)}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--mute)', background: 'var(--surf)', padding: '4px 10px', borderRadius: 100 }}>
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid online'}
                  </span>
                </div>
                <TrackingTimeline status={order.orderStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
