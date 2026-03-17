"use client";

import { useState, useTransition } from "react";

import { updateReviewStatus } from "@/lib/client-api";
import type { AdminReview } from "@/lib/contracts";

function formatReviewStatus(status: string) {
  const labels: Record<string, string> = {
    PUBLISHED: "공개",
    HIDDEN: "숨김",
  };

  return labels[status] ?? status;
}

function renderStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AdminReviewManager({
  reviews,
}: {
  reviews: AdminReview[];
}) {
  const [items, setItems] = useState(reviews);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <article className="admin-card rounded-[36px] p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow text-[var(--ink-soft)]">Reviews</p>
          <h2 className="display mt-4 text-3xl font-semibold">리뷰 검수</h2>
        </div>
        <p className="text-sm text-[var(--ink-soft)]">공개/숨김 상태를 바로 전환할 수 있습니다.</p>
      </div>

      <div className="mt-8 space-y-4">
        {items.length > 0 ? (
          items.map((review) => (
            <div
              key={review.id}
              data-review-id={review.id}
              className="grid gap-4 rounded-[28px] border border-[var(--line)] bg-white/72 p-5 xl:grid-cols-[minmax(0,1fr)_220px]"
            >
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-semibold">{review.productName}</p>
                  <span className="rounded-full bg-[rgba(36,93,90,0.12)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
                    {formatReviewStatus(review.status)}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[var(--ink-soft)]">
                  {review.reviewerName} · {review.reviewerEmail}
                </p>
                <p className="mt-2 text-sm font-semibold text-[var(--primary)]">{renderStars(review.rating)}</p>
                <p className="mt-3 text-base font-semibold">{review.title}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{review.content}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  {new Date(review.createdAt).toLocaleString("ko-KR")}
                </p>
              </div>

              <div className="grid gap-3">
                <select
                  value={review.status}
                  onChange={(event) =>
                    setItems((current) =>
                      current.map((item) =>
                        item.id === review.id ? { ...item, status: event.target.value } : item,
                      ),
                    )
                  }
                  className="admin-input px-4 py-3"
                >
                  <option value="PUBLISHED">공개</option>
                  <option value="HIDDEN">숨김</option>
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
                            items.find((item) => item.id === review.id)?.status ?? review.status;
                          const updatedReview = await updateReviewStatus(review.id, {
                            status: nextStatus,
                          });
                          setItems((current) =>
                            current.map((item) => (item.id === updatedReview.id ? updatedReview : item)),
                          );
                          setMessage(`리뷰 ${updatedReview.id} 상태를 저장했습니다.`);
                        } catch (nextError) {
                          setError(getErrorMessage(nextError, "리뷰 상태 저장 중 문제가 발생했습니다."));
                        }
                      })();
                    });
                  }}
                  className="admin-button-secondary px-5 py-3 disabled:opacity-60"
                >
                  상태 저장
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[28px] border border-[var(--line)] bg-white/72 p-6 text-sm leading-7 text-[var(--ink-soft)]">
            아직 등록된 리뷰가 없습니다.
          </div>
        )}
      </div>

      {message ? <p className="mt-5 text-sm text-[var(--teal)]">{message}</p> : null}
      {error ? <p className="mt-5 text-sm text-red-600">{error}</p> : null}
    </article>
  );
}
