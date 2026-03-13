import { notFound } from "next/navigation";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
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
    <div className="grid-shell lg:grid-cols-[1.1fr_0.9fr]">
      <section
        className="surface-card min-h-[420px] rounded-[36px] p-8 sm:p-10"
        style={{ background: productGradient(product.accentColor) }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="display-eyebrow">{product.categoryName}</p>
            <h1 className="display-heading mt-4 text-4xl font-semibold sm:text-5xl">
              {product.name}
            </h1>
          </div>
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold">
            {product.badge}
          </span>
        </div>

        <p className="mt-8 max-w-xl text-base leading-8 text-black/70">
          {product.summary}
        </p>

        <div className="mt-16 grid gap-4 text-sm text-black/65 sm:grid-cols-3">
          <div>
            <p className="font-semibold">Price</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
              {formatPrice(product.price)}원
            </p>
          </div>
          <div>
            <p className="font-semibold">Stock</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
              {product.stock}개
            </p>
          </div>
          <div>
            <p className="font-semibold">Flow</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
              Detail → Cart → Checkout
            </p>
          </div>
        </div>
      </section>

      <aside className="surface-card rounded-[36px] p-8 sm:p-10">
        <p className="display-eyebrow">Product Story</p>
        <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">
          {product.description}
        </p>

        <div className="mt-8 rounded-[28px] border border-black/8 bg-white/75 p-6">
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--ink-soft)]">
            Purchase
          </p>
          <p className="mt-3 text-3xl font-semibold">{formatPrice(product.price)}원</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartButton
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                accentColor: product.accentColor,
              }}
            />
            <Link
              href="/cart"
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold"
            >
              장바구니 보기
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
