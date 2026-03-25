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
      className="section-frame grid gap-4 rounded-[24px] p-4 sm:rounded-[28px] sm:p-5 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-end"
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
      <label className="grid gap-2">
        <span className="display-eyebrow">카테고리</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="soft-input min-h-13 rounded-[18px] px-4 text-[15px] font-medium sm:min-h-14 sm:rounded-[20px] sm:text-base"
        >
          <option value="">전체 카테고리</option>
          {categories.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="display-eyebrow">검색어</span>
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="머그컵, 린넨 커튼, 10만원 이하"
          className="soft-input min-h-13 rounded-[18px] px-4 text-[15px] font-medium sm:min-h-14 sm:rounded-[20px] sm:px-5 sm:text-base"
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="button-primary min-h-13 rounded-[18px] px-7 text-sm disabled:opacity-60 sm:min-h-14 sm:rounded-[20px] sm:text-[15px]"
      >
        {isPending ? "검색 중" : "검색"}
      </button>
    </form>
  );
}
