"use client";

import { useMemo, useState, useTransition } from "react";

import { updateReviewStatus } from "@/lib/admin-client-api";
import type { AdminReview } from "@/lib/admin-contracts";
import { AdminPagination } from "@/components/admin-pagination";

const REVIEWS_PER_PAGE = 10;

function formatReviewStatus(status: string) {
  const labels: Record<string, string> = {
    PUBLISHED: "공개",
    HIDDEN: "숨김",
  };

  return labels[status] ?? status;
}

function renderStars(rating: number) {
  return `${"★".repeat(rating)}${"☆".repeat(Math.max(0, 5 - rating))}`;
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [photoFilter, setPhotoFilter] = useState("ALL");
  const [draftStatuses, setDraftStatuses] = useState<Record<number, string>>({});
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredReviews = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((review) => {
      if (statusFilter !== "ALL" && review.status !== statusFilter) {
        return false;
      }

      if (photoFilter === "PHOTO" && review.photoCount === 0) {
        return false;
      }

      if (photoFilter === "TEXT" && review.photoCount > 0) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return [
        review.productName,
        review.reviewerName,
        review.reviewerEmail,
        review.title,
        review.content,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [items, photoFilter, query, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE,
  );

  return (
    <article className="admin-card rounded-[36px] p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-[var(--ink-soft)]">리뷰 운영</p>
          <h2 className="display mt-4 text-3xl font-semibold">리뷰 목록</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            상품, 작성자, 평점, 포토 여부, 공개 상태를 한 줄에서 보고 필요한 리뷰만
            빠르게 조정할 수 있게 정리했습니다.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <input
            name="reviewQuery"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            className="admin-input px-4 py-3"
            placeholder="상품명, 작성자, 리뷰 내용 검색"
          />
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="admin-input px-4 py-3"
          >
            <option value="ALL">전체 상태</option>
            <option value="PUBLISHED">공개</option>
            <option value="HIDDEN">숨김</option>
          </select>
          <select
            value={photoFilter}
            onChange={(event) => {
              setPhotoFilter(event.target.value);
              setPage(1);
            }}
            className="admin-input px-4 py-3"
          >
            <option value="ALL">전체 유형</option>
            <option value="PHOTO">포토 리뷰</option>
            <option value="TEXT">텍스트 리뷰</option>
          </select>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <div className="min-w-[1240px]">
          <div className="grid grid-cols-[1.5fr_1.4fr_1fr_1.5fr_220px] gap-3 rounded-[22px] bg-[rgba(16,33,39,0.04)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            <div>상품 / 작성자</div>
            <div>평점 / 상태</div>
            <div>리뷰 지표</div>
            <div>제목 / 요약</div>
            <div>노출 변경</div>
          </div>

          <div className="mt-3 space-y-3">
            {paginatedReviews.map((review) => {
              const draftStatus = draftStatuses[review.id] ?? review.status;

              return (
                <div
                  key={review.id}
                  className="grid grid-cols-[1.5fr_1.4fr_1fr_1.5fr_220px] gap-3 rounded-[24px] border border-[var(--line)] bg-white/72 px-4 py-4"
                >
                  <div className="min-w-0 text-sm leading-6 text-[var(--ink-soft)]">
                    <p className="truncate font-semibold text-[var(--ink)]">
                      {review.productName}
                    </p>
                    <p className="truncate">{review.reviewerName}</p>
                    <p className="truncate">{review.reviewerEmail}</p>
                  </div>

                  <div className="text-sm leading-6 text-[var(--ink-soft)]">
                    <p className="font-semibold text-[var(--primary)]">
                      {renderStars(review.rating)}
                    </p>
                    <p>{formatReviewStatus(review.status)}</p>
                    <p>{review.buyerReview ? "구매 인증" : "일반 리뷰"}</p>
                  </div>

                  <div className="text-sm leading-6 text-[var(--ink-soft)]">
                    <p>포토 {review.photoCount}개</p>
                    <p>도움 수 {review.helpfulCount}</p>
                    <p>{new Date(review.createdAt).toLocaleDateString("ko-KR")}</p>
                  </div>

                  <div className="min-w-0 text-sm leading-6 text-[var(--ink-soft)]">
                    <p className="truncate font-semibold text-[var(--ink)]">
                      {review.title}
                    </p>
                    <p className="truncate">{review.content}</p>
                  </div>

                  <div className="grid gap-2">
                    <select
                      value={draftStatus}
                      onChange={(event) =>
                        setDraftStatuses((current) => ({
                          ...current,
                          [review.id]: event.target.value,
                        }))
                      }
                      className="admin-input px-4 py-3"
                    >
                      <option value="PUBLISHED">공개</option>
                      <option value="HIDDEN">숨김</option>
                    </select>
                    <button
                      type="button"
                      disabled={isPending || draftStatus === review.status}
                      onClick={() => {
                        setMessage("");
                        setError("");
                        startTransition(() => {
                          void (async () => {
                            try {
                              const updatedReview = await updateReviewStatus(
                                review.id,
                                { status: draftStatus },
                              );
                              setItems((current) =>
                                current.map((item) =>
                                  item.id === updatedReview.id
                                    ? updatedReview
                                    : item,
                                ),
                              );
                              setDraftStatuses((current) => ({
                                ...current,
                                [review.id]: updatedReview.status,
                              }));
                              setMessage(
                                `리뷰 ${updatedReview.id} 상태를 저장했습니다.`,
                              );
                            } catch (saveError) {
                              setError(
                                getErrorMessage(
                                  saveError,
                                  "리뷰 상태를 저장하지 못했습니다.",
                                ),
                              );
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
              );
            })}
          </div>
        </div>
      </div>

      <AdminPagination
        page={currentPage}
        totalPages={totalPages}
        summary={
          filteredReviews.length === 0
            ? "검색 결과가 없습니다."
            : `${(currentPage - 1) * REVIEWS_PER_PAGE + 1}-${Math.min(
                currentPage * REVIEWS_PER_PAGE,
                filteredReviews.length,
              )}번째 리뷰 표시`
        }
        onChange={setPage}
      />

      {message ? <p className="mt-5 text-sm text-[var(--teal)]">{message}</p> : null}
      {error ? <p className="mt-5 text-sm text-red-600">{error}</p> : null}
    </article>
  );
}
