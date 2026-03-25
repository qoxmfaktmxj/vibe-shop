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
    return "실시간 인기";
  }

  if (badge === "DAILY") {
    return "데일리 PICK";
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
          className="block overflow-hidden rounded-none border border-black/5 bg-white outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
          style={{ background: productGradient(product.accentColor) }}
        >
          <div className="transition duration-500 group-hover:scale-[1.02]">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.imageAlt}
                fill
                sizes="(min-width: 1280px) 22rem, (min-width: 768px) 45vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(11,14,22,0.62)] via-transparent to-[rgba(255,255,255,0.06)]" />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5 pr-20">
                {badgeLabel ? (
                  <span className="rounded-lg bg-[linear-gradient(120deg,#ea5f4d,#f9a04f)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_20px_rgba(234,95,77,0.2)]">
                    {badgeLabel}
                  </span>
                ) : null}
                <span className="rounded-lg bg-[rgba(255,255,255,0.18)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-white backdrop-blur-sm">
                  {product.categoryName}
                </span>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="rounded-xl bg-[rgba(255,255,255,0.82)] p-4 shadow-[var(--shadow-soft)] backdrop-blur-sm transition duration-300 group-hover:bg-[rgba(255,255,255,0.9)]">
                  <p className="display-heading max-w-[14rem] text-3xl leading-[1.05] text-[var(--ink)]">
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

        <div className="absolute right-4 top-4 z-10">
          <WishlistToggleButton productId={product.id} initialWishlisted={product.wishlisted} />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">가격</p>
            <p className="mt-1 text-lg font-semibold text-[var(--primary)]">
              {formatPrice(product.price)}원
            </p>
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
