import type {
  AuthSession,
  CancelOrderResponse,
  CartItem,
  CartResponse,
  CheckoutPreview,
  CreateOrderPayload,
  CreateOrderResponse,
  GuestOrderLookupPayload,
  GuestOrderLookupResponse,
  LoginPayload,
  SignUpPayload,
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
    throw new Error(error?.message ?? "요청 처리 중 문제가 발생했습니다.");
  }

  return response.json() as Promise<T>;
}

export async function getCart(): Promise<CartResponse> {
  return fetchJson<CartResponse>("/api/v1/cart", {
    method: "GET",
  });
}

export async function setCartItemQuantity(
  productId: number,
  quantity: number,
): Promise<CartResponse> {
  return fetchJson<CartResponse>(`/api/v1/cart/items/${productId}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeCartItem(productId: number): Promise<CartResponse> {
  return fetchJson<CartResponse>(`/api/v1/cart/items/${productId}`, {
    method: "DELETE",
  });
}

export async function clearCartItems(): Promise<CartResponse> {
  return fetchJson<CartResponse>("/api/v1/cart", {
    method: "DELETE",
  });
}

export async function getAuthSession(): Promise<AuthSession> {
  return fetchJson<AuthSession>("/api/v1/auth/session", {
    method: "GET",
  });
}

export async function signUp(payload: SignUpPayload): Promise<AuthSession> {
  return fetchJson<AuthSession>("/api/v1/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signIn(payload: LoginPayload): Promise<AuthSession> {
  return fetchJson<AuthSession>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signOut(): Promise<AuthSession> {
  return fetchJson<AuthSession>("/api/v1/auth/logout", {
    method: "POST",
  });
}

export async function previewOrder(items: CartItem[]): Promise<CheckoutPreview> {
  return fetchJson<CheckoutPreview>("/api/v1/orders/preview", {
    method: "POST",
    body: JSON.stringify({
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    }),
  });
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  return fetchJson<CreateOrderResponse>("/api/v1/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function lookupGuestOrder(
  payload: GuestOrderLookupPayload,
): Promise<GuestOrderLookupResponse> {
  return fetchJson<GuestOrderLookupResponse>("/api/v1/orders/lookup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function cancelOrder(
  orderNumber: string,
  phone?: string,
): Promise<CancelOrderResponse> {
  const query = phone ? `?phone=${encodeURIComponent(phone)}` : "";
  return fetchJson<CancelOrderResponse>(`/api/v1/orders/${orderNumber}/cancel${query}`, {
    method: "POST",
  });
}
