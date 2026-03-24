import { ProductCard } from "@/components/catalog/product-card";
import type { RecentlyViewedResponse } from "@/lib/contracts";

export function RecentlyViewedShelf({ recentlyViewed }: { recentlyViewed: RecentlyViewedResponse }) {
  if (recentlyViewed.items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="display-eyebrow">Recently Viewed</p>
          <h2 className="display-heading mt-3 text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
            최근 본 상품
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
          브라우저 또는 로그인 세션 기준으로 마지막에 본 상품을 다시 이어서 볼 수 있습니다.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {recentlyViewed.items.map((product) => (
          <div key={product.id} className="space-y-3">
            <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Last seen
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                {new Date(product.viewedAt).toLocaleString("ko-KR")}
              </p>
            </div>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
