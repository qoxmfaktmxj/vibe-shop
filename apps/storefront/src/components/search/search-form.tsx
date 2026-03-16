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
      className="mt-8 grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmedKeyword = keyword.trim();
        const trimmedCategory = category.trim();
        const params = new URLSearchParams();

        if (trimmedKeyword) {
          params.set("q", trimmedKeyword);
        }
        if (trimmedCategory) {
          params.set("category", trimmedCategory);
        }

        startTransition(() => {
          router.push(params.size > 0 ? `/search?${params.toString()}` : "/search");
        });
      }}
    >
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="상품명, 카테고리, 분위기로 검색해 보세요."
        className="min-w-0 rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.9)] px-4 py-3"
      />
      <select
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.9)] px-4 py-3 text-sm text-[var(--ink)]"
      >
        <option value="">전체 카테고리</option>
        {categories.map((item) => (
          <option key={item.id} value={item.slug}>
            {item.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isPending}
        className="button-primary px-5 py-3 disabled:opacity-60"
      >
        {isPending ? "검색하고 있습니다." : "검색"}
      </button>
    </form>
  );
}
