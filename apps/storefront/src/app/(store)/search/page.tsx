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
  const searchResult = keyword ? await searchProducts(keyword, currentSort, currentCategory || undefined) : null;
  const products = keyword
    ? searchResult?.items ?? []
    : currentCategory
      ? await getProducts(currentCategory, currentSort)
      : [];

  return (
    <div className="grid-shell space-y-6 sm:space-y-8">
      <section className="space-y-4">
        <div className="max-w-3xl">
          <p className="display-eyebrow">상품 검색</p>
          <h1 className="display-heading mt-3 text-4xl">원하는 무드의 상품만 빠르게 골라보세요.</h1>
          <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
            검색어와 카테고리를 함께 조합해서 지금 보고 싶은 상품군만 정확하게 좁혀볼 수 있습니다.
          </p>
        </div>
        <SearchForm categories={categories} initialCategory={currentCategory} />
      </section>

      {shouldRenderResults ? (
        <section className="surface-card rounded-[28px] p-5 sm:rounded-[32px] sm:p-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="display-eyebrow">검색 결과</p>
              <h2 className="display-heading mt-3 text-3xl">
                {keyword ? `“${keyword}” 검색 결과` : `${selectedCategory?.name ?? "카테고리"} 전시 결과`}
              </h2>
              <p className="mt-3 text-sm text-[var(--ink-soft)]">
                {selectedCategory
                  ? `${selectedCategory.name} 카테고리만 표시 중입니다.`
                  : "전체 카테고리를 기준으로 결과를 보여줍니다."}
              </p>
            </div>
            <p className="status-pill self-start lg:self-auto">{products.length}개 상품</p>
          </div>

          {searchResult?.appliedFilters?.length ? (
            <div className="mt-5 flex flex-wrap gap-2 sm:mt-6">
              {searchResult.appliedFilters.map((filter) => (
                <span
                  key={`${filter.type}-${filter.value}`}
                  className="chip-link rounded-full text-[var(--ink-soft)]"
                >
                  {filter.label}
                </span>
              ))}
            </div>
          ) : null}

          {searchResult?.fallback?.applied ? (
            <div className="mt-4 rounded-[20px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] p-4 text-sm leading-7 text-[var(--ink-soft)] sm:mt-5 sm:rounded-[24px]">
              <p className="font-semibold text-[var(--ink)]">검색 조건을 조금 넓혀서 결과를 보여드리고 있습니다.</p>
              <p className="mt-2">{searchResult.fallback.reason}</p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-4 lg:mt-6 lg:flex-row lg:items-center lg:justify-between">
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
            <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 md:grid-cols-2 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[20px] border border-dashed border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5 text-sm leading-7 text-[var(--ink-soft)] sm:mt-8 sm:rounded-[24px] sm:p-6">
              결과가 없습니다. 다른 검색어를 입력하거나 카테고리 필터를 바꿔서 다시 시도해 보세요.
            </div>
          )}
        </section>
      ) : (
        <section className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/search?category=${item.slug}`}
              className="surface-card hover-lift rounded-[24px] p-5 transition sm:rounded-[28px] sm:p-6"
            >
              <p className="display-eyebrow">{item.name}</p>
              <p className="display-heading mt-4 text-2xl text-[var(--ink)]">{item.description}</p>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
