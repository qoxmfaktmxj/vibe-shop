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
    title: "전시",
    body: "메인 히어로 문구와 배너, 섹션 구성을 한 화면에서 빠르게 조정합니다.",
  },
  {
    href: "/admin/products",
    title: "상품",
    body: "상품명, 가격, 재고, 배지와 카테고리 운영 상태를 함께 관리합니다.",
  },
  {
    href: "/admin/orders",
    title: "주문",
    body: "주문 상태를 바꾸고 결제 흐름을 확인하는 운영 화면으로 이동합니다.",
  },
  {
    href: "/admin/members",
    title: "회원",
    body: "회원 상태, 로그인 이력, 누적 구매 금액을 빠르게 점검합니다.",
  },
  {
    href: "/admin/reviews",
    title: "리뷰",
    body: "리뷰 공개 상태와 품질 이슈를 확인하고 운영 기준에 맞게 조정합니다.",
  },
  {
    href: "/admin/analytics",
    title: "통계",
    body: "주문, 회원, 카테고리 매출 추이를 묶어서 살펴봅니다.",
  },
  {
    href: "/admin/operations",
    title: "운영",
    body: "저재고, 이상 주문, 저평점 리뷰를 한 번에 모니터링합니다.",
  },
];

export default async function AdminPage() {
  await requireAdminSession();
  const dashboard = await getAdminDashboard();

  return (
    <AdminShell
      eyebrow="대시보드"
      title="오늘 운영 지표를 빠르게 확인하는 메인 보드"
      description="핵심 KPI 요약, 최근 주문, 자주 쓰는 운영 화면 진입점을 한곳에 모았습니다."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="admin-card rounded-[28px] p-6">
            <p className="eyebrow text-[var(--ink-soft)]">상품</p>
            <p className="mt-4 text-4xl font-semibold">{dashboard.productCount}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              메인 노출 {dashboard.featuredProductCount} / 저재고 주의 {dashboard.lowStockCount}
            </p>
          </article>
          <article className="admin-card rounded-[28px] p-6">
            <p className="eyebrow text-[var(--ink-soft)]">회원</p>
            <p className="mt-4 text-4xl font-semibold">{dashboard.memberCount}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              활성 {dashboard.activeMemberCount} / 휴면 {dashboard.dormantMemberCount}
            </p>
          </article>
          <article className="admin-card rounded-[28px] p-6">
            <p className="eyebrow text-[var(--ink-soft)]">주문</p>
            <p className="mt-4 text-4xl font-semibold">{dashboard.totalOrderCount}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              결제 완료 {dashboard.paidOrderCount} / 결제 대기 {dashboard.pendingOrderCount}
            </p>
          </article>
          <article className="admin-card rounded-[28px] p-6">
            <p className="eyebrow text-[var(--ink-soft)]">메인 히어로</p>
            <p className="mt-4 text-2xl font-semibold">{dashboard.display.heroTitle}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{dashboard.display.heroCtaLabel}</p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="admin-card rounded-[36px] p-8">
            <p className="eyebrow text-[var(--ink-soft)]">작업 공간</p>
            <h2 className="display mt-4 text-3xl font-semibold">운영 화면 바로가기</h2>
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
            <p className="eyebrow text-[var(--ink-soft)]">최근 주문</p>
            <h2 className="display mt-4 text-3xl font-semibold">실시간 흐름</h2>
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
                      {order.status} / {formatPrice(order.total)}원
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <article className="admin-card rounded-[36px] p-8">
          <p className="eyebrow text-[var(--ink-soft)]">스포트라이트</p>
          <h2 className="display mt-4 text-3xl font-semibold">메인 추천 상품</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dashboard.spotlightProducts.map((product) => (
              <div key={product.id} className="rounded-[28px] border border-[var(--line)] bg-white/72 p-5">
                <p className="eyebrow text-[var(--ink-soft)]">{product.categoryName}</p>
                <p className="mt-3 text-lg font-semibold">{product.name}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{product.summary}</p>
                <p className="mt-4 text-sm font-semibold">
                  {formatPrice(product.price)}원 / 재고 {product.stock}
                </p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </AdminShell>
  );
}
