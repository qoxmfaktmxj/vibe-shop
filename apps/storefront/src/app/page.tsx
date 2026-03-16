import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { formatPrice } from "@/lib/currency";
import { productGradient } from "@/lib/gradient";
import { getHomeData } from "@/lib/server-api";

export default async function HomePage() {
  const home = await getHomeData();
  const heroProduct = home.curatedPicks[0] ?? home.newArrivals[0] ?? home.bestSellers[0];
  const categoryCards = home.featuredCategories.slice(0, 3);

  return (
    <div className="grid-shell space-y-12 pb-8">
      <section className="grid min-h-[calc(100vh-13rem)] gap-10 lg:grid-cols-[minmax(0,1fr)_32rem] lg:items-center">
        <article className="max-w-2xl">
          <p className="display-eyebrow">Spring Edit 2026</p>
          <h1 className="display-heading mt-5 text-5xl font-semibold leading-[0.95] sm:text-7xl lg:text-[5.5rem]">
            {home.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[var(--ink-soft)] sm:text-lg">
            {home.heroSubtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={`/category/${categoryCards[0]?.slug ?? "living"}`}
              className="button-primary px-6 py-4"
            >
              컬렉션 보기
            </Link>
            <Link href="/search" className="button-secondary px-6 py-4">
              검색으로 찾기
            </Link>
          </div>

          <div className="mt-12 grid gap-5 text-sm text-[var(--ink-soft)] sm:grid-cols-3">
            <div>
              <p className="display-eyebrow">New Arrivals</p>
              <p className="mt-3 leading-7">방금 들어온 신상품을 가장 먼저 확인할 수 있습니다.</p>
            </div>
            <div>
              <p className="display-eyebrow">Best Sellers</p>
              <p className="mt-3 leading-7">많이 담긴 상품을 기준으로 지금 인기 있는 아이템을 보여줍니다.</p>
            </div>
            <div>
              <p className="display-eyebrow">Category Flow</p>
              <p className="mt-3 leading-7">리빙, 키친, 웰니스 흐름으로 탐색 동선을 단순하게 정리했습니다.</p>
            </div>
          </div>
        </article>

        <div className="relative">
          <div
            className="editorial-shadow relative min-h-[34rem] overflow-hidden rounded-xl p-8 lg:p-10"
            style={{ background: productGradient(heroProduct?.accentColor) }}
          >
            {heroProduct ? (
              <Image
                src={heroProduct.imageUrl}
                alt={heroProduct.imageAlt}
                fill
                sizes="(min-width: 1024px) 32rem, 100vw"
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,14,22,0.58)] via-[rgba(11,14,22,0.12)] to-transparent" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-lg bg-white/78 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
                  Curated Pick
                </span>
                <span className="rounded-lg bg-[rgba(255,255,255,0.18)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
                  {heroProduct?.categoryName}
                </span>
              </div>

              <div className="max-w-sm rounded-[28px] bg-[rgba(255,255,255,0.78)] p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm">
                <p className="display-heading max-w-xs text-4xl font-semibold leading-[1.02] text-[var(--ink)]">
                  {heroProduct?.name}
                </p>
                <p className="mt-3 max-w-sm leading-7 text-[var(--ink-soft)]">
                  {heroProduct?.summary}
                </p>
                <p className="mt-4 text-base font-semibold text-[var(--primary)]">
                  {heroProduct ? `${formatPrice(heroProduct.price)}원` : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {categoryCards.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="surface-card rounded-[32px] p-7 transition hover:-translate-y-1"
          >
            <p className="display-eyebrow">{category.name}</p>
            <h2 className="display-heading mt-4 text-3xl font-semibold text-[var(--ink)]">
              {category.description}
            </h2>
            <p className="mt-6 text-sm leading-7 text-[var(--ink-soft)]">
              카테고리별 신상품과 인기 상품을 함께 둘러볼 수 있는 전시 흐름입니다.
            </p>
          </Link>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="display-eyebrow">Curated Picks</p>
            <h2 className="display-heading mt-3 text-4xl font-semibold">큐레이션 픽</h2>
          </div>
          <Link href="/search?sort=popular" className="text-sm font-medium text-[var(--primary)]">
            인기 상품 전체 보기
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {home.curatedPicks.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="surface-card rounded-[32px] p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">New Arrivals</p>
              <h2 className="display-heading mt-3 text-3xl font-semibold">신상품 드롭</h2>
            </div>
            <Link href="/search?sort=newest" className="text-sm font-medium text-[var(--primary)]">
              최신순으로 보기
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {home.newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </article>

        <article className="surface-card rounded-[32px] p-6 sm:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">Best Sellers</p>
              <h2 className="display-heading mt-3 text-3xl font-semibold">지금 인기 있는 셀렉션</h2>
            </div>
            <Link href="/search?sort=popular" className="text-sm font-medium text-[var(--primary)]">
              인기순으로 보기
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {home.bestSellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </article>
      </section>

      <section className="surface-layer rounded-xl px-8 py-12 sm:px-10 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-5">
          <p className="display-eyebrow">Editorial Flow</p>
          <h2 className="display-heading text-4xl font-semibold text-[var(--ink)]">
            검색과 전시를 잇는 탐색 흐름
          </h2>
          <p className="max-w-md text-sm leading-7 text-[var(--ink-soft)]">
            홈 전시, 카테고리 전시, 검색 필터가 서로 이어지도록 구조를 단순하게 정리했습니다.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:mt-0">
          <Link href="/search" className="surface-card rounded-xl p-5">
            <p className="display-eyebrow">Search</p>
            <p className="display-heading mt-3 text-2xl font-semibold text-[var(--ink)]">상품 검색</p>
          </Link>
          <Link href={`/category/${categoryCards[0]?.slug ?? "living"}`} className="surface-card rounded-xl p-5">
            <p className="display-eyebrow">Category</p>
            <p className="display-heading mt-3 text-2xl font-semibold text-[var(--ink)]">카테고리 전시</p>
          </Link>
          <Link href="/orders" className="surface-card rounded-xl p-5">
            <p className="display-eyebrow">Orders</p>
            <p className="display-heading mt-3 text-2xl font-semibold text-[var(--ink)]">주문 흐름 확인</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
