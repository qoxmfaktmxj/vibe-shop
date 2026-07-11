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
import { ApiNotFoundError, getProduct, getProductRecommendations } from "@/lib/server-api";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product;

  try {
    product = await getProduct(slug);
  } catch (error) {
    if (error instanceof ApiNotFoundError) notFound();
    throw error;
  }

  const recommendations = await getProductRecommendations(product.id).catch(() => null);
  const reviewStatusText = product.canWriteReview
    ? "구매 이력이 확인되어 리뷰를 작성할 수 있습니다."
    : product.hasReviewed
      ? "이미 리뷰를 작성한 상품입니다."
      : "구매한 회원만 리뷰를 작성할 수 있습니다.";

  return (
    <div className="grid-shell pb-6 sm:pb-10">
      <ProductViewTracker productId={product.id} />

      <div className="grid gap-10 pt-2 lg:grid-cols-[1.25fr_0.75fr] lg:gap-14 lg:pt-6">
        <section className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-low)] lg:aspect-[5/6]">
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            sizes="(min-width: 1024px) 62vw, 100vw"
            priority
            className="object-cover"
          />
          {product.badge ? (
            <span className="absolute left-5 top-5 bg-[var(--surface)] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink)] sm:left-7 sm:top-7">
              {product.badge}
            </span>
          ) : null}
        </section>

        <aside className="lg:sticky lg:top-44 lg:self-start">
          <Link href={`/category/${product.categorySlug}`} className="text-[10px] uppercase tracking-[0.18em] text-[var(--ink-muted)] hover:text-[var(--primary)]">
            {product.categoryName} collection
          </Link>
          <h1 className="display-heading mt-5 text-4xl sm:text-5xl">{product.name}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-[var(--line)] pb-6">
            <RatingStars rating={product.reviewSummary.averageRating || 0} />
            <span className="text-xs font-semibold">{product.reviewSummary.averageRating.toFixed(1)}</span>
            <span className="text-xs text-[var(--ink-muted)]">리뷰 {product.reviewSummary.reviewCount}개</span>
          </div>

          <p className="mt-6 text-sm leading-7 text-[var(--ink-soft)] sm:text-base">{product.summary}</p>

          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">Price</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.02em]">{formatPrice(product.price)}원</p>
            </div>
            <p className={`text-xs font-semibold ${product.stock > 0 ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
              {product.stock > 0 ? `재고 ${product.stock}개` : "품절"}
            </p>
          </div>

          <div className="mt-8 space-y-3 border-y border-[var(--line)] py-6 text-xs leading-6 text-[var(--ink-soft)]">
            <p><span className="mr-3 font-semibold text-[var(--ink)]">배송</span>전국 무료배송 · 결제 후 영업일 기준 1~3일 내 출고</p>
            <p><span className="mr-3 font-semibold text-[var(--ink)]">포장</span>선물 포장과 메시지 카드는 결제 단계에서 선택</p>
            <p><span className="mr-3 font-semibold text-[var(--ink)]">상담</span>상품과 공간 선택은 리빙 컨시어지가 안내</p>
          </div>

          <div className="mt-8 grid gap-3">
            <div className="w-full [&>button]:w-full [&>button]:justify-center">
              <AddToCartButton
                disabled={product.stock === 0}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="w-full [&>div>button]:w-full [&>div>button]:justify-center">
                <WishlistToggleButton productId={product.id} initialWishlisted={product.wishlisted} size="detail" />
              </div>
              <Link href="/cart" className="button-secondary w-full px-4 py-3 text-center">장바구니 보기</Link>
            </div>
          </div>
        </aside>
      </div>

      <section className="grid gap-10 border-y border-[var(--line)] py-14 sm:py-20 lg:grid-cols-[0.65fr_1.35fr]">
        <div>
          <p className="display-eyebrow">About the object</p>
          <h2 className="display-heading mt-3 text-3xl sm:text-4xl">상품 이야기</h2>
        </div>
        <div>
          <p className="max-w-3xl text-base leading-8 text-[var(--ink-soft)] sm:text-lg sm:leading-9">{product.description}</p>
          <div className="mt-8 grid gap-5 border-t border-[var(--line)] pt-6 text-xs leading-6 text-[var(--ink-soft)] sm:grid-cols-2">
            <p><span className="block font-semibold text-[var(--ink)]">리뷰 안내</span>{reviewStatusText}</p>
            <p><span className="block font-semibold text-[var(--ink)]">교환 및 반품</span>수령 후 7일 이내 신청할 수 있으며, 소재 특성에 따라 기준이 달라질 수 있습니다.</p>
          </div>
        </div>
      </section>

      {recommendations ? <RecommendationShelf collection={recommendations} eyebrow="함께 놓기 좋은 오브제" /> : null}

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
