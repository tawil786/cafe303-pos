"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Order = {
  id: string;
  createdAt: string;
  customerName: string;
  drinkName: string;
  drinkType: string;
  base: string | null;
  milk: string;
  sweetener: string;
  temperature: string;
  notes: string | null;
  status: string;
};

const AUTH_KEY = "cafe303-admin-authed";
const ADMIN_PASSWORD = "cafe303";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function customizationLine(order: Order) {
  return [
    order.base,
    order.milk,
    order.sweetener,
    order.temperature,
  ]
    .filter(Boolean)
    .join(" · ");
}

function playPing() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Audio may be blocked until user gesture
  }
}

function LoginScreen({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, "1");
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-navy px-6">
      <h1 className="font-serif text-4xl font-medium text-cream">Cafe 303</h1>
      <p className="mt-1 text-sm text-muted">Admin</p>
      <form
        onSubmit={handleSubmit}
        className="mt-10 flex w-full max-w-xs flex-col gap-3"
      >
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="Password"
          className="w-full rounded-lg border border-border-light bg-white px-4 py-3 text-navy outline-none focus:ring-2 focus:ring-navy-mid"
        />
        {error && (
          <p className="text-center text-sm text-red-400">Incorrect password</p>
        )}
        <button
          type="submit"
          className="rounded-lg border border-cream/60 py-3 text-base font-medium text-cream transition-colors hover:border-cream hover:bg-cream/10"
        >
          Enter
        </button>
      </form>
    </main>
  );
}

function PendingCard({
  order,
  confirming,
  onMarkComplete,
  onConfirm,
  onCancel,
}: {
  order: Order;
  confirming: boolean;
  onMarkComplete: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="rounded-xl border border-border-light bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-lg font-medium text-navy">{order.customerName}</p>
        <p className="shrink-0 text-xs text-muted">{formatTime(order.createdAt)}</p>
      </div>
      <p className="mt-1 text-base font-bold text-navy">{order.drinkName}</p>
      <p className="mt-1 text-[13px] text-muted">{customizationLine(order)}</p>
      {order.notes && (
        <p className="mt-2 text-xs italic text-muted">
          <span className="not-italic">Note:</span> {order.notes}
        </p>
      )}
      <div className="mt-4">
        {confirming ? (
          <div>
            <p className="mb-3 text-[13px] text-navy">
              Mark {order.customerName}&apos;s order as done?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 rounded-lg bg-forest py-2.5 text-sm font-medium text-cream hover:bg-forest-light"
              >
                Yes, done
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-lg border border-border-light py-2.5 text-sm font-medium text-muted hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={onMarkComplete}
            className="w-full rounded-lg border border-forest py-2.5 text-sm font-medium text-forest transition-colors hover:bg-selected-forest"
          >
            Mark complete
          </button>
        )}
      </div>
    </div>
  );
}

function CompletedCard({ order }: { order: Order }) {
  return (
    <div className="relative rounded-xl border border-border-light bg-white/60 p-3">
      <span className="absolute right-3 top-3 rounded bg-selected-forest px-1.5 py-0.5 text-[10px] font-semibold text-forest">
        ✓ Done
      </span>
      <div className="flex items-start justify-between gap-2 pr-14">
        <p className="text-sm font-medium text-muted">{order.customerName}</p>
        <p className="shrink-0 text-[11px] text-muted">
          {formatTime(order.createdAt)}
        </p>
      </div>
      <p className="mt-0.5 text-sm font-bold text-muted">{order.drinkName}</p>
      <p className="mt-0.5 text-xs text-muted">{customizationLine(order)}</p>
      {order.notes && (
        <p className="mt-1 text-[11px] italic text-muted">
          <span className="not-italic">Note:</span> {order.notes}
        </p>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [clearConfirming, setClearConfirming] = useState(false);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const isFirstFetchRef = useRef(true);

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY)) {
      setAuthed(true);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) return;
      const data: Order[] = await res.json();

      if (!isFirstFetchRef.current) {
        const hasNew = data.some((o) => !seenIdsRef.current.has(o.id));
        if (hasNew) playPing();
      }

      seenIdsRef.current = new Set(data.map((o) => o.id));
      isFirstFetchRef.current = false;
      setOrders(data);
    } catch {
      // ignore fetch errors during polling
    }
  }, []);

  useEffect(() => {
    if (!authed) return;

    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, [authed, fetchOrders]);

  async function markComplete(id: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "complete" }),
    });
    setConfirmingId(null);
    await fetchOrders();
  }

  async function clearCompleted() {
    const completed = orders.filter((o) => o.status === "complete");
    await Promise.all(
      completed.map((o) =>
        fetch(`/api/orders/${o.id}`, { method: "DELETE" })
      )
    );
    setClearConfirming(false);
    await fetchOrders();
  }

  if (!authed) {
    return <LoginScreen onSuccess={() => setAuthed(true)} />;
  }

  const pending = orders.filter((o) => o.status !== "complete");
  const completed = orders.filter((o) => o.status === "complete");

  return (
    <div className="flex min-h-screen flex-col bg-soft-white">
      <header className="flex items-center justify-between bg-navy px-4 py-3 sm:px-6">
        <p className="text-sm font-medium text-cream">Cafe 303 — Admin</p>
        <span className="rounded-full bg-forest px-3 py-1 text-xs font-medium text-cream">
          {pending.length} pending
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 md:flex-row md:gap-8 md:p-6">
        {/* Pending */}
        <section className="flex-1 md:flex-[2]">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-navy">
            Pending
          </h2>
          {pending.length === 0 ? (
            <p className="py-12 text-center text-muted">No orders yet ☕</p>
          ) : (
            <div className="space-y-3">
              {pending.map((order) => (
                <PendingCard
                  key={order.id}
                  order={order}
                  confirming={confirmingId === order.id}
                  onMarkComplete={() => setConfirmingId(order.id)}
                  onConfirm={() => markComplete(order.id)}
                  onCancel={() => setConfirmingId(null)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Completed */}
        <section className="flex-1">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              Completed
            </h2>
            {completed.length > 0 && !clearConfirming && (
              <button
                type="button"
                onClick={() => setClearConfirming(true)}
                className="text-xs font-medium text-red-600 underline-offset-2 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {clearConfirming && (
            <div className="mb-3 rounded-lg border border-border-light bg-white p-3">
              <p className="mb-2 text-[13px] text-navy">
                Clear all completed orders?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-medium text-white hover:bg-red-700"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setClearConfirming(false)}
                  className="flex-1 rounded-lg border border-border-light py-2 text-xs font-medium text-muted hover:bg-gray-50"
                >
                  No
                </button>
              </div>
            </div>
          )}

          {completed.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              Nothing completed yet
            </p>
          ) : (
            <div className="space-y-2">
              {completed.map((order) => (
                <CompletedCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
