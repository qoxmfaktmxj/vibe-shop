import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/catalog/product-card";
import { ProductSortTabs } from "@/components/catalog/product-sort-tabs";
import { getCategories, getProducts } from "@/lib/server-api";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const currentSort = sort?.trim() || "recommended";

  const [categories, products, newestProducts, popularProducts] = await Promise.all([
    getCategories(),
    getProducts(slug, currentSort),
    getProducts(slug, "newest"),
    getProducts(slug, "popular"),
  ]);

  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="grid-shell space-y-8">
      <section
        className="surface-card rounded-[36px] p-8 sm:p-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(241,239,233,0.72) 100%)",
        }}
      >
        <p className="display-eyebrow">{category.name}</p>
        <h1 className="display-heading mt-3 text-4xl font-semibold">{category.description}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
          취향에 맞는 상품을 차분하게 둘러보고, 이번 주 신상품과 가장 인기 있는 아이템을 함께 비교해 보세요.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="surface-card rounded-[32px] p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">New Arrivals</p>
              <h2 className="display-heading mt-3 text-3xl font-semibold">이번 주 신상품</h2>
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

        <article className="surface-card rounded-[32px] p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">Best Sellers</p>
              <h2 className="display-heading mt-3 text-3xl font-semibold">인기 상품</h2>
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
            <p className="display-eyebrow">Collection</p>
            <h2 className="display-heading mt-3 text-3xl font-semibold">전체 컬렉션</h2>
          </div>
          <ProductSortTabs
            pathname={`/category/${slug}`}
            searchParams={{ sort }}
            currentSort={currentSort}
          />
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
