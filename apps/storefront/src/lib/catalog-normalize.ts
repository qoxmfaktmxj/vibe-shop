import type {
  Category,
  HomeResponse,
  ProductDetail,
  ProductSummary,
  RecommendationCollection,
  RecentlyViewedItem,
  WishlistItem,
} from "@/lib/contracts";

const CATEGORY_COPY: Record<string, { name: string; description: string; heroTitle: string; heroSubtitle: string }> = {
  living: {
    name: "\uB9AC\uBE59",
    description: "\uACF5\uAC04\uC744 \uC815\uB9AC\uD558\uACE0 \uBD84\uC704\uAE30\uB97C \uB9CC\uB4DC\uB294 \uB9AC\uBE59 \uC140\uB809\uC158",
    heroTitle: "\uACF5\uAC04\uC744 \uC815\uB9AC\uD558\uB294 \uB9AC\uBE59 \uC140\uB809\uC158",
    heroSubtitle: "\uC790\uC5F0\uC2A4\uB7FD\uAC8C \uBA38\uBB34\uB294 \uAC70\uC2E4\uACFC \uCE68\uC2E4 \uC544\uC774\uD15C\uC744 \uCC9C\uCC9C\uD788 \uC0B4\uD3B4\uBCF4\uC138\uC694.",
  },
  kitchen: {
    name: "\uD0A4\uCE5C",
    description: "\uC2DD\uD0C1\uACFC \uC870\uB9AC \uC2DC\uAC04\uC744 \uC815\uB3C8\uD558\uB294 \uD0A4\uCE5C \uC140\uB809\uC158",
    heroTitle: "\uD14C\uC774\uBE14\uACFC \uC870\uB9AC\uB97C \uC704\uD55C \uD0A4\uCE5C \uC140\uB809\uC158",
    heroSubtitle: "\uD50C\uB808\uC774\uD305\uACFC \uC870\uB9AC \uB3D9\uC120\uC5D0 \uB9DE\uCD98 \uC2E4\uC6A9\uC801\uC778 \uB3C4\uAD6C\uC640 \uC2DD\uAE30\uB97C \uD55C \uBC88\uC5D0 \uC0B4\uD3B4\uBCF4\uC138\uC694.",
  },
  wellness: {
    name: "\uC6F0\uB2C8\uC2A4",
    description: "\uD558\uB8E8\uC758 \uADE0\uD615\uC744 \uB354\uD558\uB294 \uC6F0\uB2C8\uC2A4 \uC140\uB809\uC158",
    heroTitle: "\uD734\uC2DD\uACFC \uB8E8\uD2F4\uC744 \uC704\uD55C \uC6F0\uB2C8\uC2A4 \uC140\uB809\uC158",
    heroSubtitle: "\uD734\uC2DD\uACFC \uC140\uD504 \uCF00\uC5B4 \uB8E8\uD2F4\uC5D0 \uC5B4\uC6B8\uB9AC\uB294 \uC544\uC774\uD15C\uC744 \uD55C\uACF3\uC5D0 \uBAA8\uC558\uC2B5\uB2C8\uB2E4.",
  },
};

export function normalizeCategorySlug(slug: string) {
  if (slug.startsWith("objet-") || slug.startsWith("objects-")) {
    return "living";
  }
  return slug;
}

export function normalizeCategory(category: Category): Category {
  const normalizedSlug = normalizeCategorySlug(category.slug);
  const copy = CATEGORY_COPY[normalizedSlug];
  if (!copy) {
    return category;
  }

  return {
    ...category,
    slug: normalizedSlug,
    name: copy.name,
    description: copy.description,
    heroTitle: copy.heroTitle,
    heroSubtitle: copy.heroSubtitle,
    coverImageAlt: category.coverImageAlt || `${copy.name} cover image`,
  };
}

export function normalizeProduct<T extends ProductSummary>(product: T): T {
  const normalizedSlug = normalizeCategorySlug(product.categorySlug);
  const copy = CATEGORY_COPY[normalizedSlug];
  return copy
    ? {
        ...product,
        categorySlug: normalizedSlug,
        categoryName: copy.name,
      }
    : product;
}

export function normalizeProductDetail(product: ProductDetail): ProductDetail {
  return normalizeProduct(product);
}

export function normalizeWishlist(items: WishlistItem[]): WishlistItem[] {
  return items.map((item) => {
    const normalizedSlug = normalizeCategorySlug(item.categorySlug);
    const copy = CATEGORY_COPY[normalizedSlug];

    return copy
      ? {
          ...item,
          categorySlug: normalizedSlug,
          categoryName: copy.name,
        }
      : item;
  });
}

export function normalizeRecentlyViewed(items: RecentlyViewedItem[]): RecentlyViewedItem[] {
  return items.map((item) => normalizeProduct(item));
}

export function normalizeRecommendations(collection: RecommendationCollection): RecommendationCollection {
  return {
    ...collection,
    items: collection.items.map((item) => normalizeProduct(item)),
  };
}

export function normalizeHomeData(data: HomeResponse): HomeResponse {
  return {
    ...data,
    featuredCategories: data.featuredCategories.map((category) => normalizeCategory(category)),
    curatedPicks: data.curatedPicks.map((product) => normalizeProduct(product)),
    newArrivals: data.newArrivals.map((product) => normalizeProduct(product)),
    bestSellers: data.bestSellers.map((product) => normalizeProduct(product)),
  };
}
