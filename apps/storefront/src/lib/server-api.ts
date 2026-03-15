import { cache } from "react";

import type {
  Category,
  HomeResponse,
  OrderResponse,
  ProductDetail,
  ProductSummary,
} from "@/lib/contracts";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

export class ApiNotFoundError extends Error {}

async function fetchFromApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
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

export const searchProducts = cache(async (keyword: string, sort?: string) => {
  const params = new URLSearchParams();
  params.set("q", keyword);
  if (sort && sort !== "recommended") {
    params.set("sort", sort);
  }
  const query = `?${params.toString()}`;
  return fetchFromApi<ProductSummary[]>(`/api/v1/products${query}`);
});

export const getProduct = cache(async (slug: string) =>
  fetchFromApi<ProductDetail>(`/api/v1/products/${slug}`),
);

export const getOrder = cache(async (orderNumber: string) =>
  fetchFromApi<OrderResponse>(`/api/v1/orders/${orderNumber}`),
);
