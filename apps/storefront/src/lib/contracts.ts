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
};

export type OrderResponse = {
  orderNumber: string;
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
};

export type CartItem = CartProduct & {
  quantity: number;
};

export type CartResponse = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

