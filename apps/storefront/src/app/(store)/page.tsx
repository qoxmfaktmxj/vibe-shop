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

const MAIN_BAD_COPY_PATTERNS = [
  "운영자가 직접 수정한 메인 카피입니다.",
  "운영 메인 카피",
  "오늘 메인에서 가장 먼저 보여줄 장면과 상품을 한 화면에 담았습니다.",
  "Ops Edit 1774402391338",
  "추천 상품",
  "실시간 인기",
];

function getSection(sections: HomeDisplaySection[], code: string) {
  return sections.find((section) => section.code === code);
}

function normalizeCopy(value: string | null | undefined, fallback: string) {
  if (!value || MAIN_BAD_COPY_PATTERNS.some((token) => value.includes(token))) {
    return fallback;
  }

  return value;
}

function sectionValue(
  section: HomeDisplaySection | undefined,
  field: "title" | "subtitle",
  fallback: string,
) {
  return normalizeCopy(section?.[field], fallback);
}

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
      getHomeData().catch(() => null),
      getRecentlyViewed().catch(() => emptyRecentlyViewed),
      getRecentlyViewedRecommendations().catch(() => emptyCollection),
      getHomeRecommendations().catch(() => emptyCollection),
    ]);

  if (!home) {
    return (
      <section role="alert" className="mx-auto my-20 w-full max-w-xl border-y border-[var(--line)] py-14 text-center">
        <h1 className="display-heading text-3xl">상품을 불러오지 못했습니다.</h1>
        <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
          잠시 후 다시 시도해 주세요. 문제가 계속되면 고객지원에 알려 주세요.
        </p>
        <Link href="/" className="button-primary mt-7 px-6 py-3">다시 시도</Link>
      </section>
    );
  }

  const heroSection = getSection(home.displaySections, "HERO");
  const categorySection = getSection(home.displaySections, "FEATURED_CATEGORY");
  const curatedSection = getSection(home.displaySections, "CURATED_PICK");
  const newestSection = getSection(home.displaySections, "NEW_ARRIVALS");
  const promotionSection = getSection(home.displaySections, "PROMOTION");
  const heroBanner = heroSection?.items[0] ?? null;
  const heroProduct = home.curatedPicks[0] ?? home.newArrivals[0] ?? home.bestSellers[0];
  const categoryCards = home.featuredCategories.slice(0, 3);
  const story = promotionSection?.visible ? promotionSection.items[0] : null;
  const heroHref = heroBanner?.href ?? (heroProduct ? `/products/${heroProduct.slug}` : "/search");

  return (
    <div className="grid-shell pb-6 sm:pb-10">
      {(heroBanner || heroProduct) ? (
        <section className="animate-entrance relative min-h-[68svh] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface-low)] lg:min-h-[72svh]">
          <Image
            src={heroBanner?.imageUrl ?? heroProduct!.imageUrl}
            alt={heroBanner?.imageAlt ?? heroProduct!.imageAlt}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[oklch(0.16_0.018_45/0.4)]" />
          <div className="relative flex min-h-[68svh] items-end p-6 text-[var(--surface)] sm:p-10 lg:min-h-[72svh] lg:p-16">
            <div className="max-w-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[oklch(0.95_0.01_80/0.78)]">
                MARU Living Collection
              </p>
              <h1 className="display-heading mt-5 text-4xl leading-[1.12] text-[var(--surface)] sm:text-5xl lg:text-6xl">
                {normalizeCopy(heroBanner?.title ?? home.heroTitle, "머무는 시간이 더 좋아지는 오브제")}
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-[oklch(0.96_0.01_80/0.84)] sm:text-base">
                {normalizeCopy(
                  heroBanner?.subtitle ?? home.heroSubtitle,
                  "좋은 소재와 편안한 형태로, 매일의 공간을 오래 사랑할 수 있게 합니다.",
                )}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link href={heroHref} className="overlay-cta min-h-11 px-6 py-3">
                  {normalizeCopy(heroBanner?.ctaLabel ?? home.heroCtaLabel, "컬렉션 보기")}
                </Link>
                {heroProduct ? (
                  <span className="text-sm font-medium tracking-[0.04em] text-[oklch(0.96_0.01_80/0.86)]">
                    {formatPrice(heroProduct.price)}원부터
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-8 border-y border-[var(--line)] py-14 sm:py-20 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
        <p className="display-eyebrow">The MARU Point of View</p>
        <div>
          <h2 className="display-heading max-w-3xl text-3xl sm:text-4xl lg:text-5xl">
            편안함은 보이는 것이 아니라, 오래 머물고 싶은 감각입니다.
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--ink-soft)] sm:text-base">
            과장된 장식 대신 손에 닿는 소재, 몸을 받치는 형태, 시간이 지나도 자연스러운 색을 고릅니다.
          </p>
        </div>
      </section>

      {categorySection?.visible !== false && categoryCards.length > 0 ? (
        <section className="animate-entrance-delay-1">
          <div className="mb-8 grid gap-3 sm:mb-10 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="display-eyebrow">Ways to live</p>
              <h2 className="display-heading mt-3 text-3xl sm:text-4xl">
                {sectionValue(categorySection, "title", "공간으로 고르기")}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[var(--ink-soft)] lg:justify-self-end">
              {sectionValue(categorySection, "subtitle", "생활의 장면에서 시작해 나에게 맞는 오브제를 발견해 보세요.")}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-12 lg:grid-rows-2">
            {categoryCards.map((category, index) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={[
                  "group relative min-h-[360px] overflow-hidden bg-[var(--surface-low)] lg:min-h-0",
                  index === 0 ? "lg:col-span-7 lg:row-span-2 lg:aspect-[4/5]" : "lg:col-span-5 lg:aspect-[16/10]",
                ].join(" ")}
              >
                <Image
                  src={category.coverImageUrl}
                  alt={category.coverImageAlt}
                  fill
                  sizes={index === 0 ? "(min-width: 1024px) 58vw, 100vw" : "(min-width: 1024px) 42vw, 100vw"}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-[oklch(0.15_0.018_45/0.28)]" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-[var(--surface)] sm:p-8">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[oklch(0.96_0.01_80/0.72)]">0{index + 1}</p>
                  <h3 className="mt-2 font-[var(--font-display)] text-2xl sm:text-3xl">
                    {category.heroTitle || category.name}
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[oklch(0.96_0.01_80/0.78)]">
                    {category.heroSubtitle || category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {curatedSection?.visible !== false && home.curatedPicks.length > 0 ? (
        <section className="animate-entrance-delay-2">
          <div className="mb-8 flex items-end justify-between gap-5 border-b border-[var(--line)] pb-5 sm:mb-10">
            <div>
              <p className="display-eyebrow">The edit</p>
              <h2 className="display-heading mt-3 text-3xl sm:text-4xl">
                {sectionValue(curatedSection, "title", "이번 계절의 선택")}
              </h2>
            </div>
            <Link href="/search" className="hidden text-xs font-semibold tracking-[0.08em] text-[var(--ink-soft)] hover:text-[var(--primary)] sm:block">
              전체 보기 →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
            {home.curatedPicks.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {recentlyViewed.items.length > 0 ? (
        <div className="space-y-20 border-t border-[var(--line)] pt-16 sm:space-y-24 sm:pt-20">
          <RecentlyViewedShelf recentlyViewed={recentlyViewed} />
          <RecommendationShelf
            collection={recentlyViewedRecommendations.items.length > 0 ? recentlyViewedRecommendations : homeRecommendations}
            eyebrow="이어지는 선택"
          />
        </div>
      ) : null}

      {story ? (
        <section className="grid overflow-hidden bg-[var(--ink)] text-[var(--surface)] lg:grid-cols-2">
          <div className="relative min-h-[420px] lg:min-h-[600px]">
            <Image src={story.imageUrl} alt={story.imageAlt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center px-7 py-14 sm:px-12 lg:px-16">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[oklch(0.9_0.01_80/0.68)]">Material story</p>
            <h2 className="display-heading mt-5 text-3xl text-[var(--surface)] sm:text-4xl lg:text-5xl">{story.title}</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[oklch(0.92_0.01_80/0.72)] sm:text-base">{story.subtitle}</p>
            <Link href={story.href} className="mt-8 w-fit border-b border-[var(--surface)] pb-1 text-sm font-semibold">{story.ctaLabel}</Link>
          </div>
        </section>
      ) : null}

      {newestSection?.visible !== false && home.newArrivals.length > 0 ? (
        <section>
          <div className="mb-8 flex items-end justify-between gap-5 border-b border-[var(--line)] pb-5 sm:mb-10">
            <div>
              <p className="display-eyebrow">Just arrived</p>
              <h2 className="display-heading mt-3 text-3xl sm:text-4xl">
                {sectionValue(newestSection, "title", "새롭게 도착한 오브제")}
              </h2>
            </div>
            <p className="hidden max-w-md text-right text-sm leading-6 text-[var(--ink-soft)] md:block">
              {sectionValue(newestSection, "subtitle", "이번 주 새롭게 선보이는 소재와 형태를 만나보세요.")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
            {home.newArrivals.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section aria-label="MARU 서비스" className="grid border-y border-[var(--line)] md:grid-cols-3">
        {[
          ["Complimentary delivery", "전국 무료배송", "안전한 포장과 배송 과정을 안내합니다."],
          ["Living concierge", "리빙 컨시어지", "공간과 선물에 맞는 상품 선택을 도와드립니다."],
          ["Considered care", "오래 쓰는 관리", "소재별 관리와 교환·반품을 차분히 지원합니다."],
        ].map(([eyebrow, title, description], index) => (
          <div key={eyebrow} className={`py-9 md:px-8 md:py-10 ${index > 0 ? "border-t border-[var(--line)] md:border-l md:border-t-0" : ""}`}>
            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted)]">{eyebrow}</p>
            <h2 className="mt-3 font-[var(--font-display)] text-xl">{title}</h2>
            <p className="mt-2 text-xs leading-6 text-[var(--ink-soft)]">{description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
