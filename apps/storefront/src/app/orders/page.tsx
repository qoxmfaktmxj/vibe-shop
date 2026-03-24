import Link from "next/link";

import { OrderHistoryForm } from "@/components/order/order-history-form";
import { formatPrice } from "@/lib/currency";
import { formatOrderStatus } from "@/lib/order-status";
import { getAuthSession, listOrders } from "@/lib/server-api";

export default async function OrderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const session = await getAuthSession().catch(() => ({ authenticated: false, user: null }));
  const { phone } = await searchParams;
  const normalizedPhone = phone?.trim() ?? "";
  const orders = session.authenticated
    ? await listOrders()
    : normalizedPhone
      ? await listOrders(normalizedPhone)
      : [];

  const title = session.authenticated ? "회원 주문 내역" : "주문 내역 조회";
  const description = session.authenticated
    ? "로그인한 계정에 연결된 주문만 확인할 수 있습니다."
    : "주문 시 입력한 연락처로 비회원 주문 내역을 다시 확인할 수 있습니다.";

  return (
    <div className="grid-shell">
      <section className="surface-card rounded-[36px] p-8 sm:p-10">
        <p className="display-eyebrow">주문</p>
        <h1 className="display-heading mt-4 text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
          {description}
        </p>
        {session.authenticated ? (
          <div className="mt-8 rounded-sm border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm text-[var(--ink-soft)]">
            {session.user?.name} 계정에 연결된 주문만 표시됩니다.
          </div>
        ) : (
          <OrderHistoryForm />
        )}
      </section>

      {(session.authenticated || normalizedPhone) && (
        <section className="surface-card rounded-[36px] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="display-eyebrow">주문 내역</p>
              <h2 className="display-heading mt-3 text-3xl">
                주문 내역 {orders.length}건
              </h2>
            </div>
            <p className="text-sm text-[var(--ink-soft)]">
              {session.authenticated
                ? `${session.user?.name} 계정`
                : `조회 연락처 ${normalizedPhone}`}
            </p>
          </div>

          {orders.length > 0 ? (
            <div className="mt-8 space-y-4">
              {orders.map((order) => {
                const detailHref = session.authenticated
                  ? `/orders/${order.orderNumber}`
                  : `/orders/${order.orderNumber}?phone=${encodeURIComponent(normalizedPhone)}`;

                return (
                  <Link
                    key={order.orderNumber}
                    href={detailHref}
                    className="block rounded-sm border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 transition hover:translate-y-[-2px]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <p className="display-heading text-2xl">{order.orderNumber}</p>
                        <p className="text-sm text-[var(--ink-soft)]">{order.customerName}</p>
                        <p className="text-sm text-[var(--ink-soft)]">
                          상품 수량 {order.itemCount}개
                        </p>
                      </div>
                      <div className="space-y-2 text-sm sm:text-right">
                        <p className="font-semibold text-[var(--ink)]">
                          {formatOrderStatus(order.status)}
                        </p>
                        <p>{formatPrice(order.total)}원</p>
                        <p className="text-[var(--ink-soft)]">
                          {new Date(order.createdAt).toLocaleString("ko-KR")}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-sm border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6 text-sm text-[var(--ink-soft)]">
              {session.authenticated
                ? "아직 계정에 연결된 주문이 없습니다."
                : "해당 연락처로 조회되는 주문이 없습니다."}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
