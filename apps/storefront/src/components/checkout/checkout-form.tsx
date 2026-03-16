"use client";

import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useState, useTransition } from "react";

import { useAuth } from "@/lib/auth-store";
import { createOrder, previewOrder } from "@/lib/client-api";
import type { CheckoutPreview, PaymentMethod } from "@/lib/contracts";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/currency";
import { formatPaymentMethod } from "@/lib/payment";

const PAYMENT_OPTIONS: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
}> = [
  {
    value: "CARD",
    label: "신용카드",
    description: "즉시 승인되는 모의 결제입니다.",
  },
  {
    value: "BANK_TRANSFER",
    label: "계좌이체",
    description: "입금 확인 전까지 결제 대기 상태로 유지됩니다.",
  },
  {
    value: "VIRTUAL_ACCOUNT",
    label: "가상계좌",
    description: "가상계좌 발급 후 결제 대기 상태를 재현합니다.",
  },
  {
    value: "MOBILE",
    label: "휴대폰 결제",
    description: "실패 시나리오를 검증하기 위한 모의 결제 수단입니다.",
  },
  {
    value: "EASY_PAY",
    label: "간편결제",
    description: "즉시 승인되는 간편결제 흐름입니다.",
  },
];

function makeIdempotencyKey() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replaceAll("-", "");
  }

  return `${Date.now()}${Math.random().toString(16).slice(2)}`;
}

export function CheckoutForm() {
  const router = useRouter();
  const { session } = useAuth();
  const { items, clearCart, hydrated } = useCart();
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [idempotencyKey, setIdempotencyKey] = useState(() => makeIdempotencyKey());
  const [form, setForm] = useState({
    customerName: session.user?.name ?? "",
    phone: "",
    postalCode: "",
    address1: "",
    address2: "",
    note: "",
    paymentMethod: "CARD" as PaymentMethod,
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
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          장바구니에 상품을 담은 뒤 주문서를 작성해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="grid-shell lg:grid-cols-[1.35fr_0.85fr]">
      <section className="surface-card rounded-[28px] p-6 sm:p-8">
        <p className="display-eyebrow">Checkout</p>
        <h1 className="display-heading mt-3 text-3xl font-semibold">주문서 작성</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
          받는 분 정보와 배송지를 입력하고 결제 수단을 선택해 주세요.
        </p>
        <p className="mt-3 text-sm text-[var(--ink-soft)]">
          {session.authenticated
            ? "현재 주문은 로그인한 회원 계정과 연결됩니다."
            : "비회원 주문은 주문번호와 연락처로 다시 조회할 수 있습니다."}
        </p>

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

                if (result.paymentStatus !== "FAILED") {
                  clearCart();
                }

                setIdempotencyKey(makeIdempotencyKey());

                const nextUrl = session.authenticated
                  ? `/orders/${result.orderNumber}`
                  : `/orders/${result.orderNumber}?phone=${encodeURIComponent(form.phone.trim())}`;

                router.push(nextUrl);
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
              className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.9)] px-4 py-3"
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
              className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.9)] px-4 py-3"
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
                className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.9)] px-4 py-3"
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
                className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.9)] px-4 py-3"
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
              className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.9)] px-4 py-3"
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
              className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.9)] px-4 py-3"
            />
          </label>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium text-[var(--ink)]">결제 수단</legend>
            <div className="grid gap-3 md:grid-cols-2">
              {PAYMENT_OPTIONS.map((option) => {
                const selected = form.paymentMethod === option.value;

                return (
                  <label
                    key={option.value}
                    className={`rounded-[24px] border px-4 py-4 transition ${
                      selected
                        ? "border-[var(--ink)] bg-[rgba(255,255,255,0.92)]"
                        : "border-[var(--line)] bg-[rgba(255,255,255,0.72)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={selected}
                      onChange={() =>
                        setForm((current) => ({ ...current, paymentMethod: option.value }))
                      }
                      className="sr-only"
                    />
                    <p className="text-sm font-semibold text-[var(--ink)]">{option.label}</p>
                    <p className="mt-2 text-xs leading-6 text-[var(--ink-soft)]">
                      {option.description}
                    </p>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="button-primary px-5 py-3 disabled:opacity-60"
          >
            {isPending ? "주문을 처리하고 있습니다." : "주문하기"}
          </button>
        </form>
      </section>

      <aside className="surface-card rounded-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,239,233,0.76))] p-6 sm:p-8">
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
            <span>선택한 결제 수단</span>
            <span>{formatPaymentMethod(form.paymentMethod)}</span>
          </div>
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
