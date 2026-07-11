import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { ProductSortTabs } from "@/components/catalog/product-sort-tabs";
import { SearchForm } from "@/components/search/search-form";
import { Pagination } from "@/components/ui/pagination";
import { getCategories, getProducts, searchProducts } from "@/lib/server-api";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string; page?: string }>;
}) {
  const { q, sort, category, page: pageParam } = await searchParams;
  const keyword = q?.trim() ?? "";
  const currentSort = sort?.trim() || "recommended";
  const currentCategory = category?.trim() ?? "";
  const currentPage = Math.max(1, Number(pageParam) || 1);
  const categories = await getCategories();
  const selectedCategory = categories.find((item) => item.slug === currentCategory);
  const shouldRenderResults = Boolean(keyword || currentCategory);

  const searchResult = keyword
    ? await searchProducts(keyword, currentSort, currentCategory || undefined, currentPage - 1, 20)
    : null;
  const productsResponse = !keyword && currentCategory
    ? await getProducts(currentCategory, currentSort, currentPage - 1, 20)
    : null;
  const products = keyword ? searchResult?.items ?? [] : productsResponse?.items ?? [];
  const totalItems = keyword ? searchResult?.totalItems ?? 0 : productsResponse?.totalItems ?? 0;
  const totalPages = keyword ? searchResult?.totalPages ?? 0 : productsResponse?.totalPages ?? 0;
  const baseParams: Record<string, string> = {};
  if (keyword) baseParams.q = keyword;
  if (currentSort !== "recommended") baseParams.sort = currentSort;
  if (currentCategory) baseParams.category = currentCategory;

  return (
    <div className="grid-shell pb-6 sm:pb-10">
      <section className="grid gap-10 pt-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end lg:pt-12">
        <div>
          <p className="display-eyebrow">Search the collection</p>
          <h1 className="display-heading mt-4 text-4xl sm:text-5xl">찾고 싶은 장면을 들려주세요.</h1>
        </div>
        <div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            상품 이름뿐 아니라 소재, 공간, 선물의 순간으로도 MARU의 셀렉션을 살펴볼 수 있습니다.
          </p>
          <div className="mt-7">
            <SearchForm categories={categories} initialKeyword={keyword} initialCategory={currentCategory} />
          </div>
        </div>
      </section>

      {shouldRenderResults ? (
        <section>
          <div className="grid gap-5 border-b border-[var(--line)] pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="display-eyebrow">Search results</p>
              <h2 className="display-heading mt-3 text-3xl sm:text-4xl">
                {keyword ? `“${keyword}” 검색 결과` : `${selectedCategory?.name ?? "카테고리"} 셀렉션`}
              </h2>
              <p className="mt-3 text-sm text-[var(--ink-soft)]">
                {selectedCategory ? `${selectedCategory.name} 카테고리에서 찾았습니다.` : "전체 컬렉션에서 찾았습니다."}
              </p>
            </div>
            <p className="text-xs tracking-[0.06em] text-[var(--ink-muted)]">
              총 {totalItems}개 · {products.length}개 표시
            </p>
          </div>

          {searchResult?.appliedFilters?.length ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {searchResult.appliedFilters.map((filter) => (
                <span key={`${filter.type}-${filter.value}`} className="border border-[var(--line)] px-3 py-2 text-[11px] text-[var(--ink-soft)]">
                  {filter.label}
                </span>
              ))}
            </div>
          ) : null}

          {searchResult?.fallback?.applied ? (
            <div className="mt-6 border-l-2 border-[var(--primary)] bg-[var(--primary-soft)] p-5 text-sm leading-7 text-[var(--ink-soft)]">
              <p className="font-semibold text-[var(--ink)]">검색 범위를 조금 넓혀 결과를 보여드립니다.</p>
              <p className="mt-1">{searchResult.fallback.reason}</p>
            </div>
          ) : null}

          <div className="mt-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <ProductSortTabs
              pathname="/search"
              searchParams={{ q: keyword || undefined, sort, category: currentCategory || undefined }}
              currentSort={currentSort}
            />
            {currentCategory ? <Link href="/search" className="text-xs font-semibold text-[var(--primary)]">필터 초기화</Link> : null}
          </div>

          {products.length > 0 ? (
            <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-16">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="mt-9 border-y border-[var(--line)] py-14 text-center text-sm leading-7 text-[var(--ink-soft)]">
              결과가 없습니다. 다른 검색어나 카테고리로 다시 찾아보세요.
            </div>
          )}

          {totalPages > 1 ? (
            <Pagination page={currentPage} totalPages={totalPages} basePath="/search" baseParams={baseParams} />
          ) : null}
        </section>
      ) : (
        <section>
          <div className="mb-7">
            <p className="display-eyebrow">Browse by room</p>
            <h2 className="display-heading mt-3 text-3xl sm:text-4xl">공간부터 둘러보기</h2>
          </div>
          <div className="grid border-t border-[var(--line)] md:grid-cols-3">
            {categories.map((item, index) => (
              <Link
                key={item.id}
                href={`/search?category=${item.slug}`}
                className={`group border-b border-[var(--line)] py-8 md:px-7 ${index > 0 ? "md:border-l" : ""}`}
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-muted)]">0{index + 1}</p>
                <h3 className="mt-4 font-[var(--font-display)] text-2xl">{item.name}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{item.description}</p>
                <span className="mt-6 inline-block text-xs font-semibold text-[var(--primary)] group-hover:underline">살펴보기 →</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
