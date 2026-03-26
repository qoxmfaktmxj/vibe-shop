import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { WishlistToggleButton } from "@/components/engagement/wishlist-toggle-button";
import type { ProductSummary } from "@/lib/contracts";
import { formatPrice } from "@/lib/currency";
import { productGradient } from "@/lib/gradient";

function getBadgeLabel(badge: string) {
  if (!badge) {
    return "";
  }

  if (badge === "BEST") {
    return "베스트";
  }

  if (badge === "DAILY") {
    return "데일리 픽";
  }

  return badge;
}

export function ProductCard({ product }: { product: ProductSummary }) {
  const badgeLabel = getBadgeLabel(product.badge);

  return (
    <article className="group w-full">
      <div className="relative">
        <Link
          href={`/products/${product.slug}`}
          className="block overflow-hidden rounded-[24px] border border-black/5 bg-white outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--primary)] sm:rounded-[28px]"
          style={{ background: productGradient(product.accentColor) }}
        >
          <div className="transition duration-500 group-hover:scale-[1.02]">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.imageAlt}
                fill
                sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 31vw, (min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,14,22,0.62)] via-transparent to-[rgba(255,255,255,0.06)]" />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 pr-16 sm:gap-4 sm:p-5 sm:pr-20">
                {badgeLabel ? (
                  <span className="rounded-lg bg-[linear-gradient(120deg,#ea5f4d,#f9a04f)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_20px_rgba(234,95,77,0.2)] sm:px-3">
                    {badgeLabel}
                  </span>
                ) : null}
                <span className="rounded-lg bg-[rgba(255,255,255,0.16)] px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-white backdrop-blur-sm sm:px-3 sm:tracking-[0.22em]">
                  {product.categoryName}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <div className="rounded-[18px] bg-[rgba(255,255,255,0.84)] p-3 shadow-[var(--shadow-soft)] backdrop-blur-sm transition duration-300 group-hover:bg-[rgba(255,255,255,0.9)] sm:rounded-xl sm:p-4">
                  <p className="display-heading max-w-[14rem] text-[1.75rem] leading-[1.02] text-[var(--ink)] sm:text-3xl sm:leading-[1.05]">
                    {product.name}
                  </p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--ink-soft)]">
                    {product.summary}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
          <WishlistToggleButton productId={product.id} initialWishlisted={product.wishlisted} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:mt-5 sm:gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">가격</p>
            <p className="mt-1 text-lg font-semibold text-[var(--primary)]">{formatPrice(product.price)}원</p>
          </div>
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
      </div>
    </article>
  );
}
