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

const SEARCH_CHIPS = ["여름", "리빙", "키친", "웰니스", "신상품", "베스트"];

const MAIN_DISPLAY_TITLE = "지금 머무는 공간에 어울리는 셀렉션";
const MAIN_DISPLAY_SUBTITLE = "취향에 맞는 오브제로 시작하는 쇼핑, 한 번에 둘러보세요.";

const MAIN_BAD_COPY_PATTERNS = [
  "운영자가 직접 수정한 메인 카피입니다.",
  "오늘 메인에서 가장 먼저 보여줄 장면과 상품을 한 화면에 담았습니다.",
  "Ops Edit 1774402391338",
];

const FEATURED_CATEGORY_TITLE = "카테고리 셀렉션";
const FEATURED_CATEGORY_SUBTITLE = "운영 중인 주요 카테고리를 편하게 살펴볼 수 있도록 구성했습니다.";

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
    <div className="grid-shell pb-10">
      <section className="grid gap-6 pt-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]">
        <div className="surface-card editorial-shadow rounded-[40px] border border-[var(--line)] p-8 sm:p-10 lg:p-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              큐레이션 홈
            </span>
            <span className="rounded-full bg-[var(--secondary-soft)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--secondary)]">
              리빙 아틀리에
            </span>
          </div>

          <h1 className="display-heading mt-8 max-w-4xl text-[clamp(3.2rem,8vw,6rem)] text-[var(--ink)]">
            {heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
            {heroSubtitle}
          </p>

          <form action="/search" method="GET" className="mt-8 max-w-2xl">
            <div className="flex flex-col gap-3 rounded-[28px] border border-[var(--line)] bg-white px-5 py-5 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center">
              <input
                name="q"
                type="text"
                placeholder="상품명, 카테고리, 키워드로 검색"
                className="min-w-0 flex-1 bg-transparent text-base text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]"
              />
              <button type="submit" className="button-primary px-6 py-4">
                검색
              </button>
            </div>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {SEARCH_CHIPS.map((chip) => (
              <Link
                key={chip}
                href={`/search?q=${encodeURIComponent(chip)}`}
                className="rounded-full border border-[var(--line)] bg-[var(--surface-card)] px-4 py-2 text-xs font-medium text-[var(--ink)] transition hover:-translate-y-[1px] hover:border-[var(--ink)]"
              >
                {chip}
              </Link>
            ))}
          </div>
        </div>

        {(heroBanner || heroProduct) ? (
          <div
            className="relative overflow-hidden rounded-[40px] border border-[var(--line)] text-white editorial-shadow"
            style={{
              background: productGradient(heroBanner?.accentColor ?? heroProduct?.accentColor ?? "#C2956A"),
              minHeight: "40rem",
            }}
          >
            <div className="absolute inset-0">
              {heroBanner ? (
                <Image
                  src={heroBanner.imageUrl}
                  alt={heroBanner.imageAlt}
                  fill
                  sizes="(min-width: 1280px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : heroProduct ? (
                <Image
                  src={heroProduct.imageUrl}
                  alt={heroProduct.imageAlt}
                  fill
                  sizes="(min-width: 1280px) 40vw, 100vw"
                  className="object-cover"
                />
              ) : null}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,16,20,0.08),rgba(12,16,20,0.74))]" />
            </div>

            <div className="relative flex h-full min-h-[40rem] flex-col justify-between p-8 sm:p-10 lg:p-12">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="display-eyebrow text-white/70">{heroBanner ? "기획전" : "큐레이션"}</p>
                  <p className="mt-3 max-w-xs text-sm leading-7 text-white/72">
                    오늘의 하이라이트를 한눈에 살펴보세요.
                  </p>
                </div>
                <div className="rounded-full border border-white/16 bg-white/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                  마루 셀렉트
                </div>
              </div>

              <div className="max-w-lg">
                <p className="display-eyebrow text-white/60">
                  {sectionValue(heroSection, "title", heroBanner ? "기획전" : "큐레이션")}
                </p>
                <h2 className="mt-4 text-[clamp(2.5rem,5vw,4rem)] font-light leading-[0.94]">
                  {normalizeCopy(heroBanner?.title || heroProduct?.name || "", "오늘의 추천")}
                </h2>
                <p className="mt-4 text-sm leading-8 text-white/78">
                  {normalizeCopy(
                    heroBanner?.subtitle || heroProduct?.summary || "",
                    "매일 사용하는 공간에 자연스럽게 어울리는 구성을 제안합니다.",
                  )}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Link
                    href={heroBanner?.href ?? `/products/${heroProduct?.slug ?? ""}`}
                    className="inline-flex items-center justify-center rounded-full bg-white px-6 py-4 text-sm font-semibold text-black transition hover:-translate-y-[1px]"
                  >
                    {normalizeCopy((heroBanner?.ctaLabel || home.heroCtaLabel || "").trim(), "둘러보기")}
                  </Link>
                  {heroProduct ? (
                    <p className="text-base font-semibold text-white/88">
                      {formatPrice(heroProduct.price)}원
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {featuredCategorySection?.visible !== false ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="display-eyebrow">카테고리</p>
              <h2 className="display-heading mt-3 text-4xl">
                {sectionValue(featuredCategorySection, "title", FEATURED_CATEGORY_TITLE)}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
              {sectionValue(featuredCategorySection, "subtitle", FEATURED_CATEGORY_SUBTITLE)}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {categoryCards.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="group relative overflow-hidden rounded-[32px] border border-[var(--line)]"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={category.coverImageUrl}
                    alt={category.coverImageAlt}
                    fill
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,18,0.1),rgba(8,12,18,0.72))]" />
                  <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                    <p className="display-eyebrow text-white/68">카테고리</p>
                    <h3 className="mt-3 text-3xl font-light leading-tight">
                      {category.heroTitle || category.name}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/78">
                      {category.heroSubtitle || category.description}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/84">
                      자세히 보기
                      <span aria-hidden>+</span>
                    </span>
                  </div>
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
              <p className="display-eyebrow">추천 상품</p>
              <h2 className="display-heading mt-3 text-4xl">
                {sectionValue(curatedSection, "title", "추천 상품")}
              </h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {home.curatedPicks.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <RecentlyViewedShelf recentlyViewed={recentlyViewed} />
      <RecommendationShelf
        collection={recentlyViewed.items.length > 0 ? recentlyViewedRecommendations : homeRecommendations}
        eyebrow={recentlyViewed.items.length > 0 ? "다시 보기" : "추천 상품"}
      />

      {promotionSection?.visible && promotionSection.items.length > 0 ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="display-eyebrow">기획전</p>
              <h2 className="display-heading mt-3 text-4xl">
                {sectionValue(promotionSection, "title", "진행 중인 기획전")}
              </h2>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {promotionSection.items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="group relative overflow-hidden rounded-[32px] border border-[var(--line)]"
              >
                <div className="relative min-h-[320px]">
                  <Image
                    src={item.imageUrl}
                    alt={item.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,16,20,0.06),rgba(12,16,20,0.76))]" />
                  <div className="absolute inset-x-0 bottom-0 p-8 text-white">
                    <p className="display-eyebrow text-white/68">
                      {sectionValue(promotionSection, "title", "기획전")}
                    </p>
                    <h3 className="mt-3 text-3xl font-light leading-tight">{item.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-white/76">{item.subtitle}</p>
                    <span className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
                      {item.ctaLabel}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {newestSection?.visible !== false ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="display-eyebrow">새로 들어온 상품</p>
              <h2 className="display-heading mt-3 text-4xl">
                {sectionValue(newestSection, "title", "신상품")}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
              {sectionValue(newestSection, "subtitle", "지금 막 들어온 상품들을 편하게 둘러보세요.")}
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {home.newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {bestSellerSection?.visible !== false ? (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="display-eyebrow">인기 상품</p>
              <h2 className="display-heading mt-3 text-4xl">
                {sectionValue(bestSellerSection, "title", "베스트셀러")}
              </h2>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {home.bestSellers.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
