import { cache } from "react";
import { cookies } from "next/headers";

import type {
  AccountProfile,
  AuthSession,
  Category,
  HomeResponse,
  OrderResponse,
  OrderSummaryResponse,
  ProductDetail,
  ProductSummary,
  ShippingAddress,
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

export const getHomeData = cache(async () => fetchFromApi<HomeResponse>("/api/v1/home"));

export const getCategories = cache(async () => fetchFromApi<Category[]>("/api/v1/categories"));

export const getProducts = cache(async (category?: string, sort?: string) => {
  const params = new URLSearchParams();
  if (category) {
    params.set("category", category);
  }
  if (sort && sort !== "recommended") {
    params.set("sort", sort);
  }
  const query = params.toString() ? `?${params.toString()}` : "";
  return fetchFromApi<ProductSummary[]>(`/api/v1/products${query}`);
});

export const searchProducts = cache(async (keyword: string, sort?: string, category?: string) => {
  const params = new URLSearchParams();
  params.set("q", keyword);
  if (category) {
    params.set("category", category);
  }
  if (sort && sort !== "recommended") {
    params.set("sort", sort);
  }
  const query = `?${params.toString()}`;
  return fetchFromApi<ProductSummary[]>(`/api/v1/products${query}`);
});

export const getProduct = cache(async (slug: string) =>
  fetchFromApi<ProductDetail>(`/api/v1/products/${slug}`),
);

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
