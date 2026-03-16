export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string;
  accentColor: string;
};

export type ProductSummary = {
  id: number;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  summary: string;
  price: number;
  badge: string;
  accentColor: string;
  imageUrl: string;
  imageAlt: string;
};

export type ProductDetail = ProductSummary & {
  description: string;
  stock: number;
};

export type HomeResponse = {
  heroTitle: string;
  heroSubtitle: string;
  featuredCategories: Category[];
  featuredProducts: ProductSummary[];
};

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  provider: string;
};

export type AuthSession = {
  authenticated: boolean;
  user: AuthenticatedUser | null;
  sessionToken?: string | null;
};

export type SignUpPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type CheckoutItem = {
  productId: number;
  quantity: number;
};

export type CheckoutLine = {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type CheckoutPreview = {
  lines: CheckoutLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
};

export type CreateOrderPayload = {
  idempotencyKey: string;
  customerName: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2: string;
  note: string;
  items: CheckoutItem[];
};

export type CreateOrderResponse = {
  orderNumber: string;
  status: string;
};

export type GuestOrderLookupPayload = {
  orderNumber: string;
  phone: string;
};

export type GuestOrderLookupResponse = {
  orderNumber: string;
};

export type CancelOrderResponse = {
  orderNumber: string;
  status: string;
};

export type OrderSummaryResponse = {
  orderNumber: string;
  status: string;
  customerName: string;
  total: number;
  createdAt: string;
  itemCount: number;
};

export type OrderResponse = {
  orderNumber: string;
  status: string;
  customerName: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2: string;
  note: string;
  lines: CheckoutLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
};

export type CartProduct = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  accentColor: string;
  imageUrl: string;
  imageAlt: string;
};

export type CartItem = CartProduct & {
  quantity: number;
};

export type CartResponse = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

