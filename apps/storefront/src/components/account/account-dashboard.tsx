"use client";

import Image from "next/image";
import Link from "next/link";

import type {
  AccountProfile,
  MyReview,
  OrderSummaryResponse,
  ShippingAddress,
  WishlistItem,
} from "@/lib/contracts";
import { formatPrice } from "@/lib/currency";
import { formatOrderStatus } from "@/lib/order-status";

const PROVIDER_LABELS: Record<string, string> = {
  LOCAL: "\uC77C\uBC18 \uD68C\uC6D0",
  KAKAO: "\uCE74\uCE74\uC624 \uB85C\uADF8\uC778",
  NAVER: "\uB124\uC774\uBC84 \uB85C\uADF8\uC778",
  GOOGLE: "\uAD6C\uAE00 \uB85C\uADF8\uC778",
};

const REVIEW_STATUS_LABELS: Record<string, string> = {
  PUBLISHED: "\uACF5\uAC1C",
  HIDDEN: "\uC228\uAE40",
};

function renderStars(rating: number) {
  return `${"★".repeat(rating)}${"☆".repeat(Math.max(0, 5 - rating))}`;
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
      <p className="display-eyebrow">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

export function AccountDashboard({
  initialProfile,
  initialAddresses,
  recentOrders,
  initialWishlist,
  initialReviews,
}: {
  initialProfile: AccountProfile;
  initialAddresses: ShippingAddress[];
  recentOrders: OrderSummaryResponse[];
  initialWishlist: WishlistItem[];
  initialReviews: MyReview[];
}) {
  const joinedDate = new Date(initialProfile.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="grid-shell space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <p className="display-eyebrow">My Account</p>
          <h1 className="display-heading mt-4 text-4xl">\uB0B4 \uACC4\uC815</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
            \uC8FC\uBB38, \uBC30\uC1A1\uC9C0, \uCC1C, \uB9AC\uBDF0 \uD604\uD669\uC744 \uD55C \uB208\uC5D0 \uBCF4\uACE0 \uBE60\uB978 \uB3D9\uC120\uC73C\uB85C \uC774\uB3D9\uD560 \uC218 \uC788\uB3C4\uB85D \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <StatCard label="\uAC00\uC785\uC77C" value={<span className="text-lg">{joinedDate}</span>} />
            <StatCard label="\uC8FC\uBB38" value={initialProfile.orderCount} />
            <StatCard label="\uCC1C" value={initialProfile.wishlistCount} />
            <StatCard label="\uB9AC\uBDF0" value={initialProfile.reviewCount} />
          </div>
        </article>

        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <p className="display-eyebrow">Profile</p>
          <h2 className="display-heading mt-4 text-3xl">\uAE30\uBCF8 \uC815\uBCF4</h2>
          <div className="mt-8 grid gap-4">
            <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
              <p className="display-eyebrow">\uC774\uB984</p>
              <p className="mt-3 text-xl font-semibold">{initialProfile.name}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
              <p className="display-eyebrow">\uC774\uBA54\uC77C</p>
              <p className="mt-3 text-sm text-[var(--ink-soft)]">{initialProfile.email}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
              <p className="display-eyebrow">\uAC00\uC785 \uBC29\uC2DD</p>
              <p className="mt-3 text-sm text-[var(--ink-soft)]">
                {PROVIDER_LABELS[initialProfile.provider] ?? initialProfile.provider}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">Address Book</p>
              <h2 className="display-heading mt-4 text-3xl">\uBC30\uC1A1\uC9C0</h2>
            </div>
            <p className="text-sm text-[var(--ink-soft)]">{initialAddresses.length}\uAC1C \uB4F1\uB85D</p>
          </div>
          <div className="mt-8 space-y-4">
            {initialAddresses.length > 0 ? (
              initialAddresses.map((address) => (
                <article key={address.id} className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-semibold">{address.label}</p>
                    {address.isDefault ? (
                      <span className="rounded-full bg-[rgba(28,107,81,0.12)] px-3 py-1 text-xs font-semibold text-[var(--secondary)]">
                        \uAE30\uBCF8 \uBC30\uC1A1\uC9C0
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    {address.recipientName} \u00B7 {address.phone}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                    ({address.postalCode}) {address.address1}
                    {address.address2 ? `, ${address.address2}` : ""}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm leading-7 text-[var(--ink-soft)]">
                \uB4F1\uB85D\uB41C \uBC30\uC1A1\uC9C0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.
              </div>
            )}
          </div>
        </article>

        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">Orders</p>
              <h2 className="display-heading mt-4 text-3xl">\uCD5C\uADFC \uC8FC\uBB38</h2>
            </div>
            <Link href="/orders" className="button-secondary px-4 py-3">
              \uC804\uCCB4 \uC8FC\uBB38 \uBCF4\uAE30
            </Link>
          </div>
          <div className="mt-8 space-y-4">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link key={order.orderNumber} href={`/orders/${order.orderNumber}`} className="block rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 transition hover:translate-y-[-2px]">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xl font-semibold">{order.orderNumber}</p>
                      <p className="mt-2 text-sm text-[var(--ink-soft)]">{order.customerName}</p>
                    </div>
                    <div className="space-y-1 text-sm sm:text-right">
                      <p className="font-semibold">{formatOrderStatus(order.status)}</p>
                      <p>{formatPrice(order.total)}\uC6D0</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm leading-7 text-[var(--ink-soft)]">
                \uC544\uC9C1 \uC8FC\uBB38 \uB0B4\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="display-eyebrow">Wishlist</p>
              <h2 className="display-heading mt-4 text-3xl">\uCC1C\uD55C \uC0C1\uD488</h2>
            </div>
            <Link href="/search" className="button-secondary px-4 py-3">
              \uC0C1\uD488 \uB354 \uBCF4\uAE30
            </Link>
          </div>
          <div className="mt-8 space-y-4">
            {initialWishlist.length > 0 ? (
              initialWishlist.map((item) => (
                <article key={item.productId} className="grid gap-4 rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5 sm:grid-cols-[120px_minmax(0,1fr)]">
                  <Link href={`/products/${item.slug}`} className="relative min-h-[140px] overflow-hidden rounded-[24px]">
                    <Image src={item.imageUrl} alt={item.imageAlt} fill sizes="120px" className="object-cover" />
                  </Link>
                  <div>
                    <p className="display-eyebrow">{item.categoryName}</p>
                    <Link href={`/products/${item.slug}`} className="mt-2 block text-xl font-semibold">
                      {item.name}
                    </Link>
                    <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{item.summary}</p>
                    <p className="mt-4 text-lg font-semibold">{formatPrice(item.price)}\uC6D0</p>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm leading-7 text-[var(--ink-soft)]">
                \uC544\uC9C1 \uCC1C\uD55C \uC0C1\uD488\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.
              </div>
            )}
          </div>
        </article>

        <article className="surface-card rounded-[36px] p-8 sm:p-10">
          <p className="display-eyebrow">Reviews</p>
          <h2 className="display-heading mt-4 text-3xl">\uB0B4 \uB9AC\uBDF0</h2>
          <div className="mt-8 space-y-4">
            {initialReviews.length > 0 ? (
              initialReviews.map((review) => (
                <article key={review.id} className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link href={`/products/${review.productSlug}`} className="text-lg font-semibold">
                        {review.productName}
                      </Link>
                      <p className="mt-2 text-sm text-[var(--ink-soft)]">
                        {renderStars(review.rating)} \u00B7 {REVIEW_STATUS_LABELS[review.status] ?? review.status}
                      </p>
                    </div>
                    <p className="text-sm text-[var(--ink-soft)]">
                      {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <p className="mt-4 text-base font-semibold">{review.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">{review.content}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm leading-7 text-[var(--ink-soft)]">
                \uC544\uC9C1 \uC791\uC131\uD55C \uB9AC\uBDF0\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
