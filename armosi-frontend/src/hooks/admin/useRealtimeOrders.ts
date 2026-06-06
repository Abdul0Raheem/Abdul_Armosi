"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Order } from "@/lib/admin/types";

function mapOrderDoc(orderDoc: { id: string; data: () => Record<string, unknown> }): Order {
  const data = orderDoc.data();

  return {
    id: String(data.id || orderDoc.id),
    customer: data.customer as Order["customer"],
    deliveryLocation: data.deliveryLocation as Order["deliveryLocation"],
    items: (data.items as Order["items"]) || [],
    summary: (data.summary as Order["summary"]) || { subtotal: 0, delivery: 0, total: 0 },
    orderStatus: String(data.orderStatus || "placed"),
    paymentStatus: String(data.paymentStatus || "pending"),
    paymentMethod: String(data.paymentMethod || "razorpay"),
    razorpayOrderId: data.razorpayOrderId ? String(data.razorpayOrderId) : undefined,
    razorpayPaymentId: data.razorpayPaymentId ? String(data.razorpayPaymentId) : undefined,
    createdAt: String(data.createdAt || ""),
    updatedAt: String(data.updatedAt || ""),
  };
}

export function useRealtimeOrders(onNewOrder?: (order: Order) => void) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const initialLoad = useRef(true);
  const seenOrderIds = useRef(new Set<string>());

  useEffect(() => {
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      ordersQuery,
      snapshot => {
        const orderData = snapshot.docs.map(document => mapOrderDoc(document));
        setOrders(orderData);
        setLoading(false);

        if (initialLoad.current) {
          orderData.forEach(order => seenOrderIds.current.add(order.id));
          initialLoad.current = false;
          return;
        }

        orderData.forEach(order => {
          if (!seenOrderIds.current.has(order.id)) {
            seenOrderIds.current.add(order.id);
            onNewOrder?.(order);
          }
        });
      },
      error => {
        console.error("Realtime orders error:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [onNewOrder]);

  return { orders, setOrders, loading };
}
