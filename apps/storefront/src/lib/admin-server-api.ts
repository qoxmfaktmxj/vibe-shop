import { cache } from "react";
import { cookies } from "next/headers";

import type {
  AdminCategory,
  AdminDashboard,
  AdminDisplay,
  AdminManagedAccount,
  AdminMember,
  AdminOperations,
  AdminOrder,
  AdminProduct,
  AdminReview,
  AdminSession,
  AdminStatistics,
} from "@/lib/admin-contracts";
import { resolveApiBaseUrl } from "@/lib/admin-api-base-url";

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

  if (!response.ok) {
    throw new Error(`Admin API request failed: ${path}`);
  }

  return response.json() as Promise<T>;
}

export const getAdminSession = cache(async (): Promise<AdminSession> =>
  fetchFromApi<AdminSession>("/api/v1/admin/session", {
    headers: await getCookieHeaders(),
  }),
);

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

export async function getAdminMembers(): Promise<AdminMember[]> {
  return fetchFromApi<AdminMember[]>("/api/v1/admin/members", {
    headers: await getCookieHeaders(),
  });
}

export async function getAdminManagedAccounts(): Promise<AdminManagedAccount[]> {
  return fetchFromApi<AdminManagedAccount[]>("/api/v1/admin/members/admins", {
    headers: await getCookieHeaders(),
  });
}

export async function getAdminStatistics(): Promise<AdminStatistics> {
  return fetchFromApi<AdminStatistics>("/api/v1/admin/statistics", {
    headers: await getCookieHeaders(),
  });
}

export async function getAdminReviews(): Promise<AdminReview[]> {
  return fetchFromApi<AdminReview[]>("/api/v1/admin/reviews", {
    headers: await getCookieHeaders(),
  });
}

export async function getAdminOperations(): Promise<AdminOperations> {
  return fetchFromApi<AdminOperations>("/api/v1/admin/operations", {
    headers: await getCookieHeaders(),
  });
}
