import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { RecommendationShelf } from "@/components/recommendation/recommendation-shelf";
import { RecentlyViewedShelf } from "@/components/recommendation/recently-viewed-shelf";
import type { HomeDisplaySection } from "@/lib/contracts";
import { formatPrice } from "@/lib/currency";
import {
  getHomeData,
  getHomeRecommendations,
  getRecentlyViewed,
  getRecentlyViewedRecommendations,
} from "@/lib/server-api";

const SEARCH_CHIPS = ["여름", "리빙", "키친", "웰니스", "신상품", "베스트"];

const MAIN_DISPLAY_TITLE = "공간에 어울리는 오브제를 만나보세요";
const MAIN_DISPLAY_SUBTITLE = "취향에 맞는 인테리어 아이템, MARU에서 쉽고 편하게 찾아보세요.";

const MAIN_BAD_COPY_PATTERNS = [
  "운영자가 직접 수정한 메인 카피입니다.",
  "오늘 메인에서 가장 먼저 보여줄 장면과 상품을 한 화면에 담았습니다.",
  "Ops Edit 1774402391338",
];

const FEATURED_CATEGORY_TITLE = "카테고리";
const FEATURED_CATEGORY_SUBTITLE = "관심 있는 공간을 골라보세요.";

const DEFAULT_EYEBROW_BAD_COPY = ["추천 상품", "실시간 인기"];

function getSection(sections: HomeDisplaySection[], code: string) {
  return sections.find((section) => section.code === code);
}

function normalizeCopy(value: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  if ([...MAIN_BAD_COPY_PATTERNS, ...DEFAULT_EYEBROW_BAD_COPY].some((token) => value.includes(token))) {
    return fallback;
  }

  return value;
}

function sectionValue(
  section: HomeDisplaySection | undefined,
  field: "title" | "subtitle",
  fallback: string,
) {
  if (!section?.[field]) {
    return fallback;
  }

  return normalizeCopy(section[field], fallback);
}

export default async function HomePage() {
  const emptyCollection: Awaited<ReturnType<typeof getHomeRecommendations>> = {
    context: "",
    title: "",
    subtitle: "",
    items: [],
  };
  const emptyRecentlyViewed: Awaited<ReturnType<typeof getRecentlyViewed>> = { items: [] };
  const emptyHome = {
    heroTitle: "",
    heroSubtitle: "",
    heroCtaLabel: "",
    heroCtaHref: "",
    displaySections: [],
    featuredCategories: [],
    curatedPicks: [],
    newArrivals: [],
    bestSellers: [],
  } as Awaited<ReturnType<typeof getHomeData>>;
  const [home, recentlyViewed, recentlyViewedRecommendations, homeRecommendations] =
    await Promise.all([
      getHomeData().catch(() => emptyHome),
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

  const heroTitle = normalizeCopy(home.heroTitle, MAIN_DISPLAY_TITLE);
  const heroSubtitle = normalizeCopy(home.heroSubtitle, MAIN_DISPLAY_SUBTITLE);

  return (
    <div className="grid-shell pb-8 sm:pb-10">
      {/* ── Hero Section ── */}
      <section className="animate-entrance">
        {/* Hero Banner (full-width image) */}
        {(heroBanner || heroProduct) ? (
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] sm:rounded-[24px]" style={{ minHeight: "420px" }}>
            <div className="absolute inset-0">
              {heroBanner ? (
                <Image
                  src={heroBanner.imageUrl}
                  alt={heroBanner.imageAlt}
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover"
                />
              ) : heroProduct ? (
                <Image
                  src={heroProduct.imageUrl}
                  alt={heroProduct.imageAlt}
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            <div className="relative flex min-h-[420px] flex-col justify-end p-6 text-white sm:min-h-[480px] sm:p-10 lg:min-h-[540px] lg:p-14">
              <div className="max-w-xl">
                <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                  {sectionValue(heroSection, "title", heroBanner ? "기획전" : "큐레이션")}
                </p>
                <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                  {normalizeCopy(heroBanner?.title || heroProduct?.name || "", "오늘의 추천")}
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                  {normalizeCopy(
                    heroBanner?.subtitle || heroProduct?.summary || "",
                    "매일 사용하는 공간에 어울리는 구성을 제안합니다.",
                  )}
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href={heroBanner?.href ?? `/products/${heroProduct?.slug ?? ""}`}
                    className="inline-flex items-center justify-center rounded-[var(--radius)] bg-white px-6 py-3 text-sm font-bold text-[var(--ink)] transition hover:bg-white/90"
                  >
                    {normalizeCopy((heroBanner?.ctaLabel || home.heroCtaLabel || "").trim(), "둘러보기")}
                  </Link>
                  {heroProduct ? (
                    <p className="text-lg font-bold text-white/90">
                      {formatPrice(heroProduct.price)}원
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Headline + Search area */}
        <div className="mt-8 sm:mt-10">
          <h2 className="text-2xl font-bold leading-snug text-[var(--ink)] sm:text-3xl">
            {heroTitle}
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--ink-soft)] sm:text-base">
            {heroSubtitle}
          </p>

          <form action="/search" method="GET" className="mt-5 max-w-lg">
            <div className="flex items-center gap-2 rounded-[var(--radius)] border border-[var(--line)] bg-white px-4 py-2.5 shadow-[var(--shadow-sm)] transition focus-within:border-[var(--primary)] focus-within:shadow-[0_0_0_3px_var(--primary-soft)]">
              <svg className="h-4 w-4 shrink-0 text-[var(--ink-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                name="q"
                type="text"
                placeholder="상품명, 카테고리, 키워드로 검색"
                className="min-w-0 flex-1 bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]"
              />
              <button type="submit" className="rounded-[var(--radius-sm)] bg-[var(--primary)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--primary-hover)]">
                검색
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {SEARCH_CHIPS.map((chip) => (
              <Link
                key={chip}
                href={`/search?q=${encodeURIComponent(chip)}`}
                className="rounded-full border border-[var(--line)] bg-white px-3.5 py-2 text-xs font-medium text-[var(--ink-soft)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              >
                {chip}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Categories ── */}
      {featuredCategorySection?.visible !== false && categoryCards.length > 0 ? (
        <section className="animate-entrance-delay-1 space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--ink)] sm:text-2xl">
                {sectionValue(featuredCategorySection, "title", FEATURED_CATEGORY_TITLE)}
              </h2>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                {sectionValue(featuredCategorySection, "subtitle", FEATURED_CATEGORY_SUBTITLE)}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categoryCards.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative overflow-hidden rounded-[var(--radius-lg)] sm:rounded-[var(--radius-xl)]"
              >
                <div className="relative aspect-[3/4] sm:aspect-[4/5]">
                  <Image
                    src={category.coverImageUrl}
                    alt={category.coverImageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                    <h3 className="text-lg font-bold sm:text-xl">
                      {category.heroTitle || category.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/75">
                      {category.heroSubtitle || category.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Curated Picks ── */}
      {curatedSection?.visible !== false && home.curatedPicks.length > 0 ? (
        <section className="animate-entrance-delay-2 space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--ink)] sm:text-2xl">
              {sectionValue(curatedSection, "title", "추천 상품")}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {home.curatedPicks.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <RecentlyViewedShelf recentlyViewed={recentlyViewed} />
      <RecommendationShelf
        collection={recentlyViewed.items.length > 0 ? recentlyViewedRecommendations : homeRecommendations}
        eyebrow={recentlyViewed.items.length > 0 ? "다시 보기" : "추천"}
      />

      {/* ── Promotions ── */}
      {promotionSection?.visible && promotionSection.items.length > 0 ? (
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--ink)] sm:text-2xl">
              {sectionValue(promotionSection, "title", "진행 중인 기획전")}
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {promotionSection.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group relative overflow-hidden rounded-[var(--radius-lg)]"
              >
                <div className="relative min-h-[240px] sm:min-h-[300px]">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                    <h3 className="text-xl font-bold sm:text-2xl">{item.title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">{item.subtitle}</p>
                    <span className="mt-4 inline-flex rounded-[var(--radius-sm)] bg-white px-4 py-2.5 text-sm font-bold text-[var(--ink)]">
                      {item.ctaLabel}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── New Arrivals ── */}
      {newestSection?.visible !== false && home.newArrivals.length > 0 ? (
        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-bold text-[var(--ink)] sm:text-2xl">
              {sectionValue(newestSection, "title", "신상품")}
            </h2>
            <p className="hidden text-sm text-[var(--ink-soft)] sm:block">
              {sectionValue(newestSection, "subtitle", "지금 막 들어온 상품들을 둘러보세요.")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {home.newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Best Sellers ── */}
      {bestSellerSection?.visible !== false && home.bestSellers.length > 0 ? (
        <section className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--ink)] sm:text-2xl">
              {sectionValue(bestSellerSection, "title", "베스트셀러")}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {home.bestSellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
