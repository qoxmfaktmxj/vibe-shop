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

export type AdminDisplayItem = {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  ctaLabel: string;
  accentColor: string;
  displayOrder: number;
  visible: boolean;
  startsAt: string | null;
  endsAt: string | null;
};

export type AdminDisplaySection = {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  displayOrder: number;
  visible: boolean;
  items: AdminDisplayItem[];
};

export type AdminDisplay = {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  sections: AdminDisplaySection[];
};

export type UpdateAdminDisplayPayload = {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroCtaHref: string;
};

export type UpdateAdminDisplaySectionPayload = {
  title: string;
  subtitle: string;
  displayOrder: number;
  visible: boolean;
};

export type DisplayItemPayload = {
  sectionCode: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  ctaLabel: string;
  accentColor: string;
  displayOrder: number;
  visible: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type DeleteAdminDisplayItemResponse = {
  itemId: number;
};

export type AdminCategory = {
  id: number;
  slug: string;
  name: string;
  description: string;
  accentColor: string;
  displayOrder: number;
  visible: boolean;
  coverImageUrl: string;
  coverImageAlt: string;
  heroTitle: string;
  heroSubtitle: string;
  productCount: number;
};

export type AdminCategoryPayload = {
  slug: string;
  name: string;
  description: string;
  accentColor: string;
  displayOrder: number;
  visible: boolean;
  coverImageUrl: string;
  coverImageAlt: string;
  heroTitle: string;
  heroSubtitle: string;
};

export type DeleteAdminCategoryResponse = {
  categoryId: number;
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

export type AdminMember = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  provider: string;
  role: string;
  status: string;
  marketingOptIn: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  orderCount: number;
  shippingAddressCount: number;
  totalSpent: number;
};

export type UpdateAdminMemberStatusPayload = {
  status: string;
};

export type AdminStatisticsSummary = {
  windowDays: number;
  orderCount: number;
  paidRevenue: number;
  newMemberCount: number;
  cancelledOrderCount: number;
  refundedOrderCount: number;
};

export type AdminDailyMetric = {
  date: string;
  orderCount: number;
  paidRevenue: number;
  newMemberCount: number;
};

export type AdminCategorySales = {
  categorySlug: string;
  categoryName: string;
  quantity: number;
  revenue: number;
};

export type AdminTopProduct = {
  productId: number;
  productName: string;
  categoryName: string;
  quantity: number;
  revenue: number;
};

export type AdminStatistics = {
  sevenDay: AdminStatisticsSummary;
  thirtyDay: AdminStatisticsSummary;
  dailyMetrics: AdminDailyMetric[];
  categorySales: AdminCategorySales[];
  topProducts: AdminTopProduct[];
};

export type AdminReview = {
  id: number;
  productId: number;
  productSlug: string;
  productName: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title: string;
  content: string;
  status: string;
  createdAt: string;
};

export type UpdateAdminReviewStatusPayload = {
  status: string;
};

export type AdminDashboard = {
  display: AdminDisplay;
  productCount: number;
  featuredProductCount: number;
  lowStockCount: number;
  memberCount: number;
  activeMemberCount: number;
  dormantMemberCount: number;
  blockedMemberCount: number;
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
