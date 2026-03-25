"use client";

import type { AdminStatistics } from "@/lib/admin-contracts";

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function barWidth(value: number, maxValue: number) {
  if (maxValue <= 0) {
    return "4%";
  }
  return `${Math.max(4, (value / maxValue) * 100)}%`;
}

export function AdminStatisticsPanel({
  statistics,
}: {
  statistics: AdminStatistics;
}) {
  const maxDailyRevenue = Math.max(...statistics.dailyMetrics.map((item) => item.paidRevenue), 0);

  return (
    <article className="admin-card rounded-[36px] p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-[var(--ink-soft)]">운영 통계</p>
          <h2 className="display mt-4 text-3xl font-semibold">주문과 회원 흐름</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            최근 7일과 30일 기준 주문, 매출, 신규 회원 흐름을 한 화면에서 확인합니다.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[28px] border border-[var(--line)] bg-white/72 p-6">
          <p className="eyebrow text-[var(--ink-soft)]">7 Days</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <p className="rounded-[22px] bg-[rgba(214,81,45,0.06)] px-4 py-3 text-sm">
              주문 {statistics.sevenDay.orderCount}건
            </p>
            <p className="rounded-[22px] bg-[rgba(36,93,90,0.08)] px-4 py-3 text-sm">
              결제 {formatPrice(statistics.sevenDay.paidRevenue)}원
            </p>
            <p className="rounded-[22px] bg-black/5 px-4 py-3 text-sm">
              신규 회원 {statistics.sevenDay.newMemberCount}명
            </p>
            <p className="rounded-[22px] bg-black/5 px-4 py-3 text-sm">
              취소 {statistics.sevenDay.cancelledOrderCount}건 / 환불 {statistics.sevenDay.refundedOrderCount}건
            </p>
          </div>
        </div>

        <div className="rounded-[28px] border border-[var(--line)] bg-white/72 p-6">
          <p className="eyebrow text-[var(--ink-soft)]">30 Days</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <p className="rounded-[22px] bg-[rgba(214,81,45,0.06)] px-4 py-3 text-sm">
              주문 {statistics.thirtyDay.orderCount}건
            </p>
            <p className="rounded-[22px] bg-[rgba(36,93,90,0.08)] px-4 py-3 text-sm">
              결제 {formatPrice(statistics.thirtyDay.paidRevenue)}원
            </p>
            <p className="rounded-[22px] bg-black/5 px-4 py-3 text-sm">
              신규 회원 {statistics.thirtyDay.newMemberCount}명
            </p>
            <p className="rounded-[22px] bg-black/5 px-4 py-3 text-sm">
              취소 {statistics.thirtyDay.cancelledOrderCount}건 / 환불 {statistics.thirtyDay.refundedOrderCount}건
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-[var(--line)] bg-white/72 p-6">
          <p className="eyebrow text-[var(--ink-soft)]">Daily Trend</p>
          <div className="mt-6 grid gap-3">
            {statistics.dailyMetrics.map((item) => (
              <div key={item.date} className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.date}</span>
                  <span className="text-[var(--ink-soft)]">
                    주문 {item.orderCount}건 / 신규 회원 {item.newMemberCount}명 / {formatPrice(item.paidRevenue)}원
                  </span>
                </div>
                <div className="h-3 rounded-full bg-black/6">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: barWidth(item.paidRevenue, maxDailyRevenue) }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="rounded-[28px] border border-[var(--line)] bg-white/72 p-6">
            <p className="eyebrow text-[var(--ink-soft)]">Category Sales</p>
            <div className="mt-5 grid gap-3">
              {statistics.categorySales.map((item) => (
                <div key={item.categorySlug} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold">{item.categoryName}</p>
                    <p className="text-[var(--ink-soft)]">{item.quantity}개 판매</p>
                  </div>
                  <p>{formatPrice(item.revenue)}원</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-[var(--line)] bg-white/72 p-6">
            <p className="eyebrow text-[var(--ink-soft)]">Top Products</p>
            <div className="mt-5 grid gap-3">
              {statistics.topProducts.map((item) => (
                <div key={item.productId} className="flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-[var(--ink-soft)]">{item.categoryName} / {item.quantity}개 판매</p>
                  </div>
                  <p>{formatPrice(item.revenue)}원</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
