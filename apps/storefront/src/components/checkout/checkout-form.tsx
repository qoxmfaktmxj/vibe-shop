"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { useAuth } from "@/lib/auth-store";
import { createOrder, listShippingAddresses, previewOrder } from "@/lib/client-api";
import type { CheckoutPreview, PaymentMethod, ShippingAddress } from "@/lib/contracts";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/currency";
import { formatPaymentMethod } from "@/lib/payment";

const GUEST_CHECKOUT_DRAFT_KEY = "vibe_shop_guest_checkout_draft";
const CHECKOUT_FORM_ID = "checkout-form";

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
    description: "휴대폰 결제 실패 시나리오 검증용입니다.",
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

type CheckoutFormState = {
  customerName: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2: string;
  note: string;
  paymentMethod: PaymentMethod;
};

function createInitialForm(customerName: string): CheckoutFormState {
  return {
    customerName,
    phone: "",
    postalCode: "",
    address1: "",
    address2: "",
    note: "",
    paymentMethod: "CARD",
  };
}

function isAddressFieldEmpty(form: CheckoutFormState) {
  return !form.phone && !form.postalCode && !form.address1 && !form.address2;
}

function applyAddressToForm(current: CheckoutFormState, address: ShippingAddress): CheckoutFormState {
  return {
    ...current,
    customerName: address.recipientName || current.customerName,
    phone: address.phone,
    postalCode: address.postalCode,
    address1: address.address1,
    address2: address.address2,
  };
}

export function CheckoutForm() {
  const router = useRouter();
  const { session } = useAuth();
  const { items, clearCart, hydrated } = useCart();
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [idempotencyKey, setIdempotencyKey] = useState(() => makeIdempotencyKey());
  const [form, setForm] = useState<CheckoutFormState>(() =>
    createInitialForm(session.user?.name ?? ""),
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  useEffect(() => {
    setForm((current) => {
      if (session.authenticated) {
        return {
          ...current,
          customerName: current.customerName || session.user?.name || "",
        };
      }

      return current;
    });
  }, [session.authenticated, session.user?.name]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    const loadCheckoutContext = async () => {
      if (session.authenticated) {
        setLoadingProfile(true);
        try {
          const addresses = await listShippingAddresses();
          if (cancelled) {
            return;
          }

          setSavedAddresses(addresses);
          const preferredAddress = addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
          if (preferredAddress) {
            setSelectedAddressId(preferredAddress.id);
            setForm((current) =>
              isAddressFieldEmpty(current)
                ? applyAddressToForm(
                    {
                      ...current,
                      customerName: current.customerName || session.user?.name || "",
                    },
                    preferredAddress,
                  )
                : current,
            );
          }
        } catch (profileError) {
          if (!cancelled) {
            setError(
              profileError instanceof Error
                ? profileError.message
                : "저장된 배송지를 불러오지 못했습니다.",
            );
          }
        } finally {
          if (!cancelled) {
            setLoadingProfile(false);
          }
        }
        return;
      }

      if (typeof window === "undefined") {
        return;
      }

      try {
        const storedDraft = window.localStorage.getItem(GUEST_CHECKOUT_DRAFT_KEY);
        if (!storedDraft) {
          return;
        }

        const parsedDraft = JSON.parse(storedDraft) as Partial<CheckoutFormState>;
        if (cancelled) {
          return;
        }

        setForm((current) => ({
          ...current,
          customerName: current.customerName || parsedDraft.customerName || current.customerName,
          phone: current.phone || parsedDraft.phone || "",
          postalCode: current.postalCode || parsedDraft.postalCode || "",
          address1: current.address1 || parsedDraft.address1 || "",
          address2: current.address2 || parsedDraft.address2 || "",
          note: current.note || parsedDraft.note || "",
          paymentMethod: parsedDraft.paymentMethod ?? current.paymentMethod,
        }));
      } catch {
        // ignore malformed draft
      }
    };

    void loadCheckoutContext();

    return () => {
      cancelled = true;
    };
  }, [hydrated, session.authenticated, session.user?.id, session.user?.name]);

  useEffect(() => {
    if (!hydrated || session.authenticated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(GUEST_CHECKOUT_DRAFT_KEY, JSON.stringify(form));
  }, [form, hydrated, session.authenticated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;

    const requestPreview = async () => {
      if (items.length === 0) {
        if (!cancelled) {
          setPreview(null);
        }
        return;
      }

      try {
        const nextPreview = await previewOrder(items);
        if (!cancelled) {
          setPreview(nextPreview);
          setError("");
        }
      } catch (previewError) {
        if (!cancelled) {
          setError(
            previewError instanceof Error
              ? previewError.message
              : "주문 금액을 계산하지 못했습니다.",
          );
        }
      }
    };

    void requestPreview();

    return () => {
      cancelled = true;
    };
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
    <div className="pb-28 lg:pb-0">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-start">
        <section className="space-y-6">
          <article className="surface-card rounded-[32px] p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="display-eyebrow">One-Step Checkout</p>
                <h1 className="display-heading mt-3 text-3xl font-semibold sm:text-4xl">
                  모바일 우선 주문서
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
                  연락처, 배송지, 결제 수단을 한 화면에서 바로 마무리합니다.
                </p>
              </div>
              <div className="grid gap-2 text-sm text-[var(--ink-soft)] sm:text-right">
                <p>{itemCount}개 상품</p>
                <p>
                  {session.authenticated
                    ? `${session.user?.name} 회원 주문`
                    : "비회원 주문 · 주문번호+연락처 조회"}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Customer
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                  {session.authenticated ? session.user?.email : "비회원 빠른 주문"}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Delivery
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                  {savedAddresses.length > 0
                    ? `저장 배송지 ${savedAddresses.length}개`
                    : "직접 입력 배송지"}
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] px-4 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Payment
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                  {formatPaymentMethod(form.paymentMethod)}
                </p>
              </div>
            </div>
          </article>

          <form
            id={CHECKOUT_FORM_ID}
            className="grid gap-6"
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
                    if (typeof window !== "undefined") {
                      window.localStorage.removeItem(GUEST_CHECKOUT_DRAFT_KEY);
                    }
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
            <article className="surface-card rounded-[32px] p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="display-eyebrow">Contact</p>
                  <h2 className="display-heading mt-3 text-2xl font-semibold">받는 분 정보</h2>
                </div>
                {session.authenticated ? (
                  <Link href="/account" className="text-sm font-medium text-[var(--primary)]">
                    계정 보기
                  </Link>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">받는 분</span>
                  <input
                    required
                    value={form.customerName}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, customerName: event.target.value }))
                    }
                    className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.92)] px-4 py-3"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium">연락처</span>
                  <input
                    required
                    inputMode="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.92)] px-4 py-3"
                  />
                </label>
              </div>

              {session.authenticated ? (
                <div className="mt-5 rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] px-4 py-4 text-sm leading-7 text-[var(--ink-soft)]">
                  회원 주문은 <span className="font-semibold text-[var(--ink)]">{session.user?.email}</span>
                  계정과 연결됩니다.
                </div>
              ) : (
                <div className="mt-5 rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] px-4 py-4 text-sm leading-7 text-[var(--ink-soft)]">
                  비회원 주문은 입력한 연락처 기준으로 다시 조회할 수 있습니다. 최근 입력 정보는 이 기기에서만 임시 저장됩니다.
                </div>
              )}
            </article>

            <article className="surface-card rounded-[32px] p-6 sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="display-eyebrow">Delivery</p>
                  <h2 className="display-heading mt-3 text-2xl font-semibold">배송지 입력</h2>
                </div>
                {loadingProfile ? (
                  <p className="text-sm text-[var(--ink-soft)]">저장 배송지를 불러오는 중입니다.</p>
                ) : null}
              </div>

              {savedAddresses.length > 0 ? (
                <div className="mt-6 flex gap-3 overflow-x-auto pb-2">
                  {savedAddresses.map((address) => {
                    const selected = selectedAddressId === address.id;
                    return (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => {
                          setSelectedAddressId(address.id);
                          setForm((current) => applyAddressToForm(current, address));
                        }}
                        className={`min-w-[15rem] rounded-[24px] border px-4 py-4 text-left transition ${
                          selected
                            ? "border-[var(--primary)] bg-[rgba(214,81,45,0.08)]"
                            : "border-[var(--line)] bg-[rgba(255,255,255,0.76)]"
                        }`}
                      >
                        <p className="text-sm font-semibold text-[var(--ink)]">
                          {address.label}
                          {address.isDefault ? " · 기본" : ""}
                        </p>
                        <p className="mt-2 text-sm text-[var(--ink-soft)]">{address.recipientName}</p>
                        <p className="mt-1 text-xs leading-6 text-[var(--ink-soft)]">
                          {address.address1} {address.address2}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 sm:grid-cols-[0.42fr_1fr]">
                <label className="grid gap-2">
                  <span className="text-sm font-medium">우편번호</span>
                  <input
                    required
                    value={form.postalCode}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, postalCode: event.target.value }))
                    }
                    className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.92)] px-4 py-3"
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
                    className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.92)] px-4 py-3"
                  />
                </label>
              </div>

              <label className="mt-4 grid gap-2">
                <span className="text-sm font-medium">상세 주소</span>
                <input
                  value={form.address2}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, address2: event.target.value }))
                  }
                  className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.92)] px-4 py-3"
                />
              </label>

              <label className="mt-4 grid gap-2">
                <span className="text-sm font-medium">배송 메모</span>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, note: event.target.value }))
                  }
                  className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.92)] px-4 py-3"
                />
              </label>
            </article>

            <article className="surface-card rounded-[32px] p-6 sm:p-8">
              <div>
                <p className="display-eyebrow">Payment</p>
                <h2 className="display-heading mt-3 text-2xl font-semibold">결제 수단 선택</h2>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
            </article>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
          </form>
        </section>

        <aside className="surface-card rounded-[32px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(241,239,233,0.86))] p-6 sm:p-8 lg:sticky lg:top-28">
          <p className="display-eyebrow">Order Summary</p>
          <h2 className="display-heading mt-3 text-2xl font-semibold">최종 확인</h2>
          <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
            입력한 정보는 이 화면에서 바로 검토하고 결제까지 한 번에 진행됩니다.
          </p>

          <div className="mt-6 space-y-3 text-sm">
            {items.map((item) => (
              <div key={item.productId} className="flex items-start justify-between gap-4 rounded-[20px] bg-white/72 px-4 py-3">
                <div>
                  <p className="font-semibold text-[var(--ink)]">{item.name}</p>
                  <p className="mt-1 text-[var(--ink-soft)]">수량 {item.quantity}</p>
                </div>
                <span className="font-medium text-[var(--ink)]">
                  {formatPrice(item.price * item.quantity)}원
                </span>
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

          <button
            type="submit"
            form={CHECKOUT_FORM_ID}
            disabled={isPending}
            className="button-primary mt-8 hidden w-full px-5 py-4 disabled:opacity-60 lg:inline-flex lg:justify-center"
          >
            {isPending ? "주문을 처리하고 있습니다." : "주문하기"}
          </button>

          <div className="mt-4 rounded-[24px] bg-[var(--surface-low)] p-4 text-[11px] leading-6 text-[var(--ink-soft)]">
            총 결제 금액은 장바구니 기준으로 다시 계산되며, 회원 배송지는 자동 입력 후 수정할 수 있습니다.
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-4 bottom-4 z-40 lg:hidden">
        <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.96)] p-4 shadow-[0_24px_60px_rgba(12,16,24,0.18)] backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Total
              </p>
              <p className="mt-1 text-xl font-semibold text-[var(--ink)]">
                {formatPrice(preview?.total ?? 0)}원
              </p>
            </div>
            <button
              type="submit"
              form={CHECKOUT_FORM_ID}
              disabled={isPending}
              className="button-primary min-w-[10rem] px-5 py-4 disabled:opacity-60"
            >
              {isPending ? "처리 중" : "바로 주문"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
