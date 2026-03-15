import Link from "next/link";

const SORT_OPTIONS = [
  { value: "recommended", label: "추천순" },
  { value: "price-asc", label: "가격 낮은순" },
  { value: "price-desc", label: "가격 높은순" },
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
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              currentSort === option.value
                ? "bg-[var(--accent-strong)] text-white shadow-[0_10px_24px_rgba(41,51,155,0.16)]"
                : "border border-[rgba(41,51,155,0.14)] bg-[rgba(255,255,243,0.8)] text-[var(--ink-soft)] hover:bg-[rgba(116,164,188,0.16)]"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}
