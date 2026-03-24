import Link from "next/link";

import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/require-admin-session";
import { getAdminDashboard } from "@/lib/server-api";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}

const routeCards = [
  {
    href: "/display",
    title: "Display",
    body: "Edit home hero copy and merchandising sections without loading catalog or moderation data.",
  },
  {
    href: "/products",
    title: "Products",
    body: "Handle product edits and category taxonomy in the catalog workspace.",
  },
  {
    href: "/orders",
    title: "Orders",
    body: "Review operational state changes in a dedicated order queue.",
  },
  {
    href: "/members",
    title: "Members",
    body: "Moderate member status changes separately from the rest of the console.",
  },
  {
    href: "/reviews",
    title: "Reviews",
    body: "Run moderation on review content and visibility without extra dashboard payload.",
  },
  {
    href: "/analytics",
    title: "Analytics",
    body: "Inspect business metrics on a route that only loads reporting data.",
  },
  {
    href: "/operations",
    title: "Operations",
    body: "Monitor low stock, suspicious orders, and review watchlists independently.",
  },
];

export default async function AdminPage() {
  await requireAdminSession();
  const dashboard = await getAdminDashboard();

  return (
    <AdminShell
      eyebrow="Dashboard"
      title="Admin summary without the monolith."
      description="The root route now stays focused on KPI summary, recent activity, and navigation to dedicated admin workspaces."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="admin-card rounded-[28px] p-6">
            <p className="eyebrow text-[var(--ink-soft)]">Products</p>
            <p className="mt-4 text-4xl font-semibold">{dashboard.productCount}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Featured {dashboard.featuredProductCount} / Low stock {dashboard.lowStockCount}
            </p>
          </article>
          <article className="admin-card rounded-[28px] p-6">
            <p className="eyebrow text-[var(--ink-soft)]">Members</p>
            <p className="mt-4 text-4xl font-semibold">{dashboard.memberCount}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Active {dashboard.activeMemberCount} / Dormant {dashboard.dormantMemberCount}
            </p>
          </article>
          <article className="admin-card rounded-[28px] p-6">
            <p className="eyebrow text-[var(--ink-soft)]">Orders</p>
            <p className="mt-4 text-4xl font-semibold">{dashboard.totalOrderCount}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              Paid {dashboard.paidOrderCount} / Pending {dashboard.pendingOrderCount}
            </p>
          </article>
          <article className="admin-card rounded-[28px] p-6">
            <p className="eyebrow text-[var(--ink-soft)]">Display</p>
            <p className="mt-4 text-2xl font-semibold">{dashboard.display.heroTitle}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{dashboard.display.heroCtaLabel}</p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="admin-card rounded-[36px] p-8">
            <p className="eyebrow text-[var(--ink-soft)]">Workspaces</p>
            <h2 className="display mt-4 text-3xl font-semibold">Dedicated routes for each operating area</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {routeCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-[28px] border border-[var(--line)] bg-white/72 p-5 transition hover:border-[var(--line-strong)]"
                >
                  <p className="text-xl font-semibold">{card.title}</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{card.body}</p>
                </Link>
              ))}
            </div>
          </article>

          <article className="admin-card rounded-[36px] p-8">
            <p className="eyebrow text-[var(--ink-soft)]">Recent Orders</p>
            <h2 className="display mt-4 text-3xl font-semibold">Heartbeat</h2>
            <div className="mt-8 space-y-4">
              {dashboard.recentOrders.map((order) => (
                <div key={order.orderNumber} className="rounded-[28px] border border-[var(--line)] bg-white/72 p-5">
                  <div className="flex flex-col gap-2">
                    <p className="text-lg font-semibold">{order.orderNumber}</p>
                    <p className="text-sm text-[var(--ink-soft)]">
                      {order.customerName} / {order.customerType}
                    </p>
                    <p className="text-sm text-[var(--ink-soft)]">{formatDateTime(order.createdAt)}</p>
                    <p className="text-sm font-semibold">
                      {order.status} / {formatPrice(order.total)} KRW
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <article className="admin-card rounded-[36px] p-8">
          <p className="eyebrow text-[var(--ink-soft)]">Featured Picks</p>
          <h2 className="display mt-4 text-3xl font-semibold">Storefront spotlight</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboard.spotlightProducts.map((product) => (
              <div key={product.id} className="rounded-[28px] border border-[var(--line)] bg-white/72 p-5">
                <p className="eyebrow text-[var(--ink-soft)]">{product.categoryName}</p>
                <p className="mt-3 text-lg font-semibold">{product.name}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{product.summary}</p>
                <p className="mt-4 text-sm font-semibold">
                  {formatPrice(product.price)} KRW / Stock {product.stock}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </AdminShell>
  );
}
