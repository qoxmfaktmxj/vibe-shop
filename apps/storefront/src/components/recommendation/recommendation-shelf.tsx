import { ProductCard } from "@/components/catalog/product-card";
import type { RecommendationCollection } from "@/lib/contracts";

export function RecommendationShelf({
  collection,
  eyebrow = "Recommendations",
}: {
  collection: RecommendationCollection;
  eyebrow?: string;
}) {
  if (collection.items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="display-eyebrow">{eyebrow}</p>
          <h2 className="display-heading mt-3 text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
            {collection.title}
          </h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">{collection.subtitle}</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {collection.items.map((product) => (
          <div key={product.id} className="space-y-3">
            <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                {product.reasonLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">{product.reasonDetail}</p>
            </div>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
