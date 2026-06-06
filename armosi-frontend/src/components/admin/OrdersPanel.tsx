"use client";

import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/lib/admin/types";

function toDateLabel(value: string) {
  if (!value) return "Unknown";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function paymentBadgeClass(status: string) {
  if (status === "paid") return "adm-badge-paid";
  if (status === "failed") return "adm-badge-failed";
  if (status === "cod_pending") return "adm-badge-pending";
  return "adm-badge-pending";
}

function paymentStatusLabel(status: string) {
  if (status === "cod_pending") return "COD · Pay on delivery";
  if (status === "paid") return "Paid online";
  if (status === "pending") return "Payment pending";
  if (status === "failed") return "Payment failed";
  return status;
}

function paymentMethodLabel(method: string) {
  if (method === "cod") return "Cash on Delivery";
  if (method === "razorpay") return "Online (Razorpay)";
  return method;
}

function getMapLink(order: Order) {
  if (order.deliveryLocation?.mapLink) return order.deliveryLocation.mapLink;
  const latitude = order.deliveryLocation?.latitude;
  const longitude = order.deliveryLocation?.longitude;

  if (latitude && longitude) return `https://www.google.com/maps?q=${latitude},${longitude}`;
  return "";
}

function addressLines(order: Order) {
  return [
    order.customer?.address,
    order.customer?.landmark ? `Landmark: ${order.customer.landmark}` : "",
    [order.customer?.city, order.customer?.state, order.customer?.pincode].filter(Boolean).join(", "),
  ].filter(Boolean);
}

interface OrdersPanelProps {
  orders: Order[];
  loading: boolean;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  highlightOrderId?: string | null;
}

export default function OrdersPanel({
  orders,
  loading,
  setOrders,
  highlightOrderId,
}: OrdersPanelProps) {
  const updateOrderStatus = async (orderId: string, orderStatus: string) => {
    await updateDoc(doc(db, "orders", orderId), {
      orderStatus,
      updatedAt: new Date().toISOString(),
    });
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, orderStatus } : order));
  };

  const markCodCollected = async (orderId: string) => {
    await updateDoc(doc(db, "orders", orderId), {
      paymentStatus: "paid",
      updatedAt: new Date().toISOString(),
    });
    setOrders(prev =>
      prev.map(order => (order.id === orderId ? { ...order, paymentStatus: "paid" } : order)),
    );
  };

  if (loading) {
    return <div className="adm-empty">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="adm-card adm-empty">
        <p style={{ fontWeight: 600, color: 'var(--adm-ink)' }}>No orders yet</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>You will hear a sound and get an alert when a new order arrives.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {orders.map(order => {
        const isNew = highlightOrderId === order.id;

        return (
          <div
            key={order.id}
            className="adm-card adm-card-padded"
            style={isNew ? { boxShadow: '0 0 0 2px var(--adm-primary), var(--adm-shadow-lg)' } : undefined}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700 }}>{order.id}</h3>
                    {isNew && <span className="adm-badge adm-badge-new">NEW</span>}
                    <span className={`adm-badge ${paymentBadgeClass(order.paymentStatus)}`}>
                      {paymentStatusLabel(order.paymentStatus)}
                    </span>
                    <span className="adm-badge adm-badge-neutral">{paymentMethodLabel(order.paymentMethod)}</span>
                    <span className="adm-badge adm-badge-neutral">{order.orderStatus}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--adm-muted)' }}>{toDateLabel(order.createdAt)}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 320 }}>
                  <select
                    value={order.orderStatus}
                    onChange={event => updateOrderStatus(order.id, event.target.value)}
                    className="adm-select"
                    style={{ minHeight: 40 }}
                  >
                    <option value="placed">Placed</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivering">Out for delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {order.paymentMethod === "cod" && order.paymentStatus === "cod_pending" && (
                    <button type="button" onClick={() => markCodCollected(order.id)} className="adm-btn adm-btn-success adm-btn-sm">
                      Mark COD collected
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginTop: 8 }}>
                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Customer</h4>
                  <p style={{ fontSize: 14 }}>{order.customer?.name}</p>
                  <p style={{ fontSize: 14 }}>{order.customer?.phone}</p>
                  {order.customer?.email && <p style={{ fontSize: 14 }}>{order.customer.email}</p>}
                  <div className="adm-section" style={{ marginTop: 12, padding: 14 }}>
                    <h5 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--adm-muted)', marginBottom: 8 }}>
                      Delivery location
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {addressLines(order).map(line => (
                        <p key={line} style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{line}</p>
                      ))}
                    </div>
                    {getMapLink(order) ? (
                      <a href={getMapLink(order)} target="_blank" rel="noreferrer" className="adm-btn adm-btn-primary adm-btn-sm" style={{ marginTop: 12, display: 'inline-flex', textDecoration: 'none' }}>
                        Open in Google Maps
                      </a>
                    ) : (
                      <p style={{ marginTop: 10, fontSize: 12, color: '#b45309' }}>Customer did not share map location.</p>
                    )}
                    {order.deliveryLocation?.accuracy ? (
                      <p style={{ marginTop: 8, fontSize: 12, color: 'var(--adm-muted)' }}>
                        GPS accuracy: about {Math.round(order.deliveryLocation.accuracy)}m
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Items</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {order.items.map(item => (
                      <div key={`${order.id}-${item.productId}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}>
                        <span>{item.name} x {item.qty}</span>
                        <span style={{ fontWeight: 600 }}>Rs. {item.lineTotal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Payment</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>Rs. {order.summary.subtotal}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery</span><span>Rs. {order.summary.delivery}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, paddingTop: 8, borderTop: '1px solid var(--adm-line)' }}>
                      <span>Total</span><span>Rs. {order.summary.total}</span>
                    </div>
                  </div>
                  {order.razorpayPaymentId && (
                    <p style={{ fontSize: 11, color: 'var(--adm-muted)', marginTop: 12, wordBreak: 'break-all' }}>
                      Payment ID: {order.razorpayPaymentId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
