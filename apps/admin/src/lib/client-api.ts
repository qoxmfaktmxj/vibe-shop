import type {
  AdminCategory,
  AdminCategoryPayload,
  AdminDisplay,
  AdminDisplayItem,
  AdminMember,
  AdminOperations,
  AdminOrder,
  AdminProduct,
  AdminReview,
  AdminSession,
  AdminStatistics,
  DeleteAdminCategoryResponse,
  DeleteAdminDisplayItemResponse,
  DisplayItemPayload,
  LoginPayload,
  UpdateAdminDisplayPayload,
  UpdateAdminDisplaySectionPayload,
  UpdateAdminMemberStatusPayload,
  UpdateAdminOrderStatusPayload,
  UpdateAdminProductPayload,
  UpdateAdminReviewStatusPayload,
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

export async function updateDisplaySection(
  sectionCode: string,
  payload: UpdateAdminDisplaySectionPayload,
): Promise<AdminDisplay["sections"][number]> {
  return fetchJson<AdminDisplay["sections"][number]>(`/api/v1/admin/display/sections/${sectionCode}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function createDisplayItem(
  payload: DisplayItemPayload,
): Promise<AdminDisplayItem> {
  return fetchJson<AdminDisplayItem>("/api/v1/admin/display/items", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDisplayItem(
  itemId: number,
  payload: DisplayItemPayload,
): Promise<AdminDisplayItem> {
  return fetchJson<AdminDisplayItem>(`/api/v1/admin/display/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteDisplayItem(
  itemId: number,
): Promise<DeleteAdminDisplayItemResponse> {
  return fetchJson<DeleteAdminDisplayItemResponse>(`/api/v1/admin/display/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function createCategory(
  payload: AdminCategoryPayload,
): Promise<AdminCategory> {
  return fetchJson<AdminCategory>("/api/v1/admin/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
  categoryId: number,
  payload: AdminCategoryPayload,
): Promise<AdminCategory> {
  return fetchJson<AdminCategory>(`/api/v1/admin/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteCategory(
  categoryId: number,
): Promise<DeleteAdminCategoryResponse> {
  return fetchJson<DeleteAdminCategoryResponse>(`/api/v1/admin/categories/${categoryId}`, {
    method: "DELETE",
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

export async function getMembers(query?: {
  status?: string;
  provider?: string;
  q?: string;
}): Promise<AdminMember[]> {
  const params = new URLSearchParams();
  if (query?.status) {
    params.set("status", query.status);
  }
  if (query?.provider) {
    params.set("provider", query.provider);
  }
  if (query?.q) {
    params.set("q", query.q);
  }

  const search = params.toString();
  return fetchJson<AdminMember[]>(`/api/v1/admin/members${search ? `?${search}` : ""}`, {
    method: "GET",
  });
}

export async function updateMemberStatus(
  memberId: number,
  payload: UpdateAdminMemberStatusPayload,
): Promise<AdminMember> {
  return fetchJson<AdminMember>(`/api/v1/admin/members/${memberId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getStatistics(): Promise<AdminStatistics> {
  return fetchJson<AdminStatistics>("/api/v1/admin/statistics", {
    method: "GET",
  });
}

export async function getReviews(query?: {
  status?: string;
  q?: string;
}): Promise<AdminReview[]> {
  const params = new URLSearchParams();
  if (query?.status) {
    params.set("status", query.status);
  }
  if (query?.q) {
    params.set("q", query.q);
  }

  const search = params.toString();
  return fetchJson<AdminReview[]>(`/api/v1/admin/reviews${search ? `?${search}` : ""}`, {
    method: "GET",
  });
}

export async function updateReviewStatus(
  reviewId: number,
  payload: UpdateAdminReviewStatusPayload,
): Promise<AdminReview> {
  return fetchJson<AdminReview>(`/api/v1/admin/reviews/${reviewId}/status`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getOperations(query?: {
  lowStockThreshold?: number;
  lowRatingThreshold?: number;
  suspiciousScoreThreshold?: number;
}): Promise<AdminOperations> {
  const params = new URLSearchParams();
  if (typeof query?.lowStockThreshold === "number") {
    params.set("lowStockThreshold", String(query.lowStockThreshold));
  }
  if (typeof query?.lowRatingThreshold === "number") {
    params.set("lowRatingThreshold", String(query.lowRatingThreshold));
  }
  if (typeof query?.suspiciousScoreThreshold === "number") {
    params.set("suspiciousScoreThreshold", String(query.suspiciousScoreThreshold));
  }

  const search = params.toString();
  return fetchJson<AdminOperations>(`/api/v1/admin/operations${search ? `?${search}` : ""}`, {
    method: "GET",
  });
}
