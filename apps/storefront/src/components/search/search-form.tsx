"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import type { Category } from "@/lib/contracts";

export function SearchForm({
  categories,
  initialCategory = "",
}: {
  categories: Category[];
  initialCategory?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(initialCategory);

  return (
    <form
      className="flex h-14 w-full border border-[var(--line)] bg-[var(--surface-card)]"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmedKeyword = keyword.trim();
        const trimmedCategory = category.trim();
        const params = new URLSearchParams();

        if (trimmedKeyword) params.set("q", trimmedKeyword);
        if (trimmedCategory) params.set("category", trimmedCategory);

        startTransition(() => {
          router.push(params.size > 0 ? `/search?${params.toString()}` : "/search");
        });
      }}
    >
      <select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        className="shrink-0 border-r border-[var(--line)] bg-transparent px-4 text-xs font-medium uppercase tracking-[0.1em] text-[var(--ink-soft)] outline-none"
        style={{ fontFamily: "var(--font-display), monospace" }}
      >
        <option value="">전체 카테고리</option>
        {categories.map((item) => (
          <option key={item.id} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>

      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="여름 리빙 10만원 이하 베이지 선물"
        className="min-w-0 flex-1 bg-transparent px-5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]"
      />

      <button
        type="submit"
        disabled={isPending}
        className="shrink-0 bg-[var(--ink)] px-6 text-xs font-bold uppercase tracking-[0.1em] disabled:opacity-60"
        style={{ color: "#ffffff", fontFamily: "var(--font-display), monospace" }}
      >
        {isPending ? "…" : "검색"}
      </button>
    </form>
  );
}
