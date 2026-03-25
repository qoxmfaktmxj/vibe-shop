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
    <div className="grid-shell space-y-8">
      <ProductViewTracker productId={product.id} />

      <div className="grid-shell lg:grid-cols-[1.05fr_0.95fr]">
        <section
          className="surface-card min-h-[420px] rounded-[36px] p-8 sm:p-10"
          style={{ background: productGradient(product.accentColor) }}
        >
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[24px]">
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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="display-eyebrow">{product.categoryName}</p>
                  <h1 className="display-heading mt-4 text-4xl sm:text-5xl">{product.name}</h1>
                </div>
                <span className="rounded-[999px] border border-[var(--line)] bg-[rgba(255,255,255,0.88)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
                  {product.badge}
                </span>
              </div>

              <p className="mt-8 max-w-xl text-base leading-8 text-[var(--ink-soft)]">{product.summary}</p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <RatingStars rating={product.reviewSummary.averageRating || 0} />
                <span className="text-sm font-semibold text-[var(--ink)]">
                  {product.reviewSummary.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-[var(--ink-soft)]">
                  리뷰 {product.reviewSummary.reviewCount}개 / 포토 리뷰 {product.reviewSummary.photoReviewCount}개
                </span>
              </div>

              <div className="mt-10 rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] p-6">
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--ink-soft)]">구매 요약</p>
                <div className="mt-5 grid gap-4 text-sm text-[var(--ink-soft)] sm:grid-cols-3">
                  <div>
                    <p className="font-semibold">가격</p>
                    <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                      {formatPrice(product.price)}원
                    </p>
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

                <div className="mt-6 flex flex-wrap gap-3">
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
                  <WishlistToggleButton
                    productId={product.id}
                    initialWishlisted={product.wishlisted}
                    size="detail"
                  />
                  <Link href="/cart" className="button-secondary rounded-[20px] px-4 py-2">
                    장바구니 보기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="surface-card rounded-[36px] p-8 sm:p-10">
          <p className="display-eyebrow">상품 설명</p>
          <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">{product.description}</p>

          <div className="mt-8 rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--ink-soft)]">구매 정보</p>
            <p className="mt-3 text-3xl font-semibold">{formatPrice(product.price)}원</p>
            <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">
              바로 담기와 찜을 같은 위치에 배치해 구매 결정과 보관 행동이 자연스럽게 이어지도록 구성했습니다.
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
