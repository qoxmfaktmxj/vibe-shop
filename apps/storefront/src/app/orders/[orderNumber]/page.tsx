import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CancelOrderButton } from "@/components/order/cancel-order-button";
import { formatPrice } from "@/lib/currency";
import { formatOrderStatus } from "@/lib/order-status";
import { ApiNotFoundError, getAuthSession, getOrder } from "@/lib/server-api";

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ phone?: string }>;
}) {
  const session = await getAuthSession().catch(() => ({ authenticated: false, user: null }));
  const { orderNumber } = await params;
  const { phone } = await searchParams;
  const guestPhone = phone?.trim() ?? "";

  if (!session.authenticated && !guestPhone) {
    redirect(`/lookup-order?orderNumber=${encodeURIComponent(orderNumber)}`);
  }

  let order;

  try {
    order = await getOrder(orderNumber, session.authenticated ? undefined : guestPhone);
  } catch (error) {
    if (error instanceof ApiNotFoundError) {
      notFound();
    }
    throw error;
  }

  const backHref = session.authenticated
    ? "/orders"
    : `/orders?phone=${encodeURIComponent(guestPhone)}`;

  return (
    <div className="grid-shell lg:grid-cols-[1.2fr_0.8fr]">
      <section className="surface-card rounded-[36px] p-8 sm:p-10">
        <p className="display-eyebrow">Order</p>
        <h1 className="display-heading mt-4 text-4xl font-semibold">주문이 접수되었습니다.</h1>
        <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">
          주문번호 <strong className="text-[var(--ink)]">{order.orderNumber}</strong>로 주문 상태와
          배송 정보를 확인할 수 있습니다.
        </p>

        <div className="mt-8 rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.76)] p-6">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--ink-soft)]">주문 상태</dt>
              <dd className="mt-1 font-semibold">{formatOrderStatus(order.status)}</dd>
            </div>
            <div>
              <dt className="text-[var(--ink-soft)]">주문 유형</dt>
              <dd className="mt-1 font-semibold">
                {order.customerType === "MEMBER" ? "회원 주문" : "비회원 주문"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--ink-soft)]">받는 분</dt>
              <dd className="mt-1 font-semibold">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-[var(--ink-soft)]">연락처</dt>
              <dd className="mt-1 font-semibold">{order.phone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[var(--ink-soft)]">배송지</dt>
              <dd className="mt-1 font-semibold">
                ({order.postalCode}) {order.address1} {order.address2}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[var(--ink-soft)]">메모</dt>
              <dd className="mt-1 font-semibold">
                {order.note || "배송 메모가 없습니다."}
              </dd>
            </div>
          </dl>
        </div>

        {order.status === "RECEIVED" ? (
          <CancelOrderButton
            orderNumber={order.orderNumber}
            phone={session.authenticated ? undefined : guestPhone}
          />
        ) : null}
      </section>

      <aside className="surface-card rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,239,233,0.76))] p-8 sm:p-10">
        <p className="display-eyebrow">주문 내역</p>
        <div className="mt-6 space-y-4 text-sm">
          {order.lines.map((line) => (
            <div key={`${line.productId}-${line.productName}`} className="flex justify-between gap-4">
              <span className="text-[var(--ink-soft)]">
                {line.productName} x {line.quantity}
              </span>
              <span>{formatPrice(line.lineTotal)}원</span>
            </div>
          ))}
        </div>

        <div className="stat-divider mt-8 space-y-3 pt-5 text-sm">
          <div className="flex justify-between">
            <span>상품 합계</span>
            <span>{formatPrice(order.subtotal)}원</span>
          </div>
          <div className="flex justify-between">
            <span>배송비</span>
            <span>{formatPrice(order.shippingFee)}원</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>총 결제 금액</span>
            <span>{formatPrice(order.total)}원</span>
          </div>
        </div>

        <Link href={backHref} className="button-secondary mt-8 px-5 py-3">
          주문 목록으로 이동
        </Link>
        <Link href="/" className="button-primary mt-4 px-5 py-3">
          메인으로 돌아가기
        </Link>
      </aside>
    </div>
  );
}
