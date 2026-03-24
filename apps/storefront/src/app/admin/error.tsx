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
          <p className="eyebrow text-[var(--ink-soft)]">Admin Error</p>
          <h1 className="display text-4xl font-semibold leading-[0.94] sm:text-5xl">
            The operations console could not load this view.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Retry the request. If the failure continues, verify the API service and the current
            admin session.
          </p>
        </div>
        <div>
          <button type="button" onClick={reset} className="admin-button px-6 py-4">
            Retry
          </button>
        </div>
      </section>
    </main>
  );
}
