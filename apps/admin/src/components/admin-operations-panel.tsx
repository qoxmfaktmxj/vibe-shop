"use client";

import { useState, useTransition } from "react";

import { getOperations } from "@/lib/client-api";
import type { AdminOperations } from "@/lib/contracts";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}

function riskTone(riskLevel: string) {
  switch (riskLevel) {
    case "HIGH":
      return "text-red-600";
    case "MEDIUM":
      return "text-amber-600";
    default:
      return "text-[var(--ink-soft)]";
  }
}

export function AdminOperationsPanel({ initialOperations }: { initialOperations: AdminOperations }) {
  const [operations, setOperations] = useState(initialOperations);
  const [filters, setFilters] = useState({
    lowStockThreshold: initialOperations.summary.lowStockThreshold,
    lowRatingThreshold: initialOperations.summary.lowRatingThreshold,
    suspiciousScoreThreshold: initialOperations.summary.suspiciousScoreThreshold,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <article className="admin-card rounded-[36px] p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-[var(--ink-soft)]">Operations Assistant</p>
          <h2 className="display mt-4 text-3xl font-semibold">운영 보조 대시보드</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--ink-soft)]">
            저재고, 이상 주문, 최근 트렌드, 저평점 리뷰를 요청 시점 집계로 묶어 우선 확인 대상을 보여줍니다.
          </p>
        </div>

        <form
          className="grid gap-3 sm:grid-cols-3"
          onSubmit={(event) => {
            event.preventDefault();
            setMessage("");
            setError("");
            startTransition(() => {
              void (async () => {
                try {
                  const nextOperations = await getOperations(filters);
                  setOperations(nextOperations);
                  setMessage("운영 임계값 기준으로 보조 대시보드를 새로 계산했습니다.");
                } catch (refreshError) {
                  setError(
                    refreshError instanceof Error
                      ? refreshError.message
                      : "운영 보조 데이터를 새로 불러오지 못했습니다.",
                  );
                }
              })();
            });
          }}
        >
          <label className="grid gap-2">
            <span className="text-xs font-medium text-[var(--ink-soft)]">저재고 기준</span>
            <input
              type="number"
              min={1}
              max={50}
              value={filters.lowStockThreshold}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  lowStockThreshold: Number(event.target.value) || 1,
                }))
              }
              className="admin-input px-4 py-3"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-medium text-[var(--ink-soft)]">저평점 기준</span>
            <input
              type="number"
              min={1}
              max={5}
              value={filters.lowRatingThreshold}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  lowRatingThreshold: Number(event.target.value) || 1,
                }))
              }
              className="admin-input px-4 py-3"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-medium text-[var(--ink-soft)]">이상 주문 점수</span>
            <input
              type="number"
              min={1}
              max={10}
              value={filters.suspiciousScoreThreshold}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  suspiciousScoreThreshold: Number(event.target.value) || 1,
                }))
              }
              className="admin-input px-4 py-3"
            />
          </label>
          <button type="submit" disabled={isPending} className="admin-button sm:col-span-3 px-6 py-4 disabled:opacity-60">
            {isPending ? "다시 계산하는 중" : "운영 임계값 다시 계산"}
          </button>
        </form>
      </div>

      {message ? <p className="mt-4 text-sm text-[var(--teal)]">{message}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[28px] border border-[var(--line)] bg-white/70 p-5">
          <p className="eyebrow text-[var(--ink-soft)]">Low Stock</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--ink)]">{operations.summary.lowStockCount}</p>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">재고 {operations.summary.lowStockThreshold}개 이하</p>
        </article>
        <article className="rounded-[28px] border border-[var(--line)] bg-white/70 p-5">
          <p className="eyebrow text-[var(--ink-soft)]">Suspicious Orders</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--ink)]">{operations.summary.suspiciousOrderCount}</p>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">점수 {operations.summary.suspiciousScoreThreshold} 이상</p>
        </article>
        <article className="rounded-[28px] border border-[var(--line)] bg-white/70 p-5">
          <p className="eyebrow text-[var(--ink-soft)]">Trending Products</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--ink)]">{operations.summary.trendingProductCount}</p>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">최근 조회·주문·위시리스트 반응</p>
        </article>
        <article className="rounded-[28px] border border-[var(--line)] bg-white/70 p-5">
          <p className="eyebrow text-[var(--ink-soft)]">Review Watch</p>
          <p className="mt-3 text-3xl font-semibold text-[var(--ink)]">{operations.summary.lowRatingReviewCount}</p>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">평점 {operations.summary.lowRatingThreshold}점 이하 · 출고 대기 {operations.summary.fulfillmentAttentionCount}건</p>
        </article>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-[var(--line)] bg-white/72 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="eyebrow text-[var(--ink-soft)]">Low Stock Queue</p>
              <h3 className="mt-3 text-2xl font-semibold text-[var(--ink)]">저재고 상품</h3>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {operations.lowStockProducts.map((product) => (
              <article key={product.productId} className="rounded-[22px] border border-[var(--line)] bg-white/80 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{product.productName}</p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">
                      {product.categoryName} · 인기점수 {product.popularityScore}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-red-600">재고 {product.stock}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--line)] bg-white/72 p-6">
          <p className="eyebrow text-[var(--ink-soft)]">Suspicious Orders</p>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--ink)]">이상 징후 주문</h3>
          <div className="mt-6 space-y-3">
            {operations.suspiciousOrders.map((order) => (
              <article key={order.orderNumber} className="rounded-[22px] border border-[var(--line)] bg-white/80 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">
                      {order.customerName} · {order.phone} · {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <p className={`text-sm font-semibold ${riskTone(order.riskLevel)}`}>
                    {order.riskLevel} · {order.riskScore}점
                  </p>
                </div>
                <p className="mt-3 text-sm text-[var(--ink)]">{formatPrice(order.total)}원 · {order.itemCount}개 상품</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--ink-soft)]">
                  {order.reasons.map((reason) => (
                    <li key={`${order.orderNumber}-${reason}`}>{reason}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--line)] bg-white/72 p-6">
          <p className="eyebrow text-[var(--ink-soft)]">Trending Products</p>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--ink)]">최근 반응 상품</h3>
          <div className="mt-6 space-y-3">
            {operations.trendingProducts.map((product) => (
              <article key={product.productId} className="rounded-[22px] border border-[var(--line)] bg-white/80 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{product.productName}</p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">{product.categoryName}</p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--primary)]">점수 {product.trendScore}</p>
                </div>
                <p className="mt-3 text-sm text-[var(--ink-soft)]">
                  조회 {product.recentViewCount} · 결제완료 수량 {product.paidOrderQuantity} · 위시리스트 {product.wishlistCount} · 재고 {product.stock}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[var(--line)] bg-white/72 p-6">
          <p className="eyebrow text-[var(--ink-soft)]">Review Watch</p>
          <h3 className="mt-3 text-2xl font-semibold text-[var(--ink)]">저평점 리뷰 확인</h3>
          <div className="mt-6 space-y-3">
            {operations.lowRatingReviews.map((review) => (
              <article key={review.reviewId} className="rounded-[22px] border border-[var(--line)] bg-white/80 px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-[var(--ink)]">{review.productName}</p>
                    <p className="mt-1 text-sm text-[var(--ink-soft)]">
                      {review.reviewerName} · {formatDateTime(review.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-amber-600">{review.rating}점</p>
                </div>
                <p className="mt-3 text-sm text-[var(--ink)]">{review.title}</p>
                <p className="mt-2 text-xs text-[var(--ink-soft)]">
                  {review.status} · 도움수 {review.helpfulCount} · {review.buyerReview ? "구매자 리뷰" : "일반 리뷰"}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
