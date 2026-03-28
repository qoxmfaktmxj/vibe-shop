import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { WishlistToggleButton } from "@/components/engagement/wishlist-toggle-button";
import type { ProductSummary } from "@/lib/contracts";
import { formatPrice } from "@/lib/currency";

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
          className="block overflow-hidden rounded-[var(--radius-lg)] bg-[var(--surface-low)] outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.imageAlt}
              fill
              sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 31vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />

            {/* Badge & Category */}
            <div className="absolute inset-x-0 top-0 flex items-start gap-2 p-3 sm:p-4">
              {badgeLabel ? (
                <span className="rounded-[var(--radius-sm)] bg-[var(--primary)] px-2.5 py-1 text-[11px] font-bold text-white">
                  {badgeLabel}
                </span>
              ) : null}
              <span className="rounded-[var(--radius-sm)] bg-white/85 px-2.5 py-1 text-[11px] font-medium text-[var(--ink-soft)] backdrop-blur-sm">
                {product.categoryName}
              </span>
            </div>
          </div>
        </Link>

        {/* Wishlist button */}
        <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
          <WishlistToggleButton productId={product.id} initialWishlisted={product.wishlisted} />
        </div>
      </div>

      {/* Product info */}
      <div className="mt-3 space-y-2 sm:mt-4">
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="text-sm font-bold leading-snug text-[var(--ink)] sm:text-base">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--ink-soft)] sm:text-sm">
            {product.summary}
          </p>
        </Link>

        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-base font-bold text-[var(--ink)] sm:text-lg">
            {formatPrice(product.price)}원
          </p>
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
