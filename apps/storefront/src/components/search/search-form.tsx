import type { Category } from "@/lib/contracts";

export function SearchForm({
  categories,
  initialKeyword = "",
  initialCategory = "",
}: {
  categories: Category[];
  initialKeyword?: string;
  initialCategory?: string;
}) {
  return (
    <form
      action="/search"
      method="get"
      className="grid gap-4 border-y border-[var(--line)] py-5 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-end"
    >
      <label className="grid gap-2">
        <span className="display-eyebrow">카테고리</span>
        <select
          name="category"
          defaultValue={initialCategory}
          className="soft-input min-h-12 px-4 text-sm font-medium"
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
          name="q"
          defaultValue={initialKeyword}
          placeholder="머그컵, 린넨 커튼, 10만원 이하"
          className="soft-input min-h-12 px-4 text-sm font-medium"
        />
      </label>

      <button
        type="submit"
        className="button-primary min-h-12 px-8 text-sm"
      >
        검색
      </button>
    </form>
  );
}
