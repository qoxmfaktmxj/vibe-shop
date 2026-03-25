"use client";

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
    <main className="mx-auto flex min-h-screen w-full max-w-[960px] items-center px-6 py-12 sm:px-8 lg:px-10">
      <section className="admin-card grid gap-6 rounded-[40px] p-8 sm:p-10">
        <div className="grid gap-3">
          <p className="eyebrow text-[var(--ink-soft)]">관리자 오류</p>
          <h1 className="display text-4xl font-semibold leading-[0.94] sm:text-5xl">
            운영 화면을 불러오지 못했습니다.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            다시 시도해 보세요. 같은 문제가 반복되면 API 상태와 관리자 세션을 확인해야 합니다.
          </p>
        </div>
        <div>
          <button type="button" onClick={reset} className="admin-button px-6 py-4">
            다시 시도
          </button>
        </div>
      </section>
    </main>
  );
}
