import Link from "next/link";

import { Arrow, CinematicCollections, CinematicHero, CinematicStory, ProductEntrance } from "@/components/home/cinematic-home";
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
        <div className="mt-7 flex flex-wrap justify-center gap-4">
          <Link href="/" className="button-primary px-6 py-3">다시 시도</Link>
          <Link href="/faq" className="button-secondary px-6 py-3">쇼핑 도움말</Link>
        </div>
      </section>
    );
  }

  const heroSection = getSection(home.displaySections, "HERO");
  const categorySection = getSection(home.displaySections, "FEATURED_CATEGORY");
  const curatedSection = getSection(home.displaySections, "CURATED_PICK");
  const newestSection = getSection(home.displaySections, "NEW_ARRIVALS");
  const promotionSection = getSection(home.displaySections, "PROMOTION");
  const heroBanner = heroSection?.visible !== false ? heroSection?.items[0] ?? null : null;
  const heroProduct = home.curatedPicks[0] ?? home.newArrivals[0] ?? home.bestSellers[0];
  const categoryCards = home.featuredCategories.slice(0, 3);
  const story = promotionSection?.visible ? promotionSection.items[0] : null;
  const heroHref = heroBanner?.href ?? (heroProduct ? `/products/${heroProduct.slug}` : "/search");
  const heroCtaLabel = normalizeCopy(heroBanner?.ctaLabel ?? home.heroCtaLabel, "컬렉션 보기");
  const heroActionLabel = heroHref.startsWith("/products/") && heroCtaLabel === "컬렉션 보기"
    ? "상품 자세히 보기"
    : heroCtaLabel;

  return (
    <div className="cinema-home">
      {heroSection?.visible !== false && (heroBanner || heroProduct) ? (
        <CinematicHero
          imageUrl={heroBanner?.imageUrl ?? heroProduct!.imageUrl}
          imageAlt={heroBanner?.imageAlt ?? heroProduct!.imageAlt}
          title={normalizeCopy(heroBanner?.title ?? home.heroTitle, "머무는 시간이 더 좋아지는 오브제")}
          subtitle={normalizeCopy(heroBanner?.subtitle ?? home.heroSubtitle, "좋은 소재와 편안한 형태로, 매일의 공간을 오래 사랑할 수 있게 합니다.")}
          href={heroHref}
          ctaLabel={heroActionLabel}
          price={!heroBanner && heroProduct ? formatPrice(heroProduct.price) : undefined}
          exploreCollections={categorySection?.visible !== false && categoryCards.length > 0}
          exploreCurated={curatedSection?.visible !== false && home.curatedPicks.length > 0}
        />
      ) : null}

      <section className="cinema-point-of-view" aria-labelledby="point-of-view-title">
        <span className="cinema-brand-seal" aria-hidden="true">m.</span>
        <div>
          <h2 id="point-of-view-title" className="display-heading">편안함은 보이는 것이 아니라,<br className="hidden sm:block" /> 오래 머물고 싶은 감각입니다.</h2>
          <p>과장된 장식 대신 손에 닿는 소재, 몸을 받치는 형태, 시간이 지나도 자연스러운 색을 고릅니다.</p>
        </div>
      </section>

      {categorySection?.visible !== false && categoryCards.length > 0 ? (
        <CinematicCollections
          categories={categoryCards}
          title={sectionValue(categorySection, "title", "공간으로 고르기")}
          subtitle={sectionValue(categorySection, "subtitle", "생활의 장면에서 시작해 나에게 맞는 오브제를 발견해 보세요.")}
        />
      ) : null}

      {curatedSection?.visible !== false && home.curatedPicks.length > 0 ? (
        <section id="home-curated" className="cinema-edit" aria-labelledby="curated-title">
          <div className="cinema-section-heading">
            <h2 id="curated-title" className="display-heading">{sectionValue(curatedSection, "title", "이번 계절의 선택")}</h2>
            <Link href="/search" className="cinema-text-link">전체 보기<Arrow diagonal /></Link>
          </div>
          <div className="cinema-products">
            {home.curatedPicks.slice(0, 4).map((product, index) => (
              <ProductEntrance key={product.id} index={index}><ProductCard product={product} /></ProductEntrance>
            ))}
          </div>
        </section>
      ) : null}

      {recentlyViewed.items.length > 0 ? (
        <div className="space-y-20 border-t border-[var(--line)] pt-16 sm:space-y-24 sm:pt-20">
          <RecentlyViewedShelf recentlyViewed={recentlyViewed} />
          <RecommendationShelf collection={recentlyViewedRecommendations.items.length > 0 ? recentlyViewedRecommendations : homeRecommendations} eyebrow="이어지는 선택" />
        </div>
      ) : null}

      {story ? <CinematicStory story={story} /> : null}

      {newestSection?.visible !== false && home.newArrivals.length > 0 ? (
        <section aria-labelledby="newest-title">
          <div className="cinema-section-heading">
            <h2 id="newest-title" className="display-heading">{sectionValue(newestSection, "title", "새롭게 도착한 오브제")}</h2>
            <p>{sectionValue(newestSection, "subtitle", "이번 주 새롭게 선보이는 소재와 형태를 만나보세요.")}</p>
          </div>
          <div className="cinema-products">
            {home.newArrivals.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </section>
      ) : null}

      <section aria-label="MARU 서비스" className="cinema-services">
        {[
          ["주문 상태 확인", "주문 내역에서 진행 상태를 확인하세요.", "/orders", "주문 내역 보기"],
          ["비회원 주문 조회", "주문번호와 주문할 때 입력한 연락처로 확인하세요.", "/lookup-order", "비회원 주문 찾기"],
          ["쇼핑 도움말", "주문과 장바구니 이용에 필요한 내용을 확인하세요.", "/faq", "자주 묻는 질문"],
        ].map(([title, description, href, label]) => (
          <div key={title}>
            <h2 className="display-heading">{title}</h2>
            <p>{description}</p>
            <Link href={href} className="cinema-text-link">{label}<Arrow diagonal /></Link>
          </div>
        ))}
      </section>
    </div>
  );
}
