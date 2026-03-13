import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import type { ProductSummary } from "@/lib/contracts";
import { formatPrice } from "@/lib/currency";
import { productGradient } from "@/lib/gradient";

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="surface-card overflow-hidden rounded-[28px]">
      <Link
        href={`/products/${product.slug}`}
        className="block min-h-56 p-6"
        style={{ background: productGradient(product.accentColor) }}
      >
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--ink)]">
            {product.badge}
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.24em] text-black/40">
            {product.categoryName}
          </span>
        </div>
        <div className="mt-16">
          <p className="display-heading text-2xl font-semibold leading-tight">
            {product.name}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-black/60">
            {product.summary}
          </p>
        </div>
      </Link>

      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--ink-soft)]">
              Price
            </p>
            <p className="mt-1 text-xl font-semibold">{formatPrice(product.price)}원</p>
          </div>
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              accentColor: product.accentColor,
            }}
          />
        </div>
      </div>
    </article>
  );
}

