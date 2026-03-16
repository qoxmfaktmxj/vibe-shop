import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import type { ProductSummary } from "@/lib/contracts";
import { formatPrice } from "@/lib/currency";
import { productGradient } from "@/lib/gradient";

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <article className="group w-full">
      <Link
        href={`/products/${product.slug}`}
        className="block overflow-hidden rounded-xl"
        style={{ background: productGradient(product.accentColor) }}
      >
        <div className="flex aspect-[4/5] min-h-80 flex-col justify-between p-6 transition duration-500 group-hover:scale-[1.02]">
          <div className="flex items-start justify-between gap-4">
            <span className="rounded-lg bg-white/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink)]">
              {product.badge}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--ink-soft)]">
              {product.categoryName}
            </span>
          </div>

          <div className="space-y-4">
            <p className="display-heading max-w-[12rem] text-3xl font-semibold leading-[1.05] text-[var(--ink)]">
              {product.name}
            </p>
            <p className="max-w-xs text-sm leading-6 text-[var(--ink-soft)]">
              {product.summary}
            </p>
          </div>
        </div>
      </Link>

      <div className="mt-5 flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-soft)]">
              Price
            </p>
            <p className="mt-1 text-lg font-semibold text-[var(--primary)]">
              {formatPrice(product.price)}
            </p>
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
