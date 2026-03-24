"use client";

import { useState, useTransition } from "react";

import type { AdminOrder } from "@/lib/contracts";
import { updateOrderStatus } from "@/lib/client-api";

type AdminOrderManagerProps = {
  initialOrders: AdminOrder[];
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AdminOrderManager({ initialOrders }: AdminOrderManagerProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <article className="admin-card rounded-[36px] p-8">
      <p className="eyebrow text-[var(--ink-soft)]">Orders</p>
      <h2 className="display mt-4 text-3xl font-semibold">Manage order status</h2>
      <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
        The order queue now stands alone so operational updates do not compete with unrelated page state.
      </p>

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <div
            key={order.orderNumber}
            className="grid gap-4 rounded-[28px] border border-[var(--line)] bg-white/72 p-5 lg:grid-cols-[minmax(0,1fr)_220px]"
          >
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-semibold">{order.orderNumber}</p>
                <span className="rounded-full bg-[rgba(36,93,90,0.12)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
                  {order.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                {order.customerName} · {order.customerType} · {order.phone}
              </p>
              <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
                {order.itemCount} items · {order.paymentMethod} · {order.paymentStatus}
              </p>
              <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
                {formatDateTime(order.createdAt)} · {formatPrice(order.total)}원
              </p>
            </div>

            <div className="grid gap-3">
              <select
                value={order.status}
                onChange={(event) =>
                  setOrders((current) =>
                    current.map((item) =>
                      item.orderNumber === order.orderNumber ? { ...item, status: event.target.value } : item,
                    ),
                  )
                }
                className="admin-input px-4 py-3"
              >
                <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                <option value="PAID">PAID</option>
                <option value="PREPARING">PREPARING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="REFUND_REQUESTED">REFUND_REQUESTED</option>
                <option value="REFUNDED">REFUNDED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>

              <button
                type="button"
                disabled={isPending}
                onClick={() => {
                  setMessage("");
                  setError("");

                  startTransition(() => {
                    void (async () => {
                      try {
                        const nextStatus =
                          orders.find((item) => item.orderNumber === order.orderNumber)?.status ?? order.status;
                        const nextOrder = await updateOrderStatus(order.orderNumber, { status: nextStatus });

                        setOrders((current) =>
                          current.map((item) => (item.orderNumber === nextOrder.orderNumber ? nextOrder : item)),
                        );
                        setMessage(`Updated ${nextOrder.orderNumber}.`);
                      } catch (saveError) {
                        setError(getErrorMessage(saveError, "Failed to update order status."));
                      }
                    })();
                  });
                }}
                className="admin-button-secondary px-5 py-3 disabled:opacity-60"
              >
                {isPending ? "Saving..." : "Save status"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {message ? <p className="mt-5 text-sm text-[var(--teal)]">{message}</p> : null}
      {error ? <p className="mt-5 text-sm text-red-600">{error}</p> : null}
    </article>
  );
}
