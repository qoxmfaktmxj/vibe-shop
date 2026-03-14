"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState, useTransition } from "react";

import { createOrder, previewOrder } from "@/lib/client-api";
import type { CheckoutPreview } from "@/lib/contracts";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/currency";

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replaceAll("-", "");
  }

  return `${Date.now()}${Math.random().toString(16).slice(2)}`;
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, clearCart, hydrated } = useCart();
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [idempotencyKey, setIdempotencyKey] = useState(() => makeIdempotencyKey());
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    postalCode: "",
    address1: "",
    address2: "",
    note: "",
  });

  const requestPreview = useEffectEvent(async () => {
    if (items.length === 0) {
      setPreview(null);
      return;
    }

    try {
      const nextPreview = await previewOrder(items);
      setPreview(nextPreview);
      setError("");
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "주문 금액을 계산하지 못했습니다.",
      );
    }
  });

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    void requestPreview();
  }, [hydrated, items]);

  if (hydrated && items.length === 0) {
    return (
      <div className="surface-card rounded-[28px] p-8 text-center">
        <p className="display-heading text-3xl font-semibold">주문할 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid-shell lg:grid-cols-[1.35fr_0.85fr]">
      <section className="surface-card rounded-[28px] p-6 sm:p-8">
        <p className="display-eyebrow">Checkout</p>
        <h1 className="display-heading mt-3 text-3xl font-semibold">주문서 작성</h1>

        <form
          className="mt-8 grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              try {
                const result = await createOrder({
                  idempotencyKey,
                  ...form,
                  items: items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                  })),
                });
                clearCart();
                setIdempotencyKey(makeIdempotencyKey());
                router.push(`/orders/${result.orderNumber}`);
              } catch (submitError) {
                setError(
                  submitError instanceof Error
                    ? submitError.message
                    : "주문 생성에 실패했습니다.",
                );
              }
            });
          }}
        >
          <label className="grid gap-2">
            <span className="text-sm font-medium">받는 분</span>
            <input
              required
              value={form.customerName}
              onChange={(event) =>
                setForm((current) => ({ ...current, customerName: event.target.value }))
              }
              className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,243,0.92)] px-4 py-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">연락처</span>
            <input
              required
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
              className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,243,0.92)] px-4 py-3"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-[0.45fr_1fr]">
            <label className="grid gap-2">
              <span className="text-sm font-medium">우편번호</span>
              <input
                required
                value={form.postalCode}
                onChange={(event) =>
                  setForm((current) => ({ ...current, postalCode: event.target.value }))
                }
                className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,243,0.92)] px-4 py-3"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium">기본 주소</span>
              <input
                required
                value={form.address1}
                onChange={(event) =>
                  setForm((current) => ({ ...current, address1: event.target.value }))
                }
                className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,243,0.92)] px-4 py-3"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-medium">상세 주소</span>
            <input
              value={form.address2}
              onChange={(event) =>
                setForm((current) => ({ ...current, address2: event.target.value }))
              }
              className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,243,0.92)] px-4 py-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">배송 메모</span>
            <textarea
              rows={4}
              value={form.note}
              onChange={(event) =>
                setForm((current) => ({ ...current, note: event.target.value }))
              }
              className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,243,0.92)] px-4 py-3"
            />
          </label>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="button-hot px-5 py-3 disabled:opacity-60"
          >
            {isPending ? "주문 생성 중..." : "주문 완료하기"}
          </button>
        </form>
      </section>

      <aside className="surface-card rounded-[28px] border-[rgba(41,51,155,0.14)] bg-[linear-gradient(180deg,rgba(41,51,155,0.06),rgba(255,255,243,0.88))] p-6 sm:p-8">
        <p className="display-eyebrow">Order Summary</p>
        <h2 className="display-heading mt-3 text-2xl font-semibold">최종 확인</h2>
        <div className="mt-6 space-y-3 text-sm">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between gap-4">
              <span className="text-[var(--ink-soft)]">
                {item.name} x {item.quantity}
              </span>
              <span>{formatPrice(item.price * item.quantity)}원</span>
            </div>
          ))}
        </div>
        <div className="stat-divider mt-6 space-y-3 pt-5 text-sm">
          <div className="flex justify-between">
            <span>상품 합계</span>
            <span>{formatPrice(preview?.subtotal ?? 0)}원</span>
          </div>
          <div className="flex justify-between">
            <span>배송비</span>
            <span>{formatPrice(preview?.shippingFee ?? 0)}원</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>총 결제 금액</span>
            <span>{formatPrice(preview?.total ?? 0)}원</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
