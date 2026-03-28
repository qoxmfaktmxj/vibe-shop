import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  baseParams: Record<string, string>;
  basePath: string;
}

function buildHref(basePath: string, baseParams: Record<string, string>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(baseParams)) {
    if (value) {
      params.set(key, value);
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  const rangeStart = Math.max(2, current - 2);
  const rangeEnd = Math.min(total - 1, current + 2);

  if (rangeStart > 2) {
    pages.push("ellipsis");
  }

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (rangeEnd < total - 1) {
    pages.push("ellipsis");
  }

  pages.push(total);

  return pages;
}

export function Pagination({ page, totalPages, baseParams, basePath }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <nav aria-label="페이지 탐색" className="mt-8 flex items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={buildHref(basePath, baseParams, page - 1)}
          className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.84)] px-4 text-xs font-semibold tracking-wider text-[var(--ink-soft)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
        >
          <span aria-hidden="true" className="mr-1.5">&larr;</span>
          <span className="hidden sm:inline">이전</span>
        </Link>
      ) : (
        <span className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.44)] px-4 text-xs font-semibold tracking-wider text-[var(--ink-muted)]">
          <span aria-hidden="true" className="mr-1.5">&larr;</span>
          <span className="hidden sm:inline">이전</span>
        </span>
      )}

      <div className="hidden items-center gap-1 sm:flex">
        {pageNumbers.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-10 w-10 items-center justify-center text-xs text-[var(--ink-muted)]"
            >
              &hellip;
            </span>
          ) : (
              <Link
                key={item}
                href={buildHref(basePath, baseParams, item)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                  item === page
                    ? "pagination-page-current"
                    : "border border-[var(--line)] bg-[rgba(255,255,255,0.84)] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
                }`}
                aria-current={item === page ? "page" : undefined}
              >
              {item}
            </Link>
          ),
        )}
      </div>

      <span className="inline-flex items-center px-2 text-xs font-medium tracking-wide text-[var(--ink-soft)] sm:hidden">
        {page} / {totalPages}
      </span>

      {page < totalPages ? (
        <Link
          href={buildHref(basePath, baseParams, page + 1)}
          className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.84)] px-4 text-xs font-semibold tracking-wider text-[var(--ink-soft)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
        >
          <span className="hidden sm:inline">다음</span>
          <span aria-hidden="true" className="ml-1.5">&rarr;</span>
        </Link>
      ) : (
        <span className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.44)] px-4 text-xs font-semibold tracking-wider text-[var(--ink-muted)]">
          <span className="hidden sm:inline">다음</span>
          <span aria-hidden="true" className="ml-1.5">&rarr;</span>
        </span>
      )}
    </nav>
  );
}
