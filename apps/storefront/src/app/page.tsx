import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { getHomeData } from "@/lib/server-api";

export default async function HomePage() {
  const home = await getHomeData();

  return (
    <div className="grid-shell">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <article className="surface-card overflow-hidden rounded-[36px] p-8 sm:p-10">
          <p className="display-eyebrow">Storefront MVP</p>
          <h1 className="display-heading mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            {home.heroTitle}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--ink-soft)] sm:text-lg">
            {home.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/category/${home.featuredCategories[0]?.slug ?? "living"}`}
              className="button-primary px-5 py-3"
            >
              대표 카테고리 보기
            </Link>
            <Link
              href="/cart"
              className="button-secondary px-5 py-3"
            >
              장바구니 확인
            </Link>
          </div>
        </article>

        <div className="grid gap-6">
          {home.featuredCategories.slice(0, 2).map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="surface-card rounded-[30px] p-6 transition hover:translate-y-[-2px]"
              style={{
                background: `linear-gradient(135deg, ${category.accentColor}24 0%, rgba(255,255,243,0.96) 100%)`,
              }}
            >
              <p className="display-eyebrow">{category.name}</p>
              <p className="display-heading mt-3 text-2xl font-semibold">
                {category.description}
              </p>
              <p className="mt-5 text-sm font-semibold text-[var(--accent-strong)]">
                바로 보기
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface-card rounded-[36px] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="display-eyebrow">Featured Products</p>
            <h2 className="display-heading mt-3 text-3xl font-semibold">
              오늘 바로 보여줄 MVP 상품
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-[var(--ink-soft)]">
            레거시 구조 분석 결과에서 우선순위가 높은 메인, 카테고리, 상세, 주문 진입
            흐름을 검증하기 위한 대표 상품군입니다.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {home.featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

