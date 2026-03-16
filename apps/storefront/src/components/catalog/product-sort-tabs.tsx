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
    <div className="flex flex-wrap gap-2">
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

        const href = nextParams.toString()
          ? `${pathname}?${nextParams.toString()}`
          : pathname;

        return (
          <Link
            key={option.value}
            href={href}
            className={`rounded-2xl px-4 py-2 text-sm font-medium transition ${
              currentSort === option.value
                ? "border border-[var(--line-strong)] bg-[var(--ink)] !text-white shadow-[0_10px_24px_rgba(24,23,21,0.12)]"
                : "border border-[var(--line)] bg-[rgba(255,255,255,0.84)] text-[var(--ink-soft)] hover:bg-[var(--surface-strong)]"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
