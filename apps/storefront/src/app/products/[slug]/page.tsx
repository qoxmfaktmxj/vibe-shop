import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { RatingStars } from "@/components/engagement/rating-stars";
import { ReviewComposer } from "@/components/engagement/review-composer";
import { WishlistToggleButton } from "@/components/engagement/wishlist-toggle-button";
import { formatPrice } from "@/lib/currency";
import { productGradient } from "@/lib/gradient";
import { ApiNotFoundError, getProduct } from "@/lib/server-api";

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

  return (
    <div className="grid-shell space-y-8">
      <div className="grid-shell lg:grid-cols-[1.1fr_0.9fr]">
        <section
          className="surface-card min-h-[420px] rounded-[36px] p-8 sm:p-10"
          style={{ background: productGradient(product.accentColor) }}
        >
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px]">
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
                  <h1 className="display-heading mt-4 text-4xl font-semibold sm:text-5xl">
                    {product.name}
                  </h1>
                </div>
                <span className="rounded-[999px] border border-[var(--line)] bg-[rgba(255,255,255,0.88)] px-3 py-1 text-xs font-semibold text-[var(--ink)]">
                  {product.badge}
                </span>
              </div>

              <p className="mt-8 max-w-xl text-base leading-8 text-[var(--ink-soft)]">
                {product.summary}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <RatingStars rating={product.reviewSummary.averageRating || 0} />
                <span className="text-sm font-semibold text-[var(--ink)]">
                  {product.reviewSummary.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-[var(--ink-soft)]">
                  리뷰 {product.reviewSummary.reviewCount}개
                </span>
              </div>

              <div className="mt-12 grid gap-4 text-sm text-[var(--ink-soft)] sm:grid-cols-3">
                <div>
                  <p className="font-semibold">가격</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <div>
                  <p className="font-semibold">재고</p>
                  <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                    {product.stock}개
                  </p>
                </div>
                <div>
                  <p className="font-semibold">리뷰 가능</p>
                  <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                    {product.canWriteReview
                      ? "구매 이력 확인 완료"
                      : product.hasReviewed
                        ? "이미 리뷰 작성"
                        : "구매 회원 전용"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="surface-card rounded-[36px] p-8 sm:p-10">
          <p className="display-eyebrow">Details</p>
          <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">
            {product.description}
          </p>

          <div className="mt-8 rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] p-6">
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Purchase
            </p>
            <p className="mt-3 text-3xl font-semibold">{formatPrice(product.price)}</p>
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
              <Link href="/cart" className="button-secondary px-4 py-2">
                장바구니 보기
              </Link>
            </div>
          </div>
        </aside>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="surface-card rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="display-eyebrow">Reviews</p>
              <h2 className="display-heading mt-3 text-3xl font-semibold">고객 리뷰</h2>
            </div>
            <div className="text-sm text-[var(--ink-soft)]">
              평균 {product.reviewSummary.averageRating.toFixed(1)} / 5
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold">{review.title}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <RatingStars rating={review.rating} size="sm" />
                        <span className="text-sm text-[var(--ink-soft)]">{review.reviewerName}</span>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--ink-soft)]">
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">{review.content}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm leading-7 text-[var(--ink-soft)]">
                아직 공개된 리뷰가 없습니다. 첫 리뷰를 남겨 보세요.
              </div>
            )}
          </div>
        </article>

        <ReviewComposer
          productId={product.id}
          canWriteReview={product.canWriteReview}
          hasReviewed={product.hasReviewed}
        />
      </section>
    </div>
  );
}
