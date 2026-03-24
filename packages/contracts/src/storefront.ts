export type Category = {
  id: number;
  slug: string;
  name: string;
  description: string;
  accentColor: string;
  displayOrder: number;
  coverImageUrl: string;
  coverImageAlt: string;
  heroTitle: string;
  heroSubtitle: string;
};

export type HomeDisplayItem = {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
  ctaLabel: string;
  accentColor: string;
};

export type HomeDisplaySection = {
  code: string;
  title: string;
  subtitle: string;
  visible: boolean;
  items: HomeDisplayItem[];
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
  wishlisted: boolean;
};

export type ReviewImage = {
  id: number;
  imageUrl: string;
  displayOrder: number;
};

export type ReviewRatingBreakdown = {
  rating: number;
  count: number;
  percentage: number;
};

export type ReviewSummary = {
  averageRating: number;
  reviewCount: number;
  photoReviewCount: number;
  buyerReviewCount: number;
  repurchaseRatio: number;
  deliverySatisfactionAverage: number | null;
  packagingSatisfactionAverage: number | null;
  ratingDistribution: ReviewRatingBreakdown[];
};

export type ProductReview = {
  id: number;
  rating: number;
  title: string;
  content: string;
  reviewerName: string;
  buyerReview: boolean;
  fitTag: string | null;
  repurchaseYn: boolean;
  deliverySatisfaction: number | null;
  packagingSatisfaction: number | null;
  helpfulCount: number;
  helpfulVoted: boolean;
  hasPhotos: boolean;
  images: ReviewImage[];
  createdAt: string;
};

export type ProductReviewListResponse = {
  summary: ReviewSummary;
  reviews: ProductReview[];
  canWriteReview: boolean;
  hasReviewed: boolean;
};

export type ProductDetail = ProductSummary & {
  description: string;
  stock: number;
  canWriteReview: boolean;
  hasReviewed: boolean;
  reviewSummary: ReviewSummary;
  reviews: ProductReview[];
};

export type HomeResponse = {
  heroTitle: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  heroCtaHref: string;
  displaySections: HomeDisplaySection[];
  featuredCategories: Category[];
  curatedPicks: ProductSummary[];
  newArrivals: ProductSummary[];
  bestSellers: ProductSummary[];
};

export type RecentlyViewedItem = ProductSummary & {
  viewedAt: string;
};

export type RecentlyViewedResponse = {
  items: RecentlyViewedItem[];
};

export type RecommendationProduct = ProductSummary & {
  reasonCode: string;
  reasonLabel: string;
  reasonDetail: string;
  score: number;
};

export type RecommendationCollection = {
  context: string;
  title: string;
  subtitle: string;
  items: RecommendationProduct[];
};

export type TrackProductViewResponse = {
  productId: number;
  viewedAt: string;
};

export type ParsedSearchQuery = {
  raw: string;
  normalized: string;
  keyword: string | null;
  category: string | null;
  color: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  season: string | null;
  useCase: string | null;
  gender: string | null;
};

export type AppliedSearchFilter = {
  type: string;
  value: string;
  label: string;
};

export type SearchFallback = {
  applied: boolean;
  reason: string;
  relaxedFilters: string[];
};

export type ProductSearchResponse = {
  items: ProductSummary[];
  parsedQuery: ParsedSearchQuery;
  appliedFilters: AppliedSearchFilter[];
  fallback: SearchFallback | null;
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
};

export type SocialExchangePayload = {
  provider: string;
  accessToken: string;
};

export type AccountProfile = {
  id: number;
  name: string;
  email: string;
  provider: string;
  createdAt: string;
  orderCount: number;
  addressCount: number;
  wishlistCount: number;
  reviewCount: number;
};

export type UpdateAccountProfilePayload = {
  name: string;
};

export type ShippingAddress = {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2: string;
  isDefault: boolean;
};

export type ShippingAddressPayload = {
  label: string;
  recipientName: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2: string;
  isDefault: boolean;
};

export type DeleteShippingAddressResponse = {
  addressId: number;
};

export type WishlistItem = {
  productId: number;
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
  createdAt: string;
};

export type WishlistStateResponse = {
  productId: number;
  wishlisted: boolean;
};

export type CreateReviewPayload = {
  rating: number;
  title: string;
  content: string;
  fitTag?: string;
  repurchaseYn?: boolean;
  deliverySatisfaction?: number | null;
  packagingSatisfaction?: number | null;
  imageUrls?: string[];
};

export type UpdateReviewPayload = CreateReviewPayload;

export type ReviewHelpfulState = {
  reviewId: number;
  helpfulCount: number;
  helpfulVoted: boolean;
};

export type DeleteReviewResponse = {
  reviewId: number;
};

export type MyReview = {
  id: number;
  productId: number;
  productSlug: string;
  productName: string;
  productImageUrl: string;
  productImageAlt: string;
  rating: number;
  title: string;
  content: string;
  fitTag: string | null;
  repurchaseYn: boolean;
  deliverySatisfaction: number | null;
  packagingSatisfaction: number | null;
  helpfulCount: number;
  buyerReview: boolean;
  images: ReviewImage[];
  status: string;
  createdAt: string;
  updatedAt: string;
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

export type PaymentMethod =
  | "CARD"
  | "BANK_TRANSFER"
  | "VIRTUAL_ACCOUNT"
  | "MOBILE"
  | "EASY_PAY";

export type CreateOrderPayload = {
  idempotencyKey: string;
  customerName: string;
  phone: string;
  postalCode: string;
  address1: string;
  address2: string;
  note: string;
  paymentMethod: PaymentMethod;
  items: CheckoutItem[];
};

export type CreateOrderResponse = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: PaymentMethod;
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
  customerType: string;
  customerName: string;
  total: number;
  createdAt: string;
  itemCount: number;
};

export type OrderResponse = {
  orderNumber: string;
  status: string;
  customerType: string;
  paymentStatus: string;
  paymentMethod: PaymentMethod;
  paymentMessage: string;
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
