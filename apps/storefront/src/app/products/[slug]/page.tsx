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
        style={{ background: productGradient() }}
      >
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

        <div className="mt-16 grid gap-4 text-sm text-[var(--ink-soft)] sm:grid-cols-3">
          <div>
            <p className="font-semibold">가격</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
              {formatPrice(product.price)}원
            </p>
          </div>
          <div>
            <p className="font-semibold">재고</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
              {product.stock}개
            </p>
          </div>
          <div>
            <p className="font-semibold">주문 단계</p>
            <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
              상품 확인 → 장바구니 → 주문서 작성
            </p>
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
            구매 정보
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
              className="button-secondary px-4 py-2"
            >
              장바구니 보기
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
