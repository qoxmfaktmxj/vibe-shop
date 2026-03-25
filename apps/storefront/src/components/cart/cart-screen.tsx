"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useEffectEvent, useState } from "react";

import { RecommendationShelf } from "@/components/recommendation/recommendation-shelf";
import { getCartRecommendations, previewOrder } from "@/lib/client-api";
import type { CheckoutPreview, RecommendationCollection } from "@/lib/contracts";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/currency";

export function CartScreen() {
  const { items, hydrated, removeItem, updateQuantity } = useCart();
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestPreview = useEffectEvent(async () => {
    if (items.length === 0) {
      setPreview(null);
      setRecommendations(null);
      setError("");
      return;
    }

    setLoading(true);
    try {
      const [nextPreview, nextRecommendations] = await Promise.all([
        previewOrder(items),
        getCartRecommendations(),
      ]);
      setPreview(nextPreview);
      setRecommendations(nextRecommendations);
      setError("");
    } catch (previewError) {
      setError(
        previewError instanceof Error ? previewError.message : "주문 예상 금액을 계산하지 못했습니다.",
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
    return <div className="surface-card rounded-xl p-8">장바구니를 불러오는 중입니다.</div>;
  }

  if (items.length === 0) {
    return (
      <div className="surface-card rounded-xl p-10 text-center">
        <p className="display-eyebrow">장바구니</p>
        <h1 className="display-heading mt-4 text-4xl text-[var(--ink)]">
          아직 담긴 상품이 없습니다.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
          홈과 카테고리에서 분위기에 맞는 상품을 둘러보고, 마음에 드는 상품을 천천히 담아보세요.
        </p>
        <Link href="/" className="button-primary mt-8 px-6 py-4">
          쇼핑 계속하기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
        <section className="min-w-0">
          <header className="mb-10">
            <p className="display-eyebrow">장바구니</p>
            <h1 className="display-heading mt-4 text-4xl font-light tracking-tight text-[var(--ink)]">
              이어 담은 상품
            </h1>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              {items.length} items in your atelier
            </p>
          </header>

          <div className="space-y-10">
            {items.map((item) => (
              <article
                key={item.productId}
                className="grid gap-6 border-b border-black/6 pb-10 sm:grid-cols-[10rem_minmax(0,1fr)]"
              >
                <div className="relative aspect-[4/5] overflow-hidden rounded-xl">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="10rem"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,14,22,0.35)] to-transparent" />
                  <div className="absolute inset-x-0 top-0 p-4">
                    <span className="rounded-lg bg-white/82 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                      Curated Item
                    </span>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="display-heading text-2xl text-[var(--ink)]">{item.name}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
                        담아 둔 상품의 수량과 예상 결제 금액을 바로 확인할 수 있습니다.
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-[var(--primary)]">{formatPrice(item.price)}원</p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-card)] px-2 py-2 shadow-[var(--shadow-soft)]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--ink-soft)] transition hover:bg-[var(--surface-low)] hover:text-[var(--ink)]"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--ink-soft)] transition hover:bg-[var(--surface-low)] hover:text-[var(--ink)]"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)] transition hover:text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm font-medium text-[var(--primary)] transition hover:gap-4"
            >
              <span aria-hidden="true">←</span>
              쇼핑 계속하기
            </Link>
          </div>
        </section>

        <aside className="surface-card editorial-shadow rounded-none p-8 lg:sticky lg:top-32">
          <p className="display-eyebrow">결제 요약</p>
          <h2 className="display-heading mt-4 text-3xl font-light text-[var(--ink)]">주문 요약</h2>
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)]">상품 금액</span>
              <span className="font-medium text-[var(--ink)]">{formatPrice(preview?.subtotal ?? 0)}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)]">배송비</span>
              <span className="font-medium text-[var(--ink)]">{formatPrice(preview?.shippingFee ?? 0)}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--ink-soft)]">예상 할인</span>
              <span className="font-medium text-[var(--ink)]">0원</span>
            </div>
            <div className="stat-divider flex items-end justify-between pt-5">
              <span className="text-lg font-medium text-[var(--ink)]">총 결제 금액</span>
              <div className="text-right">
                <p className="text-3xl font-bold tracking-tight text-[var(--primary)]">
                  {formatPrice(preview?.total ?? 0)}원
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  VAT incl.
                </p>
              </div>
            </div>
          </div>

          {loading ? <p className="mt-4 text-sm text-[var(--ink-soft)]">금액을 계산하는 중입니다.</p> : null}
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <Link href="/checkout" className="button-hot mt-8 w-full px-5 py-5">
            주문서로 이동
          </Link>

          <div className="mt-4 rounded-lg bg-[var(--surface-low)] p-4 text-[11px] leading-6 text-[var(--ink-soft)]">
            배송비는 총액과 현재 장바구니 기준으로 즉시 다시 계산됩니다.
          </div>
        </aside>
      </div>

      {recommendations ? <RecommendationShelf collection={recommendations} eyebrow="장바구니 기반 추천" /> : null}
    </div>
  );
}
