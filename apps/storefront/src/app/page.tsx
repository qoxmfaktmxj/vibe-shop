import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { RecommendationShelf } from "@/components/recommendation/recommendation-shelf";
import { RecentlyViewedShelf } from "@/components/recommendation/recently-viewed-shelf";
import type { HomeDisplaySection } from "@/lib/contracts";
import { formatPrice } from "@/lib/currency";
import { productGradient } from "@/lib/gradient";
import {
  getHomeData,
  getHomeRecommendations,
  getRecentlyViewed,
  getRecentlyViewedRecommendations,
} from "@/lib/server-api";

function getSection(sections: HomeDisplaySection[], code: string) {
  return sections.find((section) => section.code === code);
}

export default async function HomePage() {
  const [home, recentlyViewed, recentlyViewedRecommendations, homeRecommendations] =
    await Promise.all([
      getHomeData(),
      getRecentlyViewed(),
      getRecentlyViewedRecommendations(),
      getHomeRecommendations(),
    ]);
  const heroProduct = home.curatedPicks[0] ?? home.newArrivals[0] ?? home.bestSellers[0];
  const heroSection = getSection(home.displaySections, "HERO");
  const featuredCategorySection = getSection(home.displaySections, "FEATURED_CATEGORY");
  const curatedSection = getSection(home.displaySections, "CURATED_PICK");
  const newestSection = getSection(home.displaySections, "NEW_ARRIVALS");
  const bestSellerSection = getSection(home.displaySections, "BEST_SELLERS");
  const promotionSection = getSection(home.displaySections, "PROMOTION");
  const heroBanner = heroSection?.items[0] ?? null;
  const heroHighlights = heroSection?.items.slice(1, 3) ?? [];
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
            <Link href={home.heroCtaHref} className="button-primary px-6 py-4">
              {home.heroCtaLabel}
            </Link>
            <Link href="/search" className="button-secondary px-6 py-4">
              검색으로 찾기
            </Link>
          </div>

          {heroHighlights.length > 0 ? (
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {heroHighlights.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="surface-card rounded-[28px] p-5 transition hover:-translate-y-1"
                >
                  <p className="display-eyebrow">Hero Banner</p>
                  <h2 className="display-heading mt-3 text-2xl font-semibold text-[var(--ink)]">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                    {item.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-5 text-sm text-[var(--ink-soft)] sm:grid-cols-3">
              <div>
                <p className="display-eyebrow">New Arrivals</p>
                <p className="mt-3 leading-7">
                  방금 들어온 신상품을 가장 먼저 확인할 수 있도록 정리했습니다.
                </p>
              </div>
              <div>
                <p className="display-eyebrow">Best Sellers</p>
                <p className="mt-3 leading-7">
                  많이 찾는 상품을 기준으로 지금 가장 반응이 있는 아이템을 보여줍니다.
                </p>
              </div>
              <div>
                <p className="display-eyebrow">Category Flow</p>
                <p className="mt-3 leading-7">
                  리빙, 키친, 웰니스 흐름으로 탐색 동선을 단순하게 정리했습니다.
                </p>
              </div>
            </div>
          )}
        </article>

        <div className="relative">
          <div
            className="editorial-shadow relative min-h-[34rem] overflow-hidden rounded-xl p-8 lg:p-10"
            style={{
              background: productGradient(
                heroBanner?.accentColor ?? heroProduct?.accentColor ?? "#d6512d",
              ),
            }}
          >
            {heroBanner ? (
              <Image
                src={heroBanner.imageUrl}
                alt={heroBanner.imageAlt}
                fill
                sizes="(min-width: 1024px) 32rem, 100vw"
                className="object-cover"
              />
            ) : heroProduct ? (
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
                  {heroSection?.visible ? "Display Banner" : "Curated Pick"}
                </span>
                <span className="rounded-lg bg-[rgba(255,255,255,0.18)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
                  {heroBanner ? "Campaign" : heroProduct?.categoryName}
                </span>
              </div>

              <div className="max-w-sm rounded-[28px] bg-[rgba(255,255,255,0.78)] p-6 shadow-[var(--shadow-soft)] backdrop-blur-sm">
                <p className="display-heading max-w-xs text-4xl font-semibold leading-[1.02] text-[var(--ink)]">
                  {heroBanner?.title ?? heroProduct?.name}
                </p>
                <p className="mt-3 max-w-sm leading-7 text-[var(--ink-soft)]">
                  {heroBanner?.subtitle ?? heroProduct?.summary}
                </p>
                {heroBanner ? (
                  <Link
                    href={heroBanner.href}
                    className="mt-5 inline-flex text-sm font-semibold text-[var(--primary)]"
                  >
                    {heroBanner.ctaLabel}
                  </Link>
                ) : heroProduct ? (
                  <p className="mt-4 text-base font-semibold text-[var(--primary)]">
                    {formatPrice(heroProduct.price)}원
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {featuredCategorySection?.visible !== false ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="display-eyebrow">Featured Category</p>
              <h2 className="display-heading mt-3 text-4xl font-semibold">
                {featuredCategorySection?.title ?? "카테고리 셀렉션"}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
              {featuredCategorySection?.subtitle ??
                "운영 중인 대표 카테고리를 큼직한 커버 이미지와 함께 소개합니다."}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {categoryCards.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="surface-card group relative overflow-hidden rounded-[32px] p-7 transition hover:-translate-y-1"
              >
                <div className="absolute inset-0">
                  <Image
                    src={category.coverImageUrl}
                    alt={category.coverImageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,14,22,0.72)] via-[rgba(11,14,22,0.22)] to-transparent" />
                </div>
                <div className="relative min-h-[18rem]">
                  <p className="display-eyebrow text-white/80">{category.name}</p>
                  <h2 className="display-heading mt-4 max-w-[16rem] text-3xl font-semibold text-white">
                    {category.heroTitle || category.description}
                  </h2>
                  <p className="mt-6 max-w-[18rem] text-sm leading-7 text-white/76">
                    {category.heroSubtitle}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <RecentlyViewedShelf recentlyViewed={recentlyViewed} />
      <RecommendationShelf
        collection={recentlyViewed.items.length > 0 ? recentlyViewedRecommendations : homeRecommendations}
        eyebrow={recentlyViewed.items.length > 0 ? "Continue Exploring" : "Trending for You"}
      />

      {promotionSection?.visible && promotionSection.items.length > 0 ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="display-eyebrow">Promotion</p>
              <h2 className="display-heading mt-3 text-4xl font-semibold">
                {promotionSection.title}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
              {promotionSection.subtitle}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {promotionSection.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group relative overflow-hidden rounded-[32px] p-8 text-white shadow-[var(--shadow-soft)]"
                style={{
                  background: `linear-gradient(135deg, ${item.accentColor} 0%, rgba(10, 18, 28, 0.88) 100%)`,
                }}
              >
                <div className="absolute inset-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover opacity-28 transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="relative min-h-[15rem] max-w-[20rem]">
                  <p className="display-eyebrow text-white/70">Campaign</p>
                  <h3 className="display-heading mt-4 text-3xl font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/78">{item.subtitle}</p>
                  <span className="mt-6 inline-flex text-sm font-semibold text-white">
                    {item.ctaLabel}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {curatedSection?.visible !== false ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="display-eyebrow">Curated Picks</p>
              <h2 className="display-heading mt-3 text-4xl font-semibold">
                {curatedSection?.title ?? "큐레이션 픽"}
              </h2>
            </div>
            <Link href="/search?sort=popular" className="text-sm font-medium text-[var(--primary)]">
              인기 상품 전체 보기
            </Link>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            {curatedSection?.subtitle ?? "추천 상품과 대표 상품을 중심으로 정리한 큐레이션입니다."}
          </p>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {home.curatedPicks.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        {newestSection?.visible !== false ? (
          <article className="surface-card rounded-[32px] p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="display-eyebrow">New Arrivals</p>
                <h2 className="display-heading mt-3 text-3xl font-semibold">
                  {newestSection?.title ?? "신상품 드롭"}
                </h2>
              </div>
              <Link href="/search?sort=newest" className="text-sm font-medium text-[var(--primary)]">
                최신순으로 보기
              </Link>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              {newestSection?.subtitle ?? "최근 등록된 상품을 우선 노출합니다."}
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {home.newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </article>
        ) : null}

        {bestSellerSection?.visible !== false ? (
          <article className="surface-card rounded-[32px] p-6 sm:p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="display-eyebrow">Best Sellers</p>
                <h2 className="display-heading mt-3 text-3xl font-semibold">
                  {bestSellerSection?.title ?? "베스트셀러"}
                </h2>
              </div>
              <Link href="/search?sort=popular" className="text-sm font-medium text-[var(--primary)]">
                인기순으로 보기
              </Link>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              {bestSellerSection?.subtitle ?? "인기 점수가 높은 상품을 중심으로 구성합니다."}
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {home.bestSellers.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
