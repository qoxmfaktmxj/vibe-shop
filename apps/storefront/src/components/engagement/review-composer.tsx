"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { createProductReview } from "@/lib/client-api";
import { useAuth } from "@/lib/auth-store";

const INITIAL_FORM = {
  rating: 5,
  title: "",
  content: "",
  fitTag: "",
  repurchaseYn: false,
  deliverySatisfaction: 5,
  packagingSatisfaction: 5,
  imageUrlsText: "",
};

function parseImageUrls(imageUrlsText: string) {
  return imageUrlsText
    .split(/\n|,/)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 4);
}

function RatingSelect({
  name,
  label,
  value,
  onChange,
  disabled,
}: {
  name: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        disabled={disabled}
        className="soft-input rounded-[20px] px-4 py-3"
      >
        <option value={5}>5점</option>
        <option value={4}>4점</option>
        <option value={3}>3점</option>
        <option value={2}>2점</option>
        <option value={1}>1점</option>
      </select>
    </label>
  );
}

export function ReviewComposer({
  productId,
  canWriteReview,
  hasReviewed,
}: {
  productId: number;
  canWriteReview: boolean;
  hasReviewed: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const disabled = !canWriteReview || hasReviewed || !session.authenticated || isPending;
  const parsedImageUrls = useMemo(() => parseImageUrls(form.imageUrlsText), [form.imageUrlsText]);

  let helperText = "구매 이력이 있는 회원만 리뷰를 작성할 수 있습니다.";
  if (!session.authenticated) {
    helperText = "리뷰를 작성하려면 먼저 로그인해 주세요.";
  } else if (hasReviewed) {
    helperText = "이미 리뷰를 작성한 상품입니다. 마이페이지에서 수정하거나 삭제할 수 있습니다.";
  } else if (canWriteReview) {
    helperText = "사진, 배송 만족도, 포장 만족도까지 함께 남기면 다른 고객에게 더 큰 도움이 됩니다.";
  }

  return (
    <section className="surface-card rounded-[32px] p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="display-eyebrow">리뷰 작성</p>
          <h2 className="display-heading mt-3 text-3xl">구매 후기를 남겨 주세요.</h2>
        </div>
        <div className="rounded-full border border-[var(--line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          구매 회원 전용
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">{helperText}</p>

      <form
        className="mt-8 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage("");
          setError("");

          if (!session.authenticated) {
            router.push(`/auth?tab=login&next=${encodeURIComponent(pathname || "/")}`);
            return;
          }

          startTransition(() => {
            void (async () => {
              try {
                await createProductReview(productId, {
                  rating: form.rating,
                  title: form.title.trim(),
                  content: form.content.trim(),
                  fitTag: form.fitTag.trim(),
                  repurchaseYn: form.repurchaseYn,
                  deliverySatisfaction: form.deliverySatisfaction,
                  packagingSatisfaction: form.packagingSatisfaction,
                  imageUrls: parsedImageUrls,
                });
                setForm(INITIAL_FORM);
                setMessage("리뷰가 등록되었습니다.");
                router.refresh();
              } catch (nextError) {
                setError(nextError instanceof Error ? nextError.message : "리뷰 등록에 실패했습니다.");
              }
            })();
          });
        }}
      >
        <RatingSelect
          name="rating"
          label="평점"
          value={form.rating}
          onChange={(value) => setForm((current) => ({ ...current, rating: value }))}
          disabled={disabled}
        />

        <label className="grid gap-2">
          <span className="text-sm font-medium">한 줄 태그</span>
          <input
            name="fitTag"
            maxLength={40}
            value={form.fitTag}
            onChange={(event) => setForm((current) => ({ ...current, fitTag: event.target.value }))}
            disabled={disabled}
            className="soft-input rounded-[20px] px-4 py-3"
            placeholder="작은 공간에도 잘 맞아요 / 재구매 의사 있어요"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">제목</span>
          <input
            name="title"
            maxLength={120}
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            disabled={disabled}
            className="soft-input rounded-[20px] px-4 py-3"
            placeholder="어떤 점이 좋았는지 짧게 적어 주세요"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">내용</span>
          <textarea
            name="content"
            rows={5}
            maxLength={2000}
            value={form.content}
            onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
            disabled={disabled}
            className="soft-input rounded-[20px] px-4 py-3"
            placeholder="사용하면서 느낀 점, 추천 이유, 아쉬운 점을 자유롭게 적어 주세요"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <RatingSelect
            name="deliverySatisfaction"
            label="배송 만족도"
            value={form.deliverySatisfaction}
            onChange={(value) => setForm((current) => ({ ...current, deliverySatisfaction: value }))}
            disabled={disabled}
          />
          <RatingSelect
            name="packagingSatisfaction"
            label="포장 만족도"
            value={form.packagingSatisfaction}
            onChange={(value) => setForm((current) => ({ ...current, packagingSatisfaction: value }))}
            disabled={disabled}
          />
        </div>

        <label className="flex items-center gap-3 rounded-[20px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--ink-soft)]">
          <input
            name="repurchaseYn"
            type="checkbox"
            checked={form.repurchaseYn}
            onChange={(event) => setForm((current) => ({ ...current, repurchaseYn: event.target.checked }))}
            disabled={disabled}
          />
          재구매 의사 또는 재구매 경험이 있어요
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">포토 리뷰 URL (선택)</span>
          <textarea
            name="imageUrls"
            rows={3}
            value={form.imageUrlsText}
            onChange={(event) => setForm((current) => ({ ...current, imageUrlsText: event.target.value }))}
            disabled={disabled}
            className="soft-input rounded-[20px] px-4 py-3"
            placeholder={"https://example.com/review-1.jpg\nhttps://example.com/review-2.jpg"}
          />
        </label>

        <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] px-4 py-3 text-sm text-[var(--ink-soft)]">
          미리보기 이미지 {parsedImageUrls.length}개 / 최대 4개
        </div>

        {message ? <p className="text-sm text-[var(--secondary)]">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={disabled}
          className="button-primary w-full rounded-[20px] px-5 py-3 disabled:opacity-60"
        >
          {isPending ? "등록 중..." : "리뷰 등록"}
        </button>
      </form>
    </section>
  );
}
