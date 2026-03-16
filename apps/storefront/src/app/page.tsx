import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { formatPrice } from "@/lib/currency";
import { productGradient } from "@/lib/gradient";
import { getHomeData } from "@/lib/server-api";

export default async function HomePage() {
  const home = await getHomeData();
  const [leadCategory, supportingCategory, tertiaryCategory] = home.featuredCategories;
  const [heroProduct, ...seasonHighlights] = home.featuredProducts;

  return (
    <div className="grid-shell pb-8">
      <section className="grid min-h-[calc(100vh-13rem)] gap-10 lg:grid-cols-[minmax(0,1fr)_32rem] lg:items-center">
        <article className="max-w-2xl">
          <p className="display-eyebrow">New Season 2026</p>
          <h1 className="display-heading mt-5 text-5xl font-semibold leading-[0.95] sm:text-7xl lg:text-[5.5rem]">
            {home.heroTitle}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[var(--ink-soft)] sm:text-lg">
            {home.heroSubtitle}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href={`/category/${leadCategory?.slug ?? "living"}`}
              className="button-primary px-6 py-4"
            >
              Explore Shop
            </Link>
            <Link href="/faq" className="button-secondary px-6 py-4">
              View Journal
            </Link>
          </div>

          <div className="mt-12 grid gap-5 text-sm text-[var(--ink-soft)] sm:grid-cols-3">
            <div>
              <p className="display-eyebrow">Curation</p>
              <p className="mt-3 max-w-[12rem] leading-7">
                생활과 상품의 간격을 넓혀 더 조용하고 정돈된 화면을 만듭니다.
              </p>
            </div>
            <div>
              <p className="display-eyebrow">Palette</p>
              <p className="mt-3 max-w-[12rem] leading-7">
                슬레이트 톤과 에메랄드 포인트로 가볍지만 단정한 분위기를 유지합니다.
              </p>
            </div>
            <div>
              <p className="display-eyebrow">Flow</p>
              <p className="mt-3 max-w-[12rem] leading-7">
                메인, 카테고리, 상세, 장바구니, 체크아웃까지 한 줄로 이어지는 구매 흐름입니다.
              </p>
            </div>
          </div>
        </article>

        <div className="relative">
          <div
            className="editorial-shadow min-h-[34rem] overflow-hidden rounded-xl p-8 lg:p-10"
            style={{ background: productGradient(heroProduct?.accentColor) }}
          >
            <div className="flex h-full flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-lg bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
                  Curated Piece
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
                  {heroProduct?.categoryName}
                </span>
              </div>

              <div className="space-y-4">
                <p className="display-heading max-w-xs text-4xl font-semibold leading-[1.02] text-[var(--ink)]">
                  {heroProduct?.name}
                </p>
                <p className="max-w-sm leading-7 text-[var(--ink-soft)]">
                  {heroProduct?.summary}
                </p>
                <p className="text-base font-semibold text-[var(--primary)]">
                  {heroProduct ? formatPrice(heroProduct.price) : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="editorial-shadow absolute -bottom-8 left-6 max-w-[18rem] rounded-lg bg-white p-5">
            <p className="text-3xl font-light italic text-[var(--secondary)]">01</p>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              제품을 많이 보여주기보다, 먼저 하나의 분위기를 강하게 보여주는 에디토리얼 히어로입니다.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="display-eyebrow">Curated Selections</p>
            <h2 className="display-heading mt-3 text-4xl font-semibold">조용한 구성을 위한 셀렉션</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              레퍼런스의 핵심인 비대칭 레이아웃을 현재 상품 구조에 맞게 재해석했습니다.
            </p>
          </div>
          <Link
            href={`/category/${leadCategory?.slug ?? "living"}`}
            className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--primary)]"
          >
            View All
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          <Link
            href={`/category/${leadCategory?.slug ?? "living"}`}
            className="group overflow-hidden rounded-xl"
            style={{ background: productGradient(leadCategory?.accentColor) }}
          >
            <div className="grid min-h-[32rem] gap-8 p-8 lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
              <div className="flex flex-col justify-between rounded-xl bg-white/30 p-6 backdrop-blur-sm">
                <div>
                  <p className="display-eyebrow">{leadCategory?.name ?? "Living"}</p>
                  <h3 className="display-heading mt-4 text-3xl font-semibold text-[var(--ink)]">
                    {leadCategory?.description ?? "공간의 호흡을 정리하는 셀렉션"}
                  </h3>
                </div>
                <span className="w-fit rounded-lg bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ink)] shadow-[var(--shadow-soft)]">
                  Shop Now
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {seasonHighlights.slice(0, 2).map((product) => (
                  <div
                    key={product.id}
                    className="flex min-h-52 flex-col justify-end rounded-xl bg-white/65 p-5 transition duration-300 group-hover:bg-white/80"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                      {product.categoryName}
                    </p>
                    <p className="display-heading mt-3 text-2xl font-semibold text-[var(--ink)]">
                      {product.name}
                    </p>
                    <p className="mt-2 text-sm text-[var(--ink-soft)]">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Link>

          <div className="grid gap-6">
            <Link
              href={`/category/${supportingCategory?.slug ?? "kitchen"}`}
              className="surface-card rounded-xl p-7 transition hover:-translate-y-1"
            >
              <p className="display-eyebrow">{supportingCategory?.name ?? "Kitchen"}</p>
              <p className="display-heading mt-4 text-3xl font-semibold text-[var(--ink)]">
                {supportingCategory?.description ?? "조리와 플레이팅의 리듬을 바꾸는 키친 라인"}
              </p>
              <p className="mt-6 text-sm leading-7 text-[var(--ink-soft)]">
                상품 정보보다 먼저 분위기를 읽게 만드는 카드 구성입니다.
              </p>
            </Link>

            <div className="grid gap-6 sm:grid-cols-2">
              <Link
                href={`/category/${tertiaryCategory?.slug ?? "wellness"}`}
                className="surface-highlight rounded-xl p-7"
              >
                <p className="display-eyebrow">{tertiaryCategory?.name ?? "Wellness"}</p>
                <p className="display-heading mt-4 text-2xl font-semibold text-[var(--ink)]">
                  느린 루틴을 위한 셀프 케어
                </p>
              </Link>

              <Link href="/lookup-order" className="surface-card rounded-xl p-7">
                <p className="display-eyebrow">Guest Lookup</p>
                <p className="display-heading mt-4 text-2xl font-semibold text-[var(--ink)]">
                  비회원 주문 조회
                </p>
                <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
                  사용자 플로우를 끊지 않도록 안내 링크도 같은 톤으로 맞췄습니다.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div className="text-center">
          <p className="display-eyebrow">Season Highlights</p>
          <h2 className="display-heading mt-3 text-4xl font-semibold">이번 시즌 하이라이트</h2>
        </div>

        <div className="no-scrollbar flex gap-8 overflow-x-auto pb-4">
          {home.featuredProducts.map((product) => (
            <div key={product.id} className="w-[18rem] flex-none md:w-[19rem]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <section className="surface-layer rounded-xl px-8 py-12 sm:px-10 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="space-y-5">
          <p className="display-eyebrow">Join the Atelier</p>
          <h2 className="display-heading text-4xl font-semibold text-[var(--ink)]">
            조용하지만 분명한 구매 경험
          </h2>
          <p className="max-w-md text-sm leading-7 text-[var(--ink-soft)]">
            검색, 주문 조회, FAQ까지 이어지는 안내 구조를 같은 디자인 언어로 정리했습니다.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:mt-0">
          <Link href="/search" className="surface-card rounded-xl p-5">
            <p className="display-eyebrow">Search</p>
            <p className="display-heading mt-3 text-2xl font-semibold text-[var(--ink)]">상품 탐색</p>
          </Link>
          <Link href="/orders" className="surface-card rounded-xl p-5">
            <p className="display-eyebrow">Orders</p>
            <p className="display-heading mt-3 text-2xl font-semibold text-[var(--ink)]">주문 이력</p>
          </Link>
          <Link href="/faq" className="surface-card rounded-xl p-5">
            <p className="display-eyebrow">Journal</p>
            <p className="display-heading mt-3 text-2xl font-semibold text-[var(--ink)]">운영 안내</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
