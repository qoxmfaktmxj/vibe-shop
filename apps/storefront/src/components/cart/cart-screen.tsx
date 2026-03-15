"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";

import { previewOrder } from "@/lib/client-api";
import type { CheckoutPreview } from "@/lib/contracts";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/currency";

export function CartScreen() {
  const { items, hydrated, removeItem, updateQuantity } = useCart();
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestPreview = useEffectEvent(async () => {
    if (items.length === 0) {
      setPreview(null);
      setError("");
      return;
    }

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    void requestPreview();
  }, [hydrated, items]);

  if (!hydrated) {
    return <div className="surface-card rounded-[28px] p-8">장바구니를 불러오는 중입니다.</div>;
  }

  if (items.length === 0) {
    return (
      <div className="surface-card rounded-[28px] p-8 text-center">
        <p className="display-eyebrow">Cart</p>
        <h1 className="display-heading mt-3 text-3xl font-semibold">장바구니가 비어 있습니다.</h1>
        <p className="mt-3 text-[var(--ink-soft)]">
          마음에 드는 상품을 담으면 이곳에서 한눈에 확인할 수 있습니다.
        </p>
        <Link
          href="/"
          className="button-primary mt-6 px-5 py-3"
        >
          메인으로 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid-shell lg:grid-cols-[1.6fr_0.9fr]">
      <section className="surface-card rounded-[28px] p-6 sm:p-8">
        <p className="display-eyebrow">Cart</p>
        <h1 className="display-heading mt-3 text-3xl font-semibold">장바구니</h1>
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <article
              key={item.productId}
              className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <p className="display-heading text-2xl font-semibold">{item.name}</p>
                  <p className="text-sm text-[var(--ink-soft)]">
                    개당 {formatPrice(item.price)}원
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="h-10 w-10 rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.88)]"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="h-10 w-10 rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.88)]"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="button-secondary px-4 py-2 font-medium text-[var(--ink-soft)]"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="surface-card rounded-[28px] p-6 sm:p-8">
        <p className="display-eyebrow">Summary</p>
        <h2 className="display-heading mt-3 text-2xl font-semibold">결제 예정 금액</h2>
        <div className="mt-8 space-y-4 text-sm">
          <div className="flex justify-between">
            <span>상품 금액</span>
            <span>{formatPrice(preview?.subtotal ?? 0)}원</span>
          </div>
          <div className="flex justify-between">
            <span>배송비</span>
            <span>{formatPrice(preview?.shippingFee ?? 0)}원</span>
          </div>
          <div className="stat-divider flex justify-between pt-4 text-base font-semibold">
            <span>총 결제 금액</span>
            <span>{formatPrice(preview?.total ?? 0)}원</span>
          </div>
        </div>

        {loading ? <p className="mt-4 text-sm text-[var(--ink-soft)]">금액을 계산하고 있습니다.</p> : null}
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        <Link
          href="/checkout"
          className="button-primary mt-8 w-full px-5 py-3"
        >
          주문서 작성
        </Link>
      </aside>
    </div>
  );
}
