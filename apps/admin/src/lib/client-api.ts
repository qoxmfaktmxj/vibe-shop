import type {
  AdminDisplay,
  AdminOrder,
  AdminProduct,
  AdminSession,
  LoginPayload,
  UpdateAdminDisplayPayload,
  UpdateAdminOrderStatusPayload,
  UpdateAdminProductPayload,
} from "@/lib/contracts";

function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:8080`;
  }

  return "http://localhost:8080";
}

async function fetchJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;
    throw new Error(error?.message ?? "관리자 요청 처리 중 문제가 발생했습니다.");
  }

  return response.json() as Promise<T>;
}

export async function getAdminSession(): Promise<AdminSession> {
  return fetchJson<AdminSession>("/api/v1/admin/session", {
    method: "GET",
  });
}

export async function signIn(payload: LoginPayload): Promise<AdminSession> {
  return fetchJson<AdminSession>("/api/v1/admin/session/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signOut(): Promise<AdminSession> {
  return fetchJson<AdminSession>("/api/v1/admin/session/logout", {
    method: "POST",
  });
}

export async function updateDisplay(
  payload: UpdateAdminDisplayPayload,
): Promise<AdminDisplay> {
  return fetchJson<AdminDisplay>("/api/v1/admin/display", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(
  productId: number,
  payload: UpdateAdminProductPayload,
): Promise<AdminProduct> {
  return fetchJson<AdminProduct>(`/api/v1/admin/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function updateOrderStatus(
  orderNumber: string,
  payload: UpdateAdminOrderStatusPayload,
): Promise<AdminOrder> {
  return fetchJson<AdminOrder>(`/api/v1/admin/orders/${orderNumber}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
