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
    name: "리빙",
    description: "공간을 정리하고 분위기를 만드는 리빙 셀렉션",
    heroTitle: "공간을 정리하는 리빙 셀렉션",
    heroSubtitle: "자연스럽게 머무는 거실과 침실 아이템을 천천히 살펴보세요.",
  },
  kitchen: {
    name: "키친",
    description: "식탁과 조리 시간을 정돈하는 키친 셀렉션",
    heroTitle: "테이블과 조리를 위한 키친 셀렉션",
    heroSubtitle: "플레이팅과 조리 동선에 맞춘 실용적인 도구와 식기를 한 번에 살펴보세요.",
  },
  wellness: {
    name: "웰니스",
    description: "하루의 균형을 더하는 웰니스 셀렉션",
    heroTitle: "휴식과 루틴을 위한 웰니스 셀렉션",
    heroSubtitle: "휴식과 셀프 케어 루틴에 어울리는 아이템을 한곳에 모았습니다.",
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
