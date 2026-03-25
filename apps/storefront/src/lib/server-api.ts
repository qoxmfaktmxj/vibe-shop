import { cookies } from "next/headers";

import type {
  AccountProfile,
  AuthSession,
  Category,
  HomeResponse,
  MyReview,
  OrderResponse,
  OrderSummaryResponse,
  ProductDetail,
  ProductSearchResponse,
  ProductSummary,
  RecommendationCollection,
  RecentlyViewedResponse,
  ShippingAddress,
  WishlistItem,
} from "@/lib/contracts";
import { resolveApiBaseUrl } from "@/lib/api-base-url";
import {
  normalizeCategory,
  normalizeCategorySlug,
  normalizeHomeData,
  normalizeProduct,
  normalizeProductDetail,
  normalizeRecommendations,
  normalizeRecentlyViewed,
  normalizeWishlist,
} from "@/lib/catalog-normalize";

export class ApiNotFoundError extends Error {}

async function getCookieHeaders() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  return cookieHeader
    ? {
        Cookie: cookieHeader,
      }
    : undefined;
}

async function fetchFromApi<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
    cache: "no-store",
    ...init,
  });

  if (response.status === 404) {
    throw new ApiNotFoundError(path);
  }

  if (!response.ok) {
    throw new Error(`API request failed: ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getHomeData() {
  const data = await fetchFromApi<HomeResponse>("/api/v1/home", {
    headers: await getCookieHeaders(),
  });
  return normalizeHomeData(data);
}

export async function getCategories() {
  const categories = await fetchFromApi<Category[]>("/api/v1/categories");
  return categories.map((category) => normalizeCategory(category));
}

async function resolveCategoryParam(category?: string) {
  if (!category || category !== "living") {
    return category;
  }

  const categories = await fetchFromApi<Category[]>("/api/v1/categories");
  const alias = categories.find((item) => normalizeCategorySlug(item.slug) === "living");
  return alias?.slug ?? category;
}

export async function getProducts(category?: string, sort?: string) {
  const params = new URLSearchParams();
  const resolvedCategory = await resolveCategoryParam(category);
  if (resolvedCategory) {
    params.set("category", resolvedCategory);
  }
  if (sort && sort !== "recommended") {
    params.set("sort", sort);
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  const products = await fetchFromApi<ProductSummary[]>(`/api/v1/products${query}`, {
    headers: await getCookieHeaders(),
  });
  return products.map((product) => normalizeProduct(product));
}

export async function searchProducts(keyword: string, sort?: string, category?: string) {
  const params = new URLSearchParams();
  params.set("q", keyword);
  const resolvedCategory = await resolveCategoryParam(category);
  if (resolvedCategory) {
    params.set("category", resolvedCategory);
  }
  if (sort && sort !== "recommended") {
    params.set("sort", sort);
  }
  const query = `?${params.toString()}`;
  const response = await fetchFromApi<ProductSearchResponse>(`/api/v1/search/products${query}`, {
    headers: await getCookieHeaders(),
  });
  return {
    ...response,
    items: response.items.map((item) => normalizeProduct(item)),
  };
}

export async function getProduct(slug: string) {
  const product = await fetchFromApi<ProductDetail>(`/api/v1/products/${slug}`, {
    headers: await getCookieHeaders(),
  });
  return normalizeProductDetail(product);
}

export async function getRecentlyViewed() {
  const response = await fetchFromApi<RecentlyViewedResponse>("/api/v1/recently-viewed", {
    headers: await getCookieHeaders(),
  });
  return {
    ...response,
    items: normalizeRecentlyViewed(response.items),
  };
}

export async function getHomeRecommendations() {
  const response = await fetchFromApi<RecommendationCollection>("/api/v1/recommendations/home", {
    headers: await getCookieHeaders(),
  });
  return normalizeRecommendations(response);
}

export async function getProductRecommendations(productId: number) {
  const response = await fetchFromApi<RecommendationCollection>(`/api/v1/recommendations/products/${productId}`, {
    headers: await getCookieHeaders(),
  });
  return normalizeRecommendations(response);
}

export async function getRecentlyViewedRecommendations() {
  const response = await fetchFromApi<RecommendationCollection>("/api/v1/recommendations/recently-viewed", {
    headers: await getCookieHeaders(),
  });
  return normalizeRecommendations(response);
}

export async function getOrder(orderNumber: string, phone?: string) {
  const query = phone ? `?phone=${encodeURIComponent(phone)}` : "";
  return fetchFromApi<OrderResponse>(`/api/v1/orders/${orderNumber}${query}`, {
    headers: await getCookieHeaders(),
  });
}

export async function listOrders(phone?: string) {
  const query = phone ? `?phone=${encodeURIComponent(phone)}` : "";
  return fetchFromApi<OrderSummaryResponse[]>(`/api/v1/orders${query}`, {
    headers: await getCookieHeaders(),
  });
}

export async function getAuthSession(): Promise<AuthSession> {
  return fetchFromApi<AuthSession>("/api/v1/auth/session", {
    headers: await getCookieHeaders(),
  });
}

export async function getAccountProfile(): Promise<AccountProfile> {
  return fetchFromApi<AccountProfile>("/api/v1/account", {
    headers: await getCookieHeaders(),
  });
}

export async function getShippingAddresses(): Promise<ShippingAddress[]> {
  return fetchFromApi<ShippingAddress[]>("/api/v1/account/addresses", {
    headers: await getCookieHeaders(),
  });
}

export async function getAccountWishlist(): Promise<WishlistItem[]> {
  const items = await fetchFromApi<WishlistItem[]>("/api/v1/account/wishlist", {
    headers: await getCookieHeaders(),
  });
  return normalizeWishlist(items);
}

export async function getAccountReviews(): Promise<MyReview[]> {
  return fetchFromApi<MyReview[]>("/api/v1/account/reviews", {
    headers: await getCookieHeaders(),
  });
}
