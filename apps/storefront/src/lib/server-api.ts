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
  ProductSummary,
  ShippingAddress,
  WishlistItem,
} from "@/lib/contracts";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

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
  const response = await fetch(`${API_BASE_URL}${path}`, {
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
  return fetchFromApi<HomeResponse>("/api/v1/home", {
    headers: await getCookieHeaders(),
  });
}

export async function getCategories() {
  return fetchFromApi<Category[]>("/api/v1/categories");
}

export async function getProducts(category?: string, sort?: string) {
  const params = new URLSearchParams();
  if (category) {
    params.set("category", category);
  }
  if (sort && sort !== "recommended") {
    params.set("sort", sort);
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  return fetchFromApi<ProductSummary[]>(`/api/v1/products${query}`, {
    headers: await getCookieHeaders(),
  });
}

export async function searchProducts(keyword: string, sort?: string, category?: string) {
  const params = new URLSearchParams();
  params.set("q", keyword);
  if (category) {
    params.set("category", category);
  }
  if (sort && sort !== "recommended") {
    params.set("sort", sort);
  }
  const query = `?${params.toString()}`;
  return fetchFromApi<ProductSummary[]>(`/api/v1/products${query}`, {
    headers: await getCookieHeaders(),
  });
}

export async function getProduct(slug: string) {
  return fetchFromApi<ProductDetail>(`/api/v1/products/${slug}`, {
    headers: await getCookieHeaders(),
  });
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
  return fetchFromApi<WishlistItem[]>("/api/v1/account/wishlist", {
    headers: await getCookieHeaders(),
  });
}

export async function getAccountReviews(): Promise<MyReview[]> {
  return fetchFromApi<MyReview[]>("/api/v1/account/reviews", {
    headers: await getCookieHeaders(),
  });
}
