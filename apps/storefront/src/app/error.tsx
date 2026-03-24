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
        <p className="display-eyebrow">Request Failed</p>
        <h1 className="display-heading text-4xl sm:text-5xl">We could not load this page.</h1>
        <p className="text-sm leading-7 text-[var(--ink-soft)]">
          The storefront shell stayed online, but one of the page requests failed. Retry the request or
          return to the home page.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="button-primary px-6 py-4">
            Retry
          </button>
          <Link href="/" className="button-secondary px-6 py-4">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
