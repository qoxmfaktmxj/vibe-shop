import { ProductCard } from "@/components/catalog/product-card";
import type { RecommendationCollection } from "@/lib/contracts";

function normalizeBadge(reasonLabel: string, fallbackBadge: string) {
  if (!reasonLabel) {
    return fallbackBadge;
  }

  if (reasonLabel.includes("BEST")) {
    return "?ㅼ떆媛??멸린";
  }

  return reasonLabel;
}

export function RecommendationShelf({
  collection,
  eyebrow = "異붿쿇 ?곹뭹",
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
          <h2 className="display-heading mt-3 text-3xl text-[var(--ink)] sm:text-4xl">
            {collection.title || "異붿쿇 ?곹뭹"}
          </h2>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {collection.items.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              ...product,
              badge: normalizeBadge(product.reasonLabel, product.badge),
            }}
          />
        ))}
      </div>
    </section>
  );
}

