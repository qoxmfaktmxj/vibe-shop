"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");

  return (
    <form
      className="mt-8 flex flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = keyword.trim();
        startTransition(() => {
          router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
        });
      }}
    >
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="상품명, 카테고리, 요약으로 검색"
        className="min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-[rgba(255,255,243,0.92)] px-4 py-3"
      />
      <button
        type="submit"
        disabled={isPending}
        className="button-primary px-5 py-3 disabled:opacity-60"
      >
        {isPending ? "검색 중..." : "검색"}
      </button>
    </form>
  );
}
