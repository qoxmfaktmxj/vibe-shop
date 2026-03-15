import { notFound } from "next/navigation";

import { ProductSortTabs } from "@/components/catalog/product-sort-tabs";
import { ProductCard } from "@/components/catalog/product-card";
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
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(slug, currentSort),
  ]);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="grid-shell">
      <section
        className="surface-card rounded-[36px] p-8 sm:p-10"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(241,239,233,0.72) 100%)" }}
      >
        <p className="display-eyebrow">{category.name}</p>
        <h1 className="display-heading mt-3 text-4xl font-semibold">
          {category.description}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
          취향에 맞는 상품을 차분하게 둘러보고 원하는 제품을 골라보세요.
        </p>
        <div className="mt-6">
          <ProductSortTabs
            pathname={`/category/${slug}`}
            searchParams={{ sort }}
            currentSort={currentSort}
          />
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
}

