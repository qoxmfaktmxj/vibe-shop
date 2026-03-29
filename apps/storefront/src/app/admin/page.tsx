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

  return (
    <AdminShell
      eyebrow="대시보드"
      title="오늘 운영 지표를 빠르게 확인하는 메인 보드"
      description="핵심 KPI 요약과 최근 주문 흐름만 남겨, 첫 화면에서 오늘 봐야 할 숫자와 상태를 바로 읽을 수 있도록 정리했습니다."
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
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              CTA {dashboard.display.heroCtaLabel}
            </p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
          <article className="admin-card rounded-[36px] p-8">
            <p className="eyebrow text-[var(--ink-soft)]">오늘 체크</p>
            <h2 className="display mt-4 text-3xl font-semibold">운영 메모</h2>
            <div className="mt-8 grid gap-4">
              <div className="rounded-[24px] border border-[var(--line)] bg-white/72 p-5">
                <p className="text-base font-semibold text-[var(--ink)]">상품 운영</p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                  저재고 상품 {dashboard.lowStockCount}개가 있어 상품 탭에서 재고와 노출 상태를 함께 보는 편이 좋습니다.
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--line)] bg-white/72 p-5">
                <p className="text-base font-semibold text-[var(--ink)]">회원 상태</p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                  휴면 회원 {dashboard.dormantMemberCount}명, 차단 회원 {dashboard.blockedMemberCount}명을 회원 탭에서 바로 확인할 수 있습니다.
                </p>
              </div>
              <div className="rounded-[24px] border border-[var(--line)] bg-white/72 p-5">
                <p className="text-base font-semibold text-[var(--ink)]">주문 흐름</p>
                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                  결제 대기 주문 {dashboard.pendingOrderCount}건은 주문 탭에서 바로 상태 변경까지 이어집니다.
                </p>
              </div>
            </div>
          </article>

          <article className="admin-card rounded-[36px] p-8">
            <p className="eyebrow text-[var(--ink-soft)]">최근 주문</p>
            <h2 className="display mt-4 text-3xl font-semibold">실시간 흐름</h2>
            <div className="mt-8 space-y-4">
              {dashboard.recentOrders.map((order) => (
                <div key={order.orderNumber} className="rounded-[24px] border border-[var(--line)] bg-white/72 p-5">
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
      </div>
    </AdminShell>
  );
}
