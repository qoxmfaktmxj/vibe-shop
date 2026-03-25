"use client";

import { useState, useTransition } from "react";

import type { AdminOrder } from "@/lib/admin-contracts";
import { updateOrderStatus } from "@/lib/admin-client-api";

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

function formatCustomerType(value: string) {
  const labels: Record<string, string> = {
    MEMBER: "회원",
    GUEST: "비회원",
  };
  return labels[value] ?? value;
}

export function AdminOrderManager({ initialOrders }: AdminOrderManagerProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <article className="admin-card rounded-[36px] p-8">
      <p className="eyebrow text-[var(--ink-soft)]">주문 관리</p>
      <h2 className="display mt-4 text-3xl font-semibold">주문 상태 업데이트</h2>
      <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
        운영팀이 바로 확인해야 하는 주문만 모아 상태를 빠르게 전환할 수 있도록 구성했습니다.
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
                {order.customerName} / {formatCustomerType(order.customerType)} / {order.phone}
              </p>
              <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
                상품 {order.itemCount}개 / {order.paymentMethod} / {order.paymentStatus}
              </p>
              <p className="mt-1 text-sm leading-7 text-[var(--ink-soft)]">
                {formatDateTime(order.createdAt)} / {formatPrice(order.total)}원
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
                <option value="PENDING_PAYMENT">결제 대기</option>
                <option value="PAID">결제 완료</option>
                <option value="PREPARING">상품 준비중</option>
                <option value="SHIPPED">배송중</option>
                <option value="DELIVERED">배송 완료</option>
                <option value="REFUND_REQUESTED">환불 요청</option>
                <option value="REFUNDED">환불 완료</option>
                <option value="CANCELLED">주문 취소</option>
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
                        setMessage(`${nextOrder.orderNumber} 주문 상태를 저장했습니다.`);
                      } catch (saveError) {
                        setError(getErrorMessage(saveError, "주문 상태를 저장하지 못했습니다."));
                      }
                    })();
                  });
                }}
                className="admin-button-secondary px-5 py-3 disabled:opacity-60"
              >
                {isPending ? "저장 중..." : "상태 저장"}
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
