import Link from "next/link";

import { OrderHistoryForm } from "@/components/order/order-history-form";
import { formatPrice } from "@/lib/currency";
import { formatOrderStatus } from "@/lib/order-status";
import { listOrders } from "@/lib/server-api";

export default async function OrderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const { phone } = await searchParams;
  const normalizedPhone = phone?.trim() ?? "";
  const orders = normalizedPhone ? await listOrders(normalizedPhone) : [];

  return (
    <div className="grid-shell">
      <section className="surface-card rounded-[36px] p-8 sm:p-10">
        <p className="display-eyebrow">Orders</p>
        <h1 className="display-heading mt-4 text-4xl font-semibold">
          주문내역 조회
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
          주문 시 입력한 연락처로 최근 주문 내역을 다시 확인할 수 있습니다.
        </p>
        <OrderHistoryForm />
      </section>

      {normalizedPhone ? (
        <section className="surface-card rounded-[36px] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="display-eyebrow">History</p>
              <h2 className="display-heading mt-3 text-3xl font-semibold">
                주문내역 {orders.length}건
              </h2>
            </div>
            <p className="text-sm text-[var(--ink-soft)]">
              조회 연락처 {normalizedPhone}
            </p>
          </div>

          {orders.length > 0 ? (
            <div className="mt-8 space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.orderNumber}
                  href={`/orders/${order.orderNumber}`}
                  className="block rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 transition hover:translate-y-[-2px]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <p className="display-heading text-2xl font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-[var(--ink-soft)]">{order.customerName}</p>
                      <p className="text-sm text-[var(--ink-soft)]">
                        상품 수량 {order.itemCount}개
                      </p>
                    </div>
                    <div className="space-y-2 text-sm sm:text-right">
                      <p className="font-semibold text-[var(--ink)]">{formatOrderStatus(order.status)}</p>
                      <p>{formatPrice(order.total)}원</p>
                      <p className="text-[var(--ink-soft)]">
                        {new Date(order.createdAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm text-[var(--ink-soft)]">
              해당 연락처로 조회되는 주문이 없습니다.
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
