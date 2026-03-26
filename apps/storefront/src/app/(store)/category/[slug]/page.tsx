import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/catalog/product-card";
import { ProductSortTabs } from "@/components/catalog/product-sort-tabs";
import { SearchForm } from "@/components/search/search-form";
import { Pagination } from "@/components/ui/pagination";
import { getCategories, getProducts } from "@/lib/server-api";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  const { slug } = await params;
  const { sort, page: pageParam } = await searchParams;
  const currentSort = sort?.trim() || "recommended";
  const currentPage = Math.max(1, Number(pageParam) || 1);

  const [categories, productsResponse, newestResponse, popularResponse] = await Promise.all([
    getCategories(),
    getProducts(slug, currentSort, currentPage - 1, 20),
    getProducts(slug, "newest", 0, 4),
    getProducts(slug, "popular", 0, 4),
  ]);

  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const products = productsResponse.items;
  const totalPages = productsResponse.totalPages;

  const newestProducts = newestResponse.items;
  const popularProducts = popularResponse.items;

  const baseParams: Record<string, string> = {};
  if (currentSort !== "recommended") baseParams.sort = currentSort;

  return (
    <div className="grid-shell space-y-8">
      <section className="surface-card relative overflow-hidden rounded-[36px] p-8 sm:p-10">
        <div className="absolute inset-0">
          <Image
            src={category.coverImageUrl}
            alt={category.coverImageAlt}
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(11,14,22,0.82)] via-[rgba(11,14,22,0.48)] to-[rgba(11,14,22,0.12)]" />
        </div>

        <div className="relative max-w-2xl text-white">
          <p className="display-eyebrow text-white/70">{category.name}</p>
          <h1 className="display-heading mt-3 text-4xl">
            {category.heroTitle || category.description}
          </h1>
          <p className="mt-4 text-sm leading-7 text-white/78">
            {category.heroSubtitle || category.description}
          </p>
        </div>
      </section>

      <section className="surface-card rounded-[36px] p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="display-eyebrow">카테고리 검색</p>
          <h2 className="display-heading mt-3 text-3xl">원하는 상품을 카테고리 안에서도 바로 찾아보세요.</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
            현재 카테고리를 유지한 채로 검색어를 바꾸면 다른 상품도 함께 확인할 수 있습니다.
          </p>
        </div>

        <div className="mt-6">
          <SearchForm categories={categories} initialCategory={slug} />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="surface-card rounded-none p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">신상품</p>
              <h2 className="display-heading mt-3 text-3xl">이번 주 신상품</h2>
            </div>
            <Link href={`/category/${slug}?sort=newest`} className="text-sm font-medium text-[var(--primary)]">
              최신순으로 보기
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {newestProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </article>

        <article className="surface-card rounded-none p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">인기</p>
              <h2 className="display-heading mt-3 text-3xl">인기 상품</h2>
            </div>
            <Link href={`/category/${slug}?sort=popular`} className="text-sm font-medium text-[var(--primary)]">
              인기순으로 보기
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {popularProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </article>
      </section>

      <section className="surface-card rounded-[36px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="display-eyebrow">전체</p>
            <h2 className="display-heading mt-3 text-3xl">전체 컬렉션</h2>
          </div>
          <ProductSortTabs
            pathname={`/category/${slug}`}
            searchParams={{ sort }}
            currentSort={currentSort}
          />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            basePath={`/category/${slug}`}
            baseParams={baseParams}
          />
        )}
      </section>
    </div>
  );
}
