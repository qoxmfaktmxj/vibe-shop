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

const SEARCH_CHIPS = ["여름", "리빙", "선물", "10만원 이하", "베이지"];

export default async function HomePage() {
  const emptyCollection: Awaited<ReturnType<typeof getHomeRecommendations>> = {
    context: "",
    title: "",
    subtitle: "",
    items: [],
  };
  const emptyRecentlyViewed: Awaited<ReturnType<typeof getRecentlyViewed>> = { items: [] };
  const [home, recentlyViewed, recentlyViewedRecommendations, homeRecommendations] =
    await Promise.all([
      getHomeData(),
      getRecentlyViewed().catch(() => emptyRecentlyViewed),
      getRecentlyViewedRecommendations().catch(() => emptyCollection),
      getHomeRecommendations().catch(() => emptyCollection),
    ]);
  const heroProduct = home.curatedPicks[0] ?? home.newArrivals[0] ?? home.bestSellers[0];
  const heroSection = getSection(home.displaySections, "HERO");
  const featuredCategorySection = getSection(home.displaySections, "FEATURED_CATEGORY");
  const curatedSection = getSection(home.displaySections, "CURATED_PICK");
  const newestSection = getSection(home.displaySections, "NEW_ARRIVALS");
  const bestSellerSection = getSection(home.displaySections, "BEST_SELLERS");
  const promotionSection = getSection(home.displaySections, "PROMOTION");
  const heroBanner = heroSection?.items[0] ?? null;
  const categoryCards = home.featuredCategories.slice(0, 3);

  return (
    <div className="grid-shell pb-8">

      {/* Hero — Search-first */}
      <section className="space-y-8 pt-4">
        <div className="space-y-6">
          <p
            className="text-[10px] tracking-[0.3em] uppercase text-[var(--ink-muted)]"
            style={{ fontFamily: "var(--font-display), monospace" }}
          >
            Living Atelier
          </p>
          <h1
            className="text-[clamp(3rem,8vw,5.5rem)] font-light leading-[0.95] text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display), monospace" }}
          >
            삶에 어울리는<br />오브제를 찾아보세요.
          </h1>
        </div>

        {/* Inline search */}
        <form action="/search" method="GET" className="w-full max-w-2xl">
          <div className="flex h-16 items-center justify-between border border-[var(--line)] bg-[var(--surface-card)] px-6">
            <input
              name="q"
              type="text"
              placeholder="여름 리빙 10만원 이하 베이지 선물"
              className="flex-1 bg-transparent text-base text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]"
            />
            <button
              type="submit"
              className="text-xl text-[var(--ink)] transition hover:opacity-60"
              aria-label="검색"
            >
              ↗
            </button>
          </div>
        </form>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {SEARCH_CHIPS.map((chip) => (
            <Link
              key={chip}
              href={`/search?q=${encodeURIComponent(chip)}`}
              className="border border-[var(--line)] px-4 py-2 text-xs text-[var(--ink)] transition hover:border-[var(--ink)]"
            >
              {chip}
            </Link>
          ))}
        </div>

        <Link
          href={categoryCards[0] ? `/category/${categoryCards[0].slug}` : "/search"}
          className="link-cta inline-block"
        >
          카테고리 전체 보기 ↗
        </Link>
      </section>

      {/* Category Cards */}
      {featuredCategorySection?.visible !== false ? (
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">카테고리</p>
              <h2 className="display-heading mt-3 text-4xl">
                {featuredCategorySection?.title ?? "셀렉션"}
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-[var(--ink-soft)]">
              {featuredCategorySection?.subtitle ??
                "리빙, 키친, 웰니스 — 삶에 맞는 오브제를 카테고리별로 만나보세요."}
            </p>
          </div>

          <div className="grid h-[28rem] gap-px lg:grid-cols-3">
            {categoryCards.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative overflow-hidden"
              >
                <Image
                  src={category.coverImageUrl}
                  alt={category.coverImageAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.68)] via-[rgba(0,0,0,0.1)] to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <p
                    className="text-[10px] tracking-[0.3em] uppercase text-white/70"
                    style={{ fontFamily: "var(--font-display), monospace" }}
                  >
                    {category.name}
                  </p>
                  <h2
                    className="mt-2 text-2xl font-light text-white"
                    style={{ fontFamily: "var(--font-display), monospace" }}
                  >
                    {category.heroTitle || category.description}
                  </h2>
                  <span
                    className="mt-4 text-[11px] font-bold tracking-[0.1em] uppercase text-white/80"
                    style={{ fontFamily: "var(--font-display), monospace" }}
                  >
                    EXPLORE ↗
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <RecentlyViewedShelf recentlyViewed={recentlyViewed} />
      <RecommendationShelf
        collection={recentlyViewed.items.length > 0 ? recentlyViewedRecommendations : homeRecommendations}
        eyebrow={recentlyViewed.items.length > 0 ? "이어보기" : "지금 인기있는 상품"}
      />

      {/* Hero banner or product spotlight */}
      {heroBanner || heroProduct ? (
        <section>
          <div
            className="relative overflow-hidden"
            style={{
              background: productGradient(
                heroBanner?.accentColor ?? heroProduct?.accentColor ?? "#C2956A",
              ),
              minHeight: "28rem",
            }}
          >
            {heroBanner ? (
              <Image
                src={heroBanner.imageUrl}
                alt={heroBanner.imageAlt}
                fill
                sizes="100vw"
                className="object-cover"
              />
            ) : heroProduct ? (
              <Image
                src={heroProduct.imageUrl}
                alt={heroProduct.imageAlt}
                fill
                sizes="100vw"
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.6)] via-[rgba(0,0,0,0.1)] to-transparent" />
            <div className="relative flex h-full min-h-[28rem] flex-col justify-end p-10 lg:p-16">
              <div className="max-w-md">
                <p className="display-eyebrow text-white/60">
                  {heroSection?.visible ? "기획전" : "셀렉션"}
                </p>
                <h2
                  className="mt-3 text-4xl font-light text-white"
                  style={{ fontFamily: "var(--font-display), monospace" }}
                >
                  {heroBanner?.title ?? heroProduct?.name}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/76">
                  {heroBanner?.subtitle ?? heroProduct?.summary}
                </p>
                {heroBanner ? (
                  <Link href={heroBanner.href} className="mt-6 inline-block link-cta text-white">
                    {heroBanner.ctaLabel} ↗
                  </Link>
                ) : heroProduct ? (
                  <p className="mt-4 text-lg font-light text-white" style={{ fontFamily: "var(--font-display), monospace" }}>
                    {formatPrice(heroProduct.price)}원
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {promotionSection?.visible && promotionSection.items.length > 0 ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="display-eyebrow">기획전</p>
              <h2 className="display-heading mt-3 text-4xl">
                {promotionSection.title}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
              {promotionSection.subtitle}
            </p>
          </div>

          <div className="grid gap-px lg:grid-cols-2">
            {promotionSection.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group relative overflow-hidden text-white"
                style={{
                  background: `linear-gradient(135deg, ${item.accentColor} 0%, rgba(10, 18, 28, 0.9) 100%)`,
                  minHeight: "22rem",
                }}
              >
                <div className="absolute inset-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover opacity-30 transition duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="relative flex h-full min-h-[22rem] flex-col justify-end p-8">
                  <p className="display-eyebrow text-white/60">기획전</p>
                  <h3
                    className="mt-3 text-3xl font-light text-white"
                    style={{ fontFamily: "var(--font-display), monospace" }}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/76">{item.subtitle}</p>
                  <span className="mt-5 inline-block link-cta text-white">
                    {item.ctaLabel} ↗
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
              <p className="display-eyebrow">셀렉션</p>
              <h2 className="display-heading mt-3 text-4xl">
                {curatedSection?.title ?? "엄선한 상품들"}
              </h2>
            </div>
            <Link href="/search?sort=popular" className="link-cta">
              전체 보기 ↗
            </Link>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            {curatedSection?.subtitle ?? "공간에 어울리는 오브제를 엄선해 소개합니다."}
          </p>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {home.curatedPicks.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-px lg:grid-cols-2">
        {newestSection?.visible !== false ? (
          <article className="bg-[var(--surface-card)] p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="display-eyebrow">신상품</p>
                <h2 className="display-heading mt-3 text-3xl">
                  {newestSection?.title ?? "새로 들어왔어요"}
                </h2>
              </div>
              <Link href="/search?sort=newest" className="link-cta">
                전체 보기 ↗
              </Link>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              {newestSection?.subtitle ?? "가장 최근에 입고된 상품들입니다."}
            </p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {home.newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </article>
        ) : null}

        {bestSellerSection?.visible !== false ? (
          <article className="bg-[var(--surface-card)] p-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="display-eyebrow">인기 상품</p>
                <h2 className="display-heading mt-3 text-3xl">
                  {bestSellerSection?.title ?? "많이 찾는 상품"}
                </h2>
              </div>
              <Link href="/search?sort=popular" className="link-cta">
                전체 보기 ↗
              </Link>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
              {bestSellerSection?.subtitle ?? "고객들이 가장 많이 선택한 상품들입니다."}
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
