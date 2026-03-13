import { notFound } from "next/navigation";

import { ProductCard } from "@/components/catalog/product-card";
import { getCategories, getProducts } from "@/lib/server-api";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(slug),
  ]);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="grid-shell">
      <section
        className="surface-card rounded-[36px] p-8 sm:p-10"
        style={{
          background: `linear-gradient(135deg, ${category.accentColor}30 0%, rgba(255,252,247,0.92) 100%)`,
        }}
      >
        <p className="display-eyebrow">{category.name}</p>
        <h1 className="display-heading mt-3 text-4xl font-semibold">
          {category.description}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
          1차 MVP에서는 카테고리 탐색, 상세 진입, 장바구니 이동 흐름을 우선 검증합니다.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
}

