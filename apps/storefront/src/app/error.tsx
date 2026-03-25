"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="surface-card grid min-h-[420px] place-items-center rounded-[2rem] px-6 py-16 text-center">
      <div className="grid max-w-2xl gap-4">
        <p className="display-eyebrow">오류 발생</p>
        <h1 className="display-heading text-4xl sm:text-5xl">페이지를 불러오지 못했습니다.</h1>
        <p className="text-sm leading-7 text-[var(--ink-soft)]">
          화면 껍데기는 유지됐지만 일부 요청이 실패했습니다. 다시 시도하거나 홈으로 돌아가세요.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="button-primary px-6 py-4">
            다시 시도
          </button>
          <Link href="/" className="button-secondary px-6 py-4">
            홈으로
          </Link>
        </div>
      </div>
    </section>
  );
}
