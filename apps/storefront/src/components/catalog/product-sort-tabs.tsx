import Link from "next/link";

const SORT_OPTIONS = [
  { value: "recommended", label: "추천순" },
  { value: "newest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "price-asc", label: "낮은 가격순" },
  { value: "price-desc", label: "높은 가격순" },
] as const;

export function ProductSortTabs({
  pathname,
  searchParams,
  currentSort,
}: {
  pathname: string;
  searchParams: Record<string, string | undefined>;
  currentSort: string;
}) {
  return (
    <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto border-b border-[var(--line)]">
      {SORT_OPTIONS.map((option) => {
        const nextParams = new URLSearchParams();
        for (const [key, value] of Object.entries(searchParams)) {
          if (value) {
            nextParams.set(key, value);
          }
        }

        if (option.value !== "recommended") {
          nextParams.set("sort", option.value);
        } else {
          nextParams.delete("sort");
        }

        const href = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;

        return (
          <Link
            key={option.value}
            href={href}
            className={`shrink-0 snap-start border-b py-3 text-xs font-medium transition-colors ${
              currentSort === option.value
                ? "border-[var(--ink)] text-[var(--ink)]"
                : "border-transparent text-[var(--ink-muted)] hover:text-[var(--ink)]"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
