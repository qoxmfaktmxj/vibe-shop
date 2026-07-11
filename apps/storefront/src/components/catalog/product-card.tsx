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
          className="block overflow-hidden bg-[var(--surface-low)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
        >
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src={product.imageUrl}
              alt={product.imageAlt}
              fill
              sizes="(min-width: 1280px) 23vw, (min-width: 1024px) 31vw, (min-width: 640px) 45vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />

            <div className="absolute left-0 top-0 flex flex-col items-start gap-1 p-3 sm:p-4">
              {badgeLabel ? (
                <span className="bg-[var(--surface)] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[var(--ink)]">
                  {badgeLabel}
                </span>
              ) : null}
              {product.stock === 0 ? (
                <span className="bg-[var(--ink)] px-2 py-1 text-[9px] font-bold tracking-[0.08em] text-[var(--surface)]">
                  품절
                </span>
              ) : product.stock <= 3 ? (
                <span className="bg-[var(--surface)] px-2 py-1 text-[9px] font-bold text-[var(--primary)]">
                  {product.stock}개 남음
                </span>
              ) : null}
            </div>
          </div>
        </Link>

        <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
          <WishlistToggleButton productId={product.id} initialWishlisted={product.wishlisted} />
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--ink-muted)]">
          {product.categoryName}
        </p>
        <Link href={`/products/${product.slug}`} className="block">
          <h3 className="mt-2 text-sm font-medium leading-snug text-[var(--ink)] sm:text-base">
            {product.name}
          </h3>
          <p className="mt-1.5 line-clamp-1 text-[11px] leading-relaxed text-[var(--ink-soft)] sm:text-xs">
            {product.summary}
          </p>
        </Link>

        <div className="mt-3 border-t border-[var(--line)] pt-3">
          <p className="text-sm font-semibold text-[var(--ink)] sm:text-base">
            {formatPrice(product.price)}원
          </p>
          <div className="mt-3 lg:opacity-0 lg:transition-opacity lg:duration-200 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">
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
        </div>
      </div>
    </article>
  );
}
