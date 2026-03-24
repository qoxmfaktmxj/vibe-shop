import type {
  AccountProfile,
  AuthSession,
  CancelOrderResponse,
  CartItem,
  CartResponse,
  CheckoutPreview,
  CreateReviewPayload,
  CreateOrderPayload,
  CreateOrderResponse,
  DeleteReviewResponse,
  DeleteShippingAddressResponse,
  GuestOrderLookupPayload,
  GuestOrderLookupResponse,
  LoginPayload,
  MyReview,
  ProductReviewListResponse,
  RecommendationCollection,
  ReviewHelpfulState,
  ShippingAddress,
  ShippingAddressPayload,
  SignUpPayload,
  TrackProductViewResponse,
  UpdateAccountProfilePayload,
  UpdateReviewPayload,
  WishlistItem,
  WishlistStateResponse,
} from "@/lib/contracts";
import { resolveApiBaseUrl } from "@/lib/api-base-url";

async function fetchJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${resolveApiBaseUrl()}${path}`, {
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

export async function updateAccountProfile(
  payload: UpdateAccountProfilePayload,
): Promise<AccountProfile> {
  return fetchJson<AccountProfile>("/api/v1/account", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function listShippingAddresses(): Promise<ShippingAddress[]> {
  return fetchJson<ShippingAddress[]>("/api/v1/account/addresses", {
    method: "GET",
  });
}

export async function createShippingAddress(
  payload: ShippingAddressPayload,
): Promise<ShippingAddress> {
  return fetchJson<ShippingAddress>("/api/v1/account/addresses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateShippingAddress(
  addressId: number,
  payload: ShippingAddressPayload,
): Promise<ShippingAddress> {
  return fetchJson<ShippingAddress>(`/api/v1/account/addresses/${addressId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteShippingAddress(
  addressId: number,
): Promise<DeleteShippingAddressResponse> {
  return fetchJson<DeleteShippingAddressResponse>(`/api/v1/account/addresses/${addressId}`, {
    method: "DELETE",
  });
}

export async function listAccountWishlist(): Promise<WishlistItem[]> {
  return fetchJson<WishlistItem[]>("/api/v1/account/wishlist", {
    method: "GET",
  });
}

export async function addWishlistItem(
  productId: number,
): Promise<WishlistStateResponse> {
  return fetchJson<WishlistStateResponse>(`/api/v1/account/wishlist/items/${productId}`, {
    method: "POST",
  });
}

export async function removeWishlistItem(
  productId: number,
): Promise<WishlistStateResponse> {
  return fetchJson<WishlistStateResponse>(`/api/v1/account/wishlist/items/${productId}`, {
    method: "DELETE",
  });
}

export async function listAccountReviews(): Promise<MyReview[]> {
  return fetchJson<MyReview[]>("/api/v1/account/reviews", {
    method: "GET",
  });
}

export async function listProductReviews(
  productId: number,
  query?: {
    sort?: string;
    rating?: number;
    photoOnly?: boolean;
  },
): Promise<ProductReviewListResponse> {
  const params = new URLSearchParams();
  if (query?.sort) {
    params.set("sort", query.sort);
  }
  if (typeof query?.rating === "number") {
    params.set("rating", String(query.rating));
  }
  if (query?.photoOnly) {
    params.set("photoOnly", "true");
  }

  const search = params.toString();
  return fetchJson<ProductReviewListResponse>(`/api/v1/products/${productId}/reviews${search ? `?${search}` : ""}`, {
    method: "GET",
  });
}

export async function createProductReview(
  productId: number,
  payload: CreateReviewPayload,
): Promise<MyReview> {
  return fetchJson<MyReview>(`/api/v1/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function markReviewHelpful(
  productId: number,
  reviewId: number,
): Promise<ReviewHelpfulState> {
  return fetchJson<ReviewHelpfulState>(`/api/v1/products/${productId}/reviews/${reviewId}/helpful`, {
    method: "POST",
  });
}

export async function unmarkReviewHelpful(
  productId: number,
  reviewId: number,
): Promise<ReviewHelpfulState> {
  return fetchJson<ReviewHelpfulState>(`/api/v1/products/${productId}/reviews/${reviewId}/helpful`, {
    method: "DELETE",
  });
}

export async function updateAccountReview(
  reviewId: number,
  payload: UpdateReviewPayload,
): Promise<MyReview> {
  return fetchJson<MyReview>(`/api/v1/account/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAccountReview(
  reviewId: number,
): Promise<DeleteReviewResponse> {
  return fetchJson<DeleteReviewResponse>(`/api/v1/account/reviews/${reviewId}`, {
    method: "DELETE",
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

export async function trackProductView(
  productId: number,
  source = "PRODUCT_DETAIL",
): Promise<TrackProductViewResponse> {
  return fetchJson<TrackProductViewResponse>(
    `/api/v1/recently-viewed/items/${productId}?source=${encodeURIComponent(source)}`,
    {
      method: "POST",
    },
  );
}

export async function getCartRecommendations(): Promise<RecommendationCollection> {
  return fetchJson<RecommendationCollection>("/api/v1/recommendations/cart", {
    method: "GET",
  });
}
