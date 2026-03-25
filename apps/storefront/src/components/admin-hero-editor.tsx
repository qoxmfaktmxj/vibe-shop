"use client";

import { useState, useTransition } from "react";

import { updateDisplay } from "@/lib/admin-client-api";
import type { AdminDisplay, UpdateAdminDisplayPayload } from "@/lib/admin-contracts";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AdminHeroEditor({
  initialDisplay,
}: {
  initialDisplay: Pick<AdminDisplay, "heroTitle" | "heroSubtitle" | "heroCtaLabel" | "heroCtaHref">;
}) {
  const [form, setForm] = useState<UpdateAdminDisplayPayload>({
    heroTitle: initialDisplay.heroTitle,
    heroSubtitle: initialDisplay.heroSubtitle,
    heroCtaLabel: initialDisplay.heroCtaLabel,
    heroCtaHref: initialDisplay.heroCtaHref,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();

  return (
    <article className="admin-card rounded-[36px] p-8">
      <p className="eyebrow text-[var(--ink-soft)]">메인 히어로</p>
      <h2 className="display mt-4 text-3xl font-semibold">상단 메시지와 CTA 편집</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
        메인 진입 메시지와 CTA를 다른 운영 데이터와 분리해 빠르게 수정할 수 있습니다.
      </p>

      <form
        className="mt-8 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage("");
          setError("");

          startSaving(() => {
            void (async () => {
              try {
                const nextDisplay = await updateDisplay({
                  heroTitle: form.heroTitle.trim(),
                  heroSubtitle: form.heroSubtitle.trim(),
                  heroCtaLabel: form.heroCtaLabel.trim(),
                  heroCtaHref: form.heroCtaHref.trim(),
                });

                setForm({
                  heroTitle: nextDisplay.heroTitle,
                  heroSubtitle: nextDisplay.heroSubtitle,
                  heroCtaLabel: nextDisplay.heroCtaLabel,
                  heroCtaHref: nextDisplay.heroCtaHref,
                });
                setMessage("히어로 콘텐츠를 저장했습니다.");
              } catch (nextError) {
                setError(getErrorMessage(nextError, "히어로 콘텐츠를 저장하지 못했습니다."));
              }
            })();
          });
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-medium">메인 제목</span>
          <input
            name="heroTitle"
            required
            value={form.heroTitle}
            onChange={(event) => setForm((current) => ({ ...current, heroTitle: event.target.value }))}
            className="admin-input px-4 py-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">메인 설명</span>
          <textarea
            name="heroSubtitle"
            required
            rows={4}
            value={form.heroSubtitle}
            onChange={(event) => setForm((current) => ({ ...current, heroSubtitle: event.target.value }))}
            className="admin-input px-4 py-3"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium">버튼 문구</span>
            <input
              name="heroCtaLabel"
              required
              value={form.heroCtaLabel}
              onChange={(event) => setForm((current) => ({ ...current, heroCtaLabel: event.target.value }))}
              className="admin-input px-4 py-3"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">버튼 링크</span>
            <input
              name="heroCtaHref"
              required
              value={form.heroCtaHref}
              onChange={(event) => setForm((current) => ({ ...current, heroCtaHref: event.target.value }))}
              className="admin-input px-4 py-3"
            />
          </label>
        </div>

        {message ? <p className="text-sm text-[var(--teal)]">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button type="submit" disabled={isSaving} className="admin-button w-fit px-6 py-4 disabled:opacity-60">
          {isSaving ? "저장 중..." : "히어로 저장"}
        </button>
      </form>
    </article>
  );
}
