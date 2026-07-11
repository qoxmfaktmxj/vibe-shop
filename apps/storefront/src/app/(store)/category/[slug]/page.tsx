import Image from "next/image";
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
  const [categories, productsResponse] = await Promise.all([
    getCategories(),
    getProducts(slug, currentSort, currentPage - 1, 20),
  ]);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const baseParams: Record<string, string> = {};
  if (currentSort !== "recommended") baseParams.sort = currentSort;

  return (
    <div className="grid-shell pb-6 sm:pb-10">
      <section className="relative min-h-[58svh] overflow-hidden bg-[var(--surface-low)] lg:min-h-[64svh]">
        <Image
          src={category.coverImageUrl}
          alt={category.coverImageAlt}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[oklch(0.15_0.018_45/0.36)]" />
        <div className="relative flex min-h-[58svh] items-end p-6 text-[var(--surface)] sm:p-10 lg:min-h-[64svh] lg:p-14">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[oklch(0.96_0.01_80/0.74)]">{category.name} collection</p>
            <h1 className="display-heading mt-4 text-4xl text-[var(--surface)] sm:text-5xl lg:text-6xl">
              {category.heroTitle || category.description}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[oklch(0.96_0.01_80/0.82)] sm:text-base">
              {category.heroSubtitle || category.description}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <p className="display-eyebrow">Explore the collection</p>
            <h2 className="display-heading mt-3 text-3xl sm:text-4xl">{category.name}의 모든 선택</h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)] lg:justify-self-end">
            소재와 형태를 비교하고, 공간에 오래 머물 한 가지를 차분히 골라보세요.
          </p>
        </div>

        <div className="mt-8">
          <SearchForm categories={categories} initialCategory={slug} />
        </div>

        <div className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <p className="text-xs tracking-[0.06em] text-[var(--ink-muted)]">
            총 {productsResponse.totalItems}개 · {productsResponse.items.length}개 표시
          </p>
          <ProductSortTabs
            pathname={`/category/${slug}`}
            searchParams={{ sort }}
            currentSort={currentSort}
          />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-16">
          {productsResponse.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {productsResponse.totalPages > 1 ? (
          <Pagination
            page={currentPage}
            totalPages={productsResponse.totalPages}
            basePath={`/category/${slug}`}
            baseParams={baseParams}
          />
        ) : null}
      </section>
    </div>
  );
}
