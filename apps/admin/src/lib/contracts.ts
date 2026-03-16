export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type AdminSession = {
  authenticated: boolean;
  user: AdminUser | null;
  sessionToken?: string | null;
};

export type AdminDisplay = {
  heroTitle: string;
  heroSubtitle: string;
};

export type UpdateAdminDisplayPayload = {
  heroTitle: string;
  heroSubtitle: string;
};

export type AdminProduct = {
  id: number;
  slug: string;
  categorySlug: string;
  categoryName: string;
  name: string;
  summary: string;
  price: number;
  badge: string;
  featured: boolean;
  stock: number;
  popularityScore: number;
  imageUrl: string;
  imageAlt: string;
};

export type UpdateAdminProductPayload = {
  name: string;
  summary: string;
  badge: string;
  price: number;
  stock: number;
  popularityScore: number;
  featured: boolean;
};

export type AdminOrder = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerType: string;
  customerName: string;
  phone: string;
  total: number;
  createdAt: string;
  itemCount: number;
};

export type UpdateAdminOrderStatusPayload = {
  status: string;
};

export type AdminDashboard = {
  display: AdminDisplay;
  productCount: number;
  featuredProductCount: number;
  lowStockCount: number;
  memberCount: number;
  totalOrderCount: number;
  paidOrderCount: number;
  pendingOrderCount: number;
  recentOrders: AdminOrder[];
  spotlightProducts: AdminProduct[];
};

export type LoginPayload = {
  email: string;
  password: string;
};
