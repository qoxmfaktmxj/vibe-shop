import Link from "next/link";

import { AdminShell } from "@/components/admin-shell";
import { requireAdminSession } from "@/lib/admin-require-session";
import { getAdminDashboard } from "@/lib/admin-server-api";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}

const routeCards = [
  {
    href: "/admin/display",
    title: "\uC804\uC2DC",
    body: "\uBA54\uC778 \uD788\uC5B4\uB85C \uBB38\uAD6C\uC640 \uBC30\uB108, \uC139\uC158 \uAD6C\uC131\uC744 \uD55C \uD654\uBA74\uC5D0\uC11C \uBE60\uB974\uAC8C \uC870\uC815\uD569\uB2C8\uB2E4.",
  },
  {
    href: "/admin/products",
    title: "\uC0C1\uD488",
    body: "\uC0C1\uD488\uBA85, \uAC00\uACA9, \uC7AC\uACE0, \uBC30\uC9C0\uC640 \uCE74\uD14C\uACE0\uB9AC \uC6B4\uC601 \uC0C1\uD0DC\uB97C \uD568\uAED8 \uAD00\uB9AC\uD569\uB2C8\uB2E4.",
  },
  {
    href: "/admin/orders",
    title: "\uC8FC\uBB38",
    body: "\uC8FC\uBB38 \uC0C1\uD0DC\uB97C \uBC14\uAFB8\uACE0 \uACB0\uC81C \uD750\uB984\uC744 \uD655\uC778\uD558\uB294 \uC6B4\uC601 \uD654\uBA74\uC73C\uB85C \uC774\uB3D9\uD569\uB2C8\uB2E4.",
  },
  {
    href: "/admin/members",
    title: "\uD68C\uC6D0",
    body: "\uD68C\uC6D0 \uC0C1\uD0DC, \uB85C\uADF8\uC778 \uC774\uB825, \uB204\uC801 \uAD6C\uB9E4 \uAE08\uC561\uC744 \uBE60\uB974\uAC8C \uC810\uAC80\uD569\uB2C8\uB2E4.",
  },
  {
    href: "/admin/reviews",
    title: "\uB9AC\uBDF0",
    body: "\uB9AC\uBDF0 \uACF5\uAC1C \uC0C1\uD0DC\uC640 \uD488\uC9C8 \uC774\uC288\uB97C \uD655\uC778\uD558\uACE0 \uC6B4\uC601 \uAE30\uC900\uC5D0 \uB9DE\uAC8C \uC870\uC815\uD569\uB2C8\uB2E4.",
  },
  {
    href: "/admin/analytics",
    title: "\uD1B5\uACC4",
    body: "\uC8FC\uBB38, \uD68C\uC6D0, \uCE74\uD14C\uACE0\uB9AC \uB9E4\uCD9C \uCD94\uC774\uB97C \uBB36\uC5B4\uC11C \uC0B4\uD3B4\uBD05\uB2C8\uB2E4.",
  },
  {
    href: "/admin/operations",
    title: "\uC6B4\uC601",
    body: "\uC800\uC7AC\uACE0, \uC774\uC0C1 \uC8FC\uBB38, \uC800\uD3C9\uC810 \uB9AC\uBDF0\uB97C \uD55C \uBC88\uC5D0 \uBAA8\uB2C8\uD130\uB9C1\uD569\uB2C8\uB2E4.",
  },
];

export default async function AdminPage() {
  await requireAdminSession();
  const dashboard = await getAdminDashboard();

  return (
    <AdminShell
      eyebrow="\uB300\uC2DC\uBCF4\uB4DC"
      title="\uC624\uB298 \uC6B4\uC601 \uC9C0\uD45C\uB97C \uBE60\uB974\uAC8C \uD655\uC778\uD558\uB294 \uBA54\uC778 \uBCF4\uB4DC"
      description="\uD575\uC2EC KPI \uC694\uC57D, \uCD5C\uADFC \uC8FC\uBB38, \uC790\uC8FC \uC4F0\uB294 \uC6B4\uC601 \uD654\uBA74 \uC9C4\uC785\uC810\uC744 \uD55C\uACF3\uC5D0 \uBAA8\uC558\uC2B5\uB2C8\uB2E4."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="admin-card rounded-[28px] p-6">
            <p className="eyebrow text-[var(--ink-soft)]">\uC0C1\uD488</p>
            <p className="mt-4 text-4xl font-semibold">{dashboard.productCount}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              \uBA54\uC778 \uB178\uCD9C {dashboard.featuredProductCount} / \uC800\uC7AC\uACE0 \uC8FC\uC758 {dashboard.lowStockCount}
            </p>
          </article>
          <article className="admin-card rounded-[28px] p-6">
            <p className="eyebrow text-[var(--ink-soft)]">\uD68C\uC6D0</p>
            <p className="mt-4 text-4xl font-semibold">{dashboard.memberCount}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              \uD65C\uC131 {dashboard.activeMemberCount} / \uD734\uBA74 {dashboard.dormantMemberCount}
            </p>
          </article>
          <article className="admin-card rounded-[28px] p-6">
            <p className="eyebrow text-[var(--ink-soft)]">\uC8FC\uBB38</p>
            <p className="mt-4 text-4xl font-semibold">{dashboard.totalOrderCount}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              \uACB0\uC81C \uC644\uB8CC {dashboard.paidOrderCount} / \uACB0\uC81C \uB300\uAE30 {dashboard.pendingOrderCount}
            </p>
          </article>
          <article className="admin-card rounded-[28px] p-6">
            <p className="eyebrow text-[var(--ink-soft)]">\uBA54\uC778 \uD788\uC5B4\uB85C</p>
            <p className="mt-4 text-2xl font-semibold">{dashboard.display.heroTitle}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{dashboard.display.heroCtaLabel}</p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="admin-card rounded-[36px] p-8">
            <p className="eyebrow text-[var(--ink-soft)]">\uC791\uC5C5 \uACF5\uAC04</p>
            <h2 className="display mt-4 text-3xl font-semibold">\uC6B4\uC601 \uD654\uBA74 \uBC14\uB85C\uAC00\uAE30</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {routeCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-[28px] border border-[var(--line)] bg-white/72 p-5 transition hover:border-[var(--line-strong)] hover:translate-y-[-1px]"
                >
                  <p className="text-xl font-semibold">{card.title}</p>
                  <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{card.body}</p>
                </Link>
              ))}
            </div>
          </article>

          <article className="admin-card rounded-[36px] p-8">
            <p className="eyebrow text-[var(--ink-soft)]">\uCD5C\uADFC \uC8FC\uBB38</p>
            <h2 className="display mt-4 text-3xl font-semibold">\uC2E4\uC2DC\uAC04 \uD750\uB984</h2>
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
                      {order.status} / {formatPrice(order.total)}\uC6D0
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <article className="admin-card rounded-[36px] p-8">
          <p className="eyebrow text-[var(--ink-soft)]">\uC2A4\uD3EC\uD2B8\uB77C\uC774\uD2B8</p>
          <h2 className="display mt-4 text-3xl font-semibold">\uBA54\uC778 \uCD94\uCC9C \uC0C1\uD488</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboard.spotlightProducts.map((product) => (
              <div key={product.id} className="rounded-[28px] border border-[var(--line)] bg-white/72 p-5">
                <p className="eyebrow text-[var(--ink-soft)]">{product.categoryName}</p>
                <p className="mt-3 text-lg font-semibold">{product.name}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{product.summary}</p>
                <p className="mt-4 text-sm font-semibold">
                  {formatPrice(product.price)}\uC6D0 / \uC7AC\uACE0 {product.stock}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </AdminShell>
  );
}
