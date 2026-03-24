import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { ProductSortTabs } from "@/components/catalog/product-sort-tabs";
import { SearchForm } from "@/components/search/search-form";
import { getCategories, getProducts, searchProducts } from "@/lib/server-api";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string }>;
}) {
  const { q, sort, category } = await searchParams;
  const keyword = q?.trim() ?? "";
  const currentSort = sort?.trim() || "recommended";
  const currentCategory = category?.trim() ?? "";
  const categories = await getCategories();
  const selectedCategory = categories.find((item) => item.slug === currentCategory);
  const shouldRenderResults = Boolean(keyword || currentCategory);
  const searchResult = keyword
    ? await searchProducts(keyword, currentSort, currentCategory || undefined)
    : null;
  const products = keyword
    ? searchResult?.items ?? []
    : currentCategory
      ? await getProducts(currentCategory, currentSort)
      : [];

  return (
    <div className="grid-shell space-y-8">
      <section className="surface-card rounded-[36px] p-8 sm:p-10">
        <p className="display-eyebrow">Search</p>
        <h1 className="display-heading mt-4 text-4xl font-semibold">상품 검색</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
          상품명과 카테고리, 분위기 키워드를 함께 사용해 원하는 아이템을 빠르게 찾아보세요.
        </p>
        <SearchForm categories={categories} initialCategory={currentCategory} />
      </section>

      {shouldRenderResults ? (
        <section className="surface-card rounded-[36px] p-6 sm:p-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="display-eyebrow">Results</p>
              <h2 className="display-heading mt-3 text-3xl font-semibold">
                {keyword
                  ? `“${keyword}” 검색 결과`
                  : `${selectedCategory?.name ?? "카테고리"} 전시 결과`}
              </h2>
              <p className="mt-3 text-sm text-[var(--ink-soft)]">
                {selectedCategory ? `${selectedCategory.name} 카테고리만 표시 중` : "전체 카테고리"}
              </p>
            </div>
            <p className="text-sm text-[var(--ink-soft)]">{products.length}개 상품</p>
          </div>

          {searchResult?.appliedFilters?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {searchResult.appliedFilters.map((filter) => (
                <span
                  key={`${filter.type}-${filter.value}`}
                  className="rounded-full border border-[var(--line)] bg-[rgba(255,255,255,0.82)] px-3 py-2 text-xs font-medium text-[var(--ink-soft)]"
                >
                  {filter.label}
                </span>
              ))}
            </div>
          ) : null}

          {searchResult?.fallback?.applied ? (
            <div className="mt-5 rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] p-4 text-sm leading-7 text-[var(--ink-soft)]">
              <p className="font-semibold text-[var(--ink)]">해석된 검색 조건을 조금 넓혀 보여드렸습니다.</p>
              <p className="mt-2">{searchResult.fallback.reason}</p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <ProductSortTabs
              pathname="/search"
              searchParams={{ q: keyword || undefined, sort, category: currentCategory || undefined }}
              currentSort={currentSort}
            />
            {currentCategory ? (
              <Link href="/search" className="text-sm font-medium text-[var(--primary)]">
                필터 초기화
              </Link>
            ) : null}
          </div>

          {products.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm text-[var(--ink-soft)]">
              검색 결과가 없습니다. 다른 키워드나 카테고리 조합으로 다시 시도해 주세요.
            </div>
          )}
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-3">
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/search?category=${item.slug}`}
              className="surface-card rounded-[28px] p-6 transition hover:-translate-y-1"
            >
              <p className="display-eyebrow">{item.name}</p>
              <p className="display-heading mt-4 text-2xl font-semibold text-[var(--ink)]">
                {item.description}
              </p>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
