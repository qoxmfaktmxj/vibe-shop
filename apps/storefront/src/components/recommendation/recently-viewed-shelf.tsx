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
          <p className="display-eyebrow">理쒓렐 蹂??곹뭹</p>
          <h2 className="display-heading mt-3 text-3xl text-[var(--ink)] sm:text-4xl">
            ?댁뼱???섎윭蹂닿린
          </h2>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {recentlyViewed.items.map((product) => (
          <div key={product.id} className="space-y-3">
            <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                留덉?留??뺤씤
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

