import { Order } from "@/lib/admin/types";

export async function requestAdminNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported" as const;
  }

  if (Notification.permission === "granted") return "granted" as const;
  if (Notification.permission === "denied") return "denied" as const;

  const permission = await Notification.requestPermission();
  return permission;
}

export function showNewOrderNotification(order: Order) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const customer = order.customer?.name || "Customer";
  const total = order.summary?.total ?? 0;

  new Notification("New order — Armosi", {
    body: `${customer} · Rs. ${total} · ${order.id}`,
    tag: order.id,
  });
}

export function playNewOrderSound() {
  if (typeof window === "undefined") return;

  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    oscillator.frequency.setValueAtTime(660, context.currentTime + 0.12);

    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.35);
    oscillator.onended = () => {
      void context.close();
    };
  } catch {
    // Ignore if audio is blocked.
  }
}

export function notifyAdminNewOrder(order: Order) {
  playNewOrderSound();
  showNewOrderNotification(order);
}
