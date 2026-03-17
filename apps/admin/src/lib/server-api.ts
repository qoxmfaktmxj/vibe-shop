import { cache } from "react";
import { cookies } from "next/headers";

import type {
  AdminCategory,
  AdminDashboard,
  AdminDisplay,
  AdminOrder,
  AdminProduct,
  AdminSession,
} from "@/lib/contracts";

const API_BASE_URL =
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8080";

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

  if (!response.ok) {
    throw new Error(`Admin API request failed: ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getAdminSession(): Promise<AdminSession> {
  return fetchFromApi<AdminSession>("/api/v1/admin/session", {
    headers: await getCookieHeaders(),
  });
}

export const getAdminDashboard = cache(async () =>
  fetchFromApi<AdminDashboard>("/api/v1/admin/dashboard", {
    headers: await getCookieHeaders(),
  }),
);

export async function getAdminDisplay(): Promise<AdminDisplay> {
  return fetchFromApi<AdminDisplay>("/api/v1/admin/display", {
    headers: await getCookieHeaders(),
  });
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  return fetchFromApi<AdminCategory[]>("/api/v1/admin/categories", {
    headers: await getCookieHeaders(),
  });
}

export async function getAdminProducts(): Promise<AdminProduct[]> {
  return fetchFromApi<AdminProduct[]>("/api/v1/admin/products", {
    headers: await getCookieHeaders(),
  });
}

export async function getAdminOrders(): Promise<AdminOrder[]> {
  return fetchFromApi<AdminOrder[]>("/api/v1/admin/orders", {
    headers: await getCookieHeaders(),
  });
}
