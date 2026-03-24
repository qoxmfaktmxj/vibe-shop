"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { RatingStars } from "@/components/engagement/rating-stars";
import { ReviewComposer } from "@/components/engagement/review-composer";
import { listProductReviews, markReviewHelpful, unmarkReviewHelpful } from "@/lib/client-api";
import type { ProductReview, ReviewSummary } from "@/lib/contracts";
import { useAuth } from "@/lib/auth-store";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR");
}

function satisfactionLabel(value: number | null) {
  if (value == null) {
    return "미응답";
  }
  return `${value.toFixed(1)} / 5`;
}

export function ProductReviewSection({
  productId,
  initialSummary,
  initialReviews,
  initialCanWriteReview,
  initialHasReviewed,
}: {
  productId: number;
  initialSummary: ReviewSummary;
  initialReviews: ProductReview[];
  initialCanWriteReview: boolean;
  initialHasReviewed: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useAuth();
  const [summary, setSummary] = useState(initialSummary);
  const [reviews, setReviews] = useState(initialReviews);
  const [canWriteReview, setCanWriteReview] = useState(initialCanWriteReview);
  const [hasReviewed, setHasReviewed] = useState(initialHasReviewed);
  const [sort, setSort] = useState("newest");
  const [rating, setRating] = useState<number | null>(null);
  const [photoOnly, setPhotoOnly] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();

  const photoGallery = useMemo(
    () =>
      reviews
        .flatMap((review) => review.images.map((image) => ({ image, review })))
        .slice(0, 8),
    [reviews],
  );

  function loadReviews(next: {
    sort?: string;
    rating?: number | null;
    photoOnly?: boolean;
  }) {
    const nextSort = next.sort ?? sort;
    const nextRating = next.rating === undefined ? rating : next.rating;
    const nextPhotoOnly = next.photoOnly ?? photoOnly;

    setSort(nextSort);
    setRating(nextRating);
    setPhotoOnly(nextPhotoOnly);
    setError("");
    setActionMessage("");

    startTransition(() => {
      void (async () => {
        try {
          const response = await listProductReviews(productId, {
            sort: nextSort,
            rating: typeof nextRating === "number" ? nextRating : undefined,
            photoOnly: nextPhotoOnly,
          });
          setSummary(response.summary);
          setReviews(response.reviews);
          setCanWriteReview(response.canWriteReview);
          setHasReviewed(response.hasReviewed);
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "리뷰를 불러오지 못했습니다.");
        }
      })();
    });
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <article className="surface-card rounded-none p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="display-eyebrow">리뷰</p>
            <h2 className="display-heading mt-3 text-3xl">구매자 리뷰</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              사진 리뷰, 별점 분포, 도움이 돼요 순 정렬까지 한 번에 확인할 수 있습니다.
            </p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] px-5 py-4 text-right">
            <div className="flex items-center justify-end gap-3">
              <RatingStars rating={summary.averageRating || 0} />
              <span className="text-3xl font-semibold text-[var(--ink)]">
                {summary.averageRating.toFixed(1)}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">리뷰 {summary.reviewCount}개</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-sm border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-[20px] bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">Photo</p>
                <p className="mt-2 text-2xl font-semibold">{summary.photoReviewCount}</p>
              </div>
              <div className="rounded-[20px] bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">Buyer</p>
                <p className="mt-2 text-2xl font-semibold">{summary.buyerReviewCount}</p>
              </div>
              <div className="rounded-[20px] bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">Repurchase</p>
                <p className="mt-2 text-2xl font-semibold">{summary.repurchaseRatio.toFixed(1)}%</p>
              </div>
              <div className="rounded-[20px] bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">Delivery</p>
                <p className="mt-2 text-lg font-semibold">
                  {satisfactionLabel(summary.deliverySatisfactionAverage)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[20px] bg-white/80 p-4 text-sm text-[var(--ink-soft)]">
              포장 만족도 <span className="ml-2 font-semibold text-[var(--ink)]">{satisfactionLabel(summary.packagingSatisfactionAverage)}</span>
            </div>
          </section>

          <section className="rounded-sm border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
            <p className="text-sm font-semibold">별점 분포</p>
            <div className="mt-4 space-y-3">
              {summary.ratingDistribution.map((item) => (
                <div key={item.rating} className="grid grid-cols-[42px_1fr_56px] items-center gap-3 text-sm">
                  <span className="font-semibold">{item.rating}점</span>
                  <div className="h-2 overflow-hidden rounded-full bg-[rgba(15,23,42,0.08)]">
                    <div
                      className="h-full rounded-full bg-[var(--primary)]"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-right text-[var(--ink-soft)]">{item.count}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 rounded-sm border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">포토 리뷰</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">실사용 이미지를 빠르게 살펴보세요.</p>
            </div>
            <button
              type="button"
              onClick={() => loadReviews({ photoOnly: !photoOnly })}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                photoOnly
                  ? "bg-[var(--primary)] text-white"
                  : "border border-[var(--line)] bg-white/80 text-[var(--ink)]"
              }`}
            >
              사진 리뷰
            </button>
          </div>

          {photoGallery.length > 0 ? (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photoGallery.map(({ image, review }) => (
                <div key={image.id} className="overflow-hidden rounded-[20px] border border-[var(--line)] bg-white/80">
                  <div className="aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.imageUrl}
                      alt={`${review.title} 리뷰 이미지`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="px-3 py-2 text-xs text-[var(--ink-soft)]">{review.reviewerName}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[20px] border border-dashed border-[var(--line)] px-4 py-5 text-sm text-[var(--ink-soft)]">
              현재 선택된 조건에서 사진 리뷰가 없습니다.
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-3 rounded-sm border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { value: null, label: "전체" },
                { value: 5, label: "5점" },
                { value: 4, label: "4점" },
                { value: 3, label: "3점" },
                { value: 2, label: "2점" },
                { value: 1, label: "1점" },
              ].map((item) => {
                const active = rating === item.value;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => loadReviews({ rating: item.value })}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-[var(--primary)] text-white"
                        : "border border-[var(--line)] bg-white/80 text-[var(--ink)]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <label className="flex items-center gap-3 text-sm text-[var(--ink-soft)]">
              <span>리뷰 정렬</span>
              <select
                name="reviewSort"
                value={sort}
                onChange={(event) => loadReviews({ sort: event.target.value })}
                className="soft-input px-4 py-3"
              >
                <option value="newest">최신순</option>
                <option value="helpful">도움순</option>
                <option value="rating-high">평점 높은순</option>
                <option value="rating-low">평점 낮은순</option>
              </select>
            </label>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {actionMessage ? <p className="text-sm text-[var(--secondary)]">{actionMessage}</p> : null}
          {isPending ? <p className="text-sm text-[var(--ink-soft)]">리뷰를 불러오는 중...</p> : null}
        </div>

        <div className="mt-8 space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => {
              const isExpanded = expandedIds.includes(review.id);
              const needsExpand = review.content.length > 180;
              const previewContent = needsExpand && !isExpanded ? `${review.content.slice(0, 180)}…` : review.content;

              return (
                <article
                  key={review.id}
                  className="rounded-sm border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold">{review.title}</p>
                        {review.buyerReview ? (
                          <span className="rounded-full bg-[rgba(28,107,81,0.12)] px-3 py-1 text-xs font-semibold text-[var(--secondary)]">
                            구매 인증
                          </span>
                        ) : null}
                        {review.hasPhotos ? (
                          <span className="rounded-full bg-[rgba(37,99,235,0.12)] px-3 py-1 text-xs font-semibold text-blue-700">
                            포토 리뷰
                          </span>
                        ) : null}
                        {review.fitTag ? (
                          <span className="rounded-full bg-[rgba(15,23,42,0.06)] px-3 py-1 text-xs font-semibold text-[var(--ink-soft)]">
                            {review.fitTag}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <RatingStars rating={review.rating} size="sm" />
                        <span className="text-sm text-[var(--ink-soft)]">{review.reviewerName}</span>
                        {review.repurchaseYn ? (
                          <span className="text-xs font-semibold text-[var(--secondary)]">재구매 의사/경험 있음</span>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-sm text-[var(--ink-soft)]">{formatDate(review.createdAt)}</p>
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-[var(--ink-soft)] sm:grid-cols-3">
                    <p>배송 만족도 {review.deliverySatisfaction ?? "-"}/5</p>
                    <p>포장 만족도 {review.packagingSatisfaction ?? "-"}/5</p>
                    <p>도움이 돼요 {review.helpfulCount}</p>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">{previewContent}</p>
                  {needsExpand ? (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedIds((current) =>
                          current.includes(review.id)
                            ? current.filter((id) => id !== review.id)
                            : [...current, review.id],
                        )
                      }
                      className="mt-2 text-sm font-semibold text-[var(--primary)]"
                    >
                      {isExpanded ? "접기" : "더 보기"}
                    </button>
                  ) : null}

                  {review.images.length > 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {review.images.map((image) => (
                        <div key={image.id} className="aspect-square overflow-hidden rounded-[20px] border border-[var(--line)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image.imageUrl}
                            alt={`${review.title} 이미지`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (!session.authenticated) {
                          router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
                          return;
                        }

                        setError("");
                        setActionMessage("");
                        startTransition(() => {
                          void (async () => {
                            try {
                              const response = review.helpfulVoted
                                ? await unmarkReviewHelpful(productId, review.id)
                                : await markReviewHelpful(productId, review.id);
                              setReviews((current) =>
                                current.map((item) =>
                                  item.id === review.id
                                    ? {
                                        ...item,
                                        helpfulCount: response.helpfulCount,
                                        helpfulVoted: response.helpfulVoted,
                                      }
                                    : item,
                                ),
                              );
                              setActionMessage(
                                response.helpfulVoted
                                  ? "이 리뷰를 도움이 되는 리뷰로 저장했습니다."
                                  : "도움이 돼요 표시를 취소했습니다.",
                              );
                            } catch (nextError) {
                              setError(nextError instanceof Error ? nextError.message : "도움이 돼요 처리에 실패했습니다.");
                            }
                          })();
                        });
                      }}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        review.helpfulVoted
                          ? "bg-[var(--primary)] text-white"
                          : "border border-[var(--line)] bg-white/80 text-[var(--ink)]"
                      }`}
                    >
                      도움이 돼요 {review.helpfulCount}
                    </button>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-sm border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm leading-7 text-[var(--ink-soft)]">
              선택한 조건에 맞는 리뷰가 없습니다. 필터를 해제하거나 첫 리뷰를 남겨 보세요.
            </div>
          )}
        </div>
      </article>

      <ReviewComposer
        productId={productId}
        canWriteReview={canWriteReview}
        hasReviewed={hasReviewed}
      />
    </section>
  );
}
