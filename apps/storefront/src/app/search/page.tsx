import { ProductCard } from "@/components/catalog/product-card";
import { ProductSortTabs } from "@/components/catalog/product-sort-tabs";
import { SearchForm } from "@/components/search/search-form";
import { searchProducts } from "@/lib/server-api";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort } = await searchParams;
  const keyword = q?.trim() ?? "";
  const currentSort = sort?.trim() || "recommended";
  const products = keyword ? await searchProducts(keyword, currentSort) : [];

  return (
    <div className="grid-shell">
      <section className="surface-card rounded-[36px] p-8 sm:p-10">
        <p className="display-eyebrow">Search</p>
        <h1 className="display-heading mt-4 text-4xl font-semibold">
          상품 검색
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
          상품명, 카테고리명, 상품 요약 기준으로 현재 MVP 상품을 검색할 수 있습니다.
        </p>
        <SearchForm />
      </section>

      {keyword ? (
        <section className="surface-card rounded-[36px] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="display-eyebrow">Results</p>
              <h2 className="display-heading mt-3 text-3xl font-semibold">
                &quot;{keyword}&quot; 검색 결과
              </h2>
            </div>
            <p className="text-sm text-[var(--ink-soft)]">
              {products.length}개 상품
            </p>
          </div>
          <div className="mt-6">
            <ProductSortTabs
              pathname="/search"
              searchParams={{ q: keyword, sort }}
              currentSort={currentSort}
            />
          </div>

          {products.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,243,0.72)] p-6 text-sm text-[var(--ink-soft)]">
              검색 결과가 없습니다. 다른 키워드로 다시 시도해 주세요.
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
