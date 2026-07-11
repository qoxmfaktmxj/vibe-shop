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

export default async function AdminPage() {
  await requireAdminSession();
  const dashboard = await getAdminDashboard();
  const metrics = [
    { label: "전체 상품", value: dashboard.productCount, detail: "메인 노출 " + dashboard.featuredProductCount + "개" },
    { label: "저재고", value: dashboard.lowStockCount, detail: "재고 확인 필요" },
    { label: "전체 회원", value: dashboard.memberCount, detail: "활성 " + dashboard.activeMemberCount + "명" },
    { label: "전체 주문", value: dashboard.totalOrderCount, detail: "결제 완료 " + dashboard.paidOrderCount + "건" },
  ];

  return (
    <AdminShell
      eyebrow="Overview"
      title="운영 대시보드"
      description="오늘 확인할 지표, 처리 대기 상태, 최근 주문 흐름을 한 화면에 모았습니다."
      actions={
        <>
          <Link href="/admin/orders" className="admin-button-secondary px-4 py-2.5">주문 관리</Link>
          <Link href="/admin/products" className="admin-button px-4 py-2.5">상품 관리</Link>
        </>
      }
    >
      <section aria-label="핵심 지표" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="admin-card p-5">
            <p className="text-xs font-medium text-[var(--ink-soft)]">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.03em]">{metric.value}</p>
            <p className="mt-2 text-xs text-[var(--ink-soft)]">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <article className="admin-card">
          <header className="border-b border-[var(--line)] px-5 py-4">
            <p className="text-xs font-semibold">처리 대기</p>
            <p className="mt-1 text-xs text-[var(--ink-soft)]">우선순위가 높은 운영 항목입니다.</p>
          </header>
          <div className="divide-y divide-[var(--line)]">
            <Link href="/admin/products" className="flex items-center justify-between gap-4 px-5 py-5 transition-colors hover:bg-[var(--background)]">
              <div>
                <p className="text-sm font-semibold">저재고 상품</p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">판매 가능 수량을 확인하세요.</p>
              </div>
              <strong className="text-2xl font-semibold text-[var(--accent)]">{dashboard.lowStockCount}</strong>
            </Link>
            <Link href="/admin/orders" className="flex items-center justify-between gap-4 px-5 py-5 transition-colors hover:bg-[var(--background)]">
              <div>
                <p className="text-sm font-semibold">결제 대기 주문</p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">입금과 상태 변경을 확인하세요.</p>
              </div>
              <strong className="text-2xl font-semibold text-[var(--accent)]">{dashboard.pendingOrderCount}</strong>
            </Link>
            <Link href="/admin/members" className="flex items-center justify-between gap-4 px-5 py-5 transition-colors hover:bg-[var(--background)]">
              <div>
                <p className="text-sm font-semibold">휴면·차단 회원</p>
                <p className="mt-1 text-xs text-[var(--ink-soft)]">계정 상태 검토가 필요합니다.</p>
              </div>
              <strong className="text-2xl font-semibold">{dashboard.dormantMemberCount + dashboard.blockedMemberCount}</strong>
            </Link>
          </div>
        </article>

        <article className="admin-card min-w-0">
          <header className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
            <div>
              <p className="text-xs font-semibold">최근 주문</p>
              <p className="mt-1 text-xs text-[var(--ink-soft)]">가장 최근 생성된 주문입니다.</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold text-[var(--accent)]">전체 보기</Link>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-left text-sm">
              <thead className="bg-[var(--background)] text-[11px] uppercase tracking-[0.06em] text-[var(--ink-soft)]">
                <tr>
                  <th className="px-5 py-3 font-medium">주문번호</th>
                  <th className="px-5 py-3 font-medium">고객</th>
                  <th className="px-5 py-3 font-medium">상태</th>
                  <th className="px-5 py-3 font-medium">금액</th>
                  <th className="px-5 py-3 font-medium">생성일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {dashboard.recentOrders.map((order) => (
                  <tr key={order.orderNumber} className="hover:bg-[var(--background)]">
                    <td className="px-5 py-4 font-semibold">{order.orderNumber}</td>
                    <td className="px-5 py-4">{order.customerName}</td>
                    <td className="px-5 py-4 text-[var(--ink-soft)]">{order.status}</td>
                    <td className="px-5 py-4">{formatPrice(order.total)}원</td>
                    <td className="px-5 py-4 text-xs text-[var(--ink-soft)]">{formatDateTime(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="admin-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold">현재 메인 전시</p>
          <p className="mt-2 text-lg font-semibold">{dashboard.display.heroTitle}</p>
          <p className="mt-1 text-xs text-[var(--ink-soft)]">CTA: {dashboard.display.heroCtaLabel}</p>
        </div>
        <Link href="/admin/display" className="admin-button-secondary px-4 py-2.5">전시 편집</Link>
      </section>
    </AdminShell>
  );
}
