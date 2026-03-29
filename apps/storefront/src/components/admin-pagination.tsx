"use client";

export function AdminPagination({
  page,
  totalPages,
  summary,
  onChange,
}: {
  page: number;
  totalPages: number;
  summary: string;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        className="admin-button-secondary px-4 py-3 disabled:opacity-50"
      >
        이전
      </button>
      <p className="text-xs text-[var(--ink-soft)]">{summary}</p>
      <button
        type="button"
        disabled={page === totalPages}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        className="admin-button-secondary px-4 py-3 disabled:opacity-50"
      >
        다음
      </button>
    </div>
  );
}
