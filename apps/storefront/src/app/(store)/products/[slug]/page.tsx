import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductReviewSection } from "@/components/engagement/product-review-section";
import { RatingStars } from "@/components/engagement/rating-stars";
import { WishlistToggleButton } from "@/components/engagement/wishlist-toggle-button";
import { RecommendationShelf } from "@/components/recommendation/recommendation-shelf";
import { ProductViewTracker } from "@/components/recommendation/product-view-tracker";
import { formatPrice } from "@/lib/currency";
import { productGradient } from "@/lib/gradient";
import { ApiNotFoundError, getProduct, getProductRecommendations } from "@/lib/server-api";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product;

  try {
    product = await getProduct(slug);
  } catch (error) {
    if (error instanceof ApiNotFoundError) {
      notFound();
    }
    throw error;
  }

  const recommendations = await getProductRecommendations(product.id);
  const reviewStatusText = product.canWriteReview
    ? "구매 이력이 확인되어 리뷰를 작성할 수 있습니다."
    : product.hasReviewed
      ? "이미 리뷰를 작성한 상품입니다."
      : "구매한 회원만 리뷰를 작성할 수 있습니다.";

  return (
    <div className="grid-shell space-y-6 sm:space-y-8">
      <ProductViewTracker productId={product.id} />

      <div className="grid-shell lg:grid-cols-[1.05fr_0.95fr]">
        <section
          className="surface-card min-h-[420px] rounded-[28px] p-6 sm:rounded-[32px] sm:p-8 lg:rounded-[36px] lg:p-10"
          style={{ background: productGradient(product.accentColor) }}
        >
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-8">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] sm:rounded-[24px]">
              <Image
                src={product.imageUrl}
                alt={product.imageAlt}
                fill
                sizes="(min-width: 1024px) 36vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,14,22,0.42)] via-transparent to-[rgba(255,255,255,0.08)]" />
            </div>

            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="display-eyebrow">{product.categoryName}</p>
                  <h1 className="display-heading mt-4 break-words text-[clamp(2.2rem,10vw,4rem)]">{product.name}</h1>
                </div>
                <span className="shrink-0 rounded-[999px] border border-[var(--line)] bg-[rgba(255,255,255,0.88)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
                  {product.badge}
                </span>
              </div>

              <p className="mt-6 max-w-xl text-sm leading-7 text-[var(--ink-soft)] sm:mt-8 sm:text-base sm:leading-8">
                {product.summary}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
                <RatingStars rating={product.reviewSummary.averageRating || 0} />
                <span className="text-sm font-semibold text-[var(--ink)]">
                  {product.reviewSummary.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-[var(--ink-soft)]">
                  리뷰 {product.reviewSummary.reviewCount}개 / 포토 리뷰 {product.reviewSummary.photoReviewCount}개
                </span>
              </div>

              <div className="mt-8 rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] p-5 sm:mt-10 sm:rounded-[28px] sm:p-6">
                <p className="text-sm tracking-[0.18em] text-[var(--ink-soft)]">구매 요약</p>
                <div className="mt-5 grid gap-4 text-sm text-[var(--ink-soft)] sm:grid-cols-2 md:grid-cols-3">
                  <div>
                    <p className="font-semibold">가격</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{formatPrice(product.price)}원</p>
                  </div>
                  <div>
                    <p className="font-semibold">재고</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--ink)]">{product.stock}개</p>
                  </div>
                  <div>
                    <p className="font-semibold">리뷰 작성</p>
                    <p className="mt-2 text-sm font-semibold text-[var(--ink)]">{reviewStatusText}</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <div className="w-full [&>button]:w-full [&>button]:justify-center">
                    <AddToCartButton
                      product={{
                        productId: product.id,
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        accentColor: product.accentColor,
                        imageUrl: product.imageUrl,
                        imageAlt: product.imageAlt,
                      }}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="w-full [&>button]:w-full [&>button]:justify-center">
                      <WishlistToggleButton
                        productId={product.id}
                        initialWishlisted={product.wishlisted}
                        size="detail"
                      />
                    </div>
                    <Link href="/cart" className="button-secondary w-full rounded-[20px] px-4 py-3 text-center">
                      장바구니 보기
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="surface-card rounded-[28px] p-6 sm:rounded-[32px] sm:p-8 lg:rounded-[36px] lg:p-10">
          <p className="display-eyebrow">상품 설명</p>
          <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)] sm:text-base sm:leading-8">
            {product.description}
          </p>

          <div className="mt-8 rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] p-5 sm:rounded-[28px] sm:p-6">
            <p className="text-sm tracking-[0.18em] text-[var(--ink-soft)]">구매 정보</p>
            <p className="mt-3 text-3xl font-semibold">{formatPrice(product.price)}원</p>
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              장바구니 담기와 찜, 장바구니 보기를 한곳에 배치해 모바일에서도 구매 결정을 빠르게 이어갈 수 있도록 구성했습니다.
            </p>
          </div>
        </aside>
      </div>

      <RecommendationShelf collection={recommendations} eyebrow="함께 보면 좋은 상품" />

      <ProductReviewSection
        productId={product.id}
        initialSummary={product.reviewSummary}
        initialReviews={product.reviews}
        initialCanWriteReview={product.canWriteReview}
        initialHasReviewed={product.hasReviewed}
      />
    </div>
  );
}
