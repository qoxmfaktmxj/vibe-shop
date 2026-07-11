import Link from "next/link";

import { formatPrice } from "@/lib/currency";
import { formatOrderStatus } from "@/lib/order-status";
import { getAuthSession, listOrders } from "@/lib/server-api";

export default async function OrderHistoryPage() {
  const session = await getAuthSession().catch(() => ({ authenticated: false, user: null }));
  const orders = session.authenticated ? await listOrders() : [];

  const title = session.authenticated ? "회원 주문 내역" : "주문 내역 조회";
  const description = session.authenticated
    ? "로그인한 계정에 연결된 주문만 확인할 수 있습니다."
    : "비회원 주문은 주문번호와 연락처를 확인한 뒤 해당 주문 한 건만 조회할 수 있습니다.";

  return (
    <div className="grid-shell">
      <section className="border-y border-[var(--line)] py-10 sm:py-14">
        <p className="display-eyebrow">주문</p>
        <h1 className="display-heading mt-4 text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
          {description}
        </p>
        {session.authenticated ? (
          <div className="mt-8 border-l-2 border-[var(--line-strong)] px-5 py-2 text-sm text-[var(--ink-soft)]">
            {session.user?.name} 계정에 연결된 주문만 표시됩니다.
          </div>
        ) : (
          <Link href="/lookup-order" className="button-primary mt-8 px-5 py-3">
            비회원 주문 조회
          </Link>
        )}
      </section>

      {session.authenticated && (
        <section>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="display-eyebrow">주문 내역</p>
              <h2 className="display-heading mt-3 text-3xl">
                주문 내역 {orders.length}건
              </h2>
            </div>
            <p className="text-sm text-[var(--ink-soft)]">
              {session.user?.name} 계정
            </p>
          </div>

          {orders.length > 0 ? (
            <div className="mt-8 space-y-4">
              {orders.map((order) => {
                const detailHref = `/orders/${order.orderNumber}`;

                return (
                  <Link
                    key={order.orderNumber}
                    href={detailHref}
                    className="block border-t border-[var(--line)] py-6 transition-colors hover:bg-[var(--surface-low)] sm:px-4"
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
            <div className="mt-8 border-y border-[var(--line)] py-10 text-sm text-[var(--ink-soft)]">
              아직 계정에 연결된 주문이 없습니다.
            </div>
          )}
        </section>
      )}
    </div>
  );
}
