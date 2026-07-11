"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { RecommendationShelf } from "@/components/recommendation/recommendation-shelf";
import { getCartRecommendations, previewOrder } from "@/lib/client-api";
import type { CheckoutPreview, RecommendationCollection } from "@/lib/contracts";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/currency";

export function CartScreen() {
  const {
    items,
    hydrated,
    mutating,
    mutationError,
    removeItem,
    updateQuantity,
  } = useCart();
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationCollection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    let cancelled = false;
    if (items.length === 0) {
      void Promise.resolve().then(() => {
        if (!cancelled) {
          setPreview(null);
          setRecommendations(null);
          setError("");
        }
      });
      return () => {
        cancelled = true;
      };
    }

    void Promise.resolve().then(() => {
      if (!cancelled) {
        setPreview(null);
        setRecommendations(null);
        setError("");
        setLoading(true);
      }
    });
    void previewOrder(items)
      .then((nextPreview) => {
        if (!cancelled) {
          setPreview(nextPreview);
        }
      })
      .catch((previewError) => {
        if (!cancelled) {
          setError(
            previewError instanceof Error
              ? previewError.message
              : "주문 예상 금액을 계산하지 못했습니다.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    void getCartRecommendations()
      .then((nextRecommendations) => {
        if (!cancelled) {
          setRecommendations(nextRecommendations);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRecommendations(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, items]);

  const canCheckout = preview !== null && !loading && !error;

  if (!hydrated) {
    return <div className="border-y border-[var(--line)] py-14 text-center text-sm text-[var(--ink-soft)]">장바구니를 불러오는 중입니다.</div>;
  }

  if (items.length === 0) {
    return (
      <div className="border-y border-[var(--line)] py-16 text-center sm:py-20">
        <p className="display-eyebrow">장바구니</p>
        <h1 className="display-heading mt-4 text-4xl text-[var(--ink)]">아직 담긴 상품이 없습니다.</h1>
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
    <div className="space-y-10 pb-28 sm:space-y-12 lg:pb-0">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-14">
        <section className="min-w-0">
          <header className="mb-8 sm:mb-10">
            <p className="display-eyebrow">장바구니</p>
            <h1 className="display-heading mt-4 text-4xl tracking-tight text-[var(--ink)] sm:text-5xl">
              이어 담은 상품
            </h1>
            <p className="mt-2 text-[11px] font-semibold tracking-[0.2em] text-[var(--ink-soft)]">
              총 {items.length}개 상품을 확인하고 바로 주문으로 이어갈 수 있습니다.
            </p>
          </header>

          <div className="space-y-8 sm:space-y-10">
            {mutationError ? (
              <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {mutationError}
              </p>
            ) : null}
            {items.map((item) => (
              <article
                key={item.productId}
                className="grid gap-5 border-b border-[var(--line)] pb-8 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6 sm:pb-10"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-low)]">
                  <Image src={item.imageUrl} alt={item.imageAlt} fill sizes="10rem" className="object-cover" />
                </div>

                <div className="flex min-w-0 flex-col">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="display-heading text-2xl text-[var(--ink)]">{item.name}</h2>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
                        담아 둔 상품의 수량과 예상 결제 금액을 바로 확인할 수 있습니다.
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-[var(--ink)]">{formatPrice(item.price)}원</p>
                  </div>

                  <div className="mt-6 flex flex-col items-start gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 border border-[var(--line)] bg-[var(--surface)] px-1 py-1">
                      <button
                        type="button"
                        onClick={() => void updateQuantity(item.productId, item.quantity - 1)}
                        disabled={mutating}
                        aria-label={`${item.name} 수량 감소`}
                        className="inline-flex h-11 w-11 items-center justify-center text-[var(--ink-soft)] transition hover:bg-[var(--surface-low)] hover:text-[var(--ink)] disabled:cursor-wait disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => void updateQuantity(item.productId, item.quantity + 1)}
                        disabled={mutating}
                        aria-label={`${item.name} 수량 증가`}
                        className="inline-flex h-11 w-11 items-center justify-center text-[var(--ink-soft)] transition hover:bg-[var(--surface-low)] hover:text-[var(--ink)] disabled:cursor-wait disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => void removeItem(item.productId)}
                      disabled={mutating}
                      className="text-sm font-medium text-[var(--ink-soft)] transition hover:text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 sm:mt-10">
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-sm font-medium text-[var(--primary)] transition hover:gap-4"
            >
              <span aria-hidden="true">←</span>
              쇼핑 계속하기
            </Link>
          </div>
        </section>

        <aside className="border-y border-[var(--line)] bg-[var(--surface-low)] p-6 lg:sticky lg:top-44">
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
                <p className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
                  {formatPrice(preview?.total ?? 0)}원
                </p>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.18em] text-[var(--ink-soft)]">
                  부가세 포함
                </p>
              </div>
            </div>
          </div>

          {loading ? <p className="mt-4 text-sm text-[var(--ink-soft)]">금액을 계산하는 중입니다.</p> : null}
          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          {canCheckout ? (
            <Link href="/checkout" className="button-primary mt-8 w-full px-5 py-5">
              주문서로 이동
            </Link>
          ) : (
            <span aria-disabled="true" className="button-primary mt-8 w-full cursor-not-allowed px-5 py-5 opacity-50">
              금액 확인 후 이동
            </span>
          )}

          <div className="mt-4 border-t border-[var(--line)] pt-4 text-[11px] leading-6 text-[var(--ink-soft)]">
            배송비는 총액과 현재 장바구니 기준으로 즉시 다시 계산됩니다.
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-4 bottom-[max(16px,env(safe-area-inset-bottom))] z-40 lg:hidden">
        <div className="border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[var(--ink-soft)]">총 결제 금액</p>
              <p className="mt-1 text-xl font-semibold text-[var(--ink)]">{formatPrice(preview?.total ?? 0)}원</p>
            </div>
            {canCheckout ? (
              <Link href="/checkout" className="button-primary w-full min-w-0 px-5 py-4 sm:w-auto sm:min-w-[10rem]">
                주문서로 이동
              </Link>
            ) : (
              <span aria-disabled="true" className="button-primary w-full min-w-0 cursor-not-allowed px-5 py-4 opacity-50 sm:w-auto sm:min-w-[10rem]">
                금액 확인 중
              </span>
            )}
          </div>
        </div>
      </div>

      {recommendations ? <RecommendationShelf collection={recommendations} eyebrow="장바구니 기반 추천" /> : null}
    </div>
  );
}
