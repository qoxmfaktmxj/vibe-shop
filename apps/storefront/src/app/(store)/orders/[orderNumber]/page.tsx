import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { CancelOrderButton } from "@/components/order/cancel-order-button";
import { formatPrice } from "@/lib/currency";
import { formatOrderStatus } from "@/lib/order-status";
import { formatPaymentMethod, formatPaymentStatus } from "@/lib/payment";
import { ApiNotFoundError, getAuthSession, getOrder } from "@/lib/server-api";

function getOrderHeading(orderStatus: string, paymentStatus: string) {
  if (orderStatus === "REFUNDED") {
    return {
      title: "주문이 취소되고 환불이 완료되었습니다.",
      description: "모의 환불이 완료되어 결제 상태와 재고가 함께 반영되었습니다.",
    };
  }

  if (orderStatus === "CANCELLED" && paymentStatus === "FAILED") {
    return {
      title: "결제에 실패했습니다.",
      description: "결제가 승인되지 않아 주문은 취소되었고 재고는 자동으로 복구되었습니다.",
    };
  }

  if (orderStatus === "CANCELLED") {
    return {
      title: "주문이 취소되었습니다.",
      description: "취소 처리 후 주문 상태와 결제 상태가 함께 갱신되었습니다.",
    };
  }

  if (paymentStatus === "PENDING") {
    return {
      title: "결제 대기 상태입니다.",
      description: "입금 또는 승인 확인 전까지 주문은 결제 대기로 유지됩니다.",
    };
  }

  return {
    title: "결제가 완료되었습니다.",
    description: "주문번호로 결제 상태와 배송 정보를 계속 확인할 수 있습니다.",
  };
}

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

  const heading = getOrderHeading(order.status, order.paymentStatus);
  const backHref = session.authenticated
    ? "/orders"
    : `/orders?phone=${encodeURIComponent(guestPhone)}`;
  const canCancel = order.status === "PAID" || order.status === "PENDING_PAYMENT";

  return (
    <div className="grid-shell lg:grid-cols-[1.2fr_0.8fr]">
      <section className="surface-card rounded-[36px] p-8 sm:p-10">
        <p className="display-eyebrow">주문</p>
        <h1 className="display-heading mt-4 text-4xl">{heading.title}</h1>
        <p className="mt-4 text-base leading-8 text-[var(--ink-soft)]">{heading.description}</p>

        <div className="mt-6 rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.78)] px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            Order Number
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-[var(--ink)]">
            {order.orderNumber}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
            주문번호와 연락처로 비회원 주문조회와 취소를 이어서 확인할 수 있습니다.
          </p>
        </div>

        <div className="mt-8 rounded-sm border border-[var(--line)] bg-[rgba(255,255,255,0.76)] p-6">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--ink-soft)]">주문 상태</dt>
              <dd className="mt-1 font-semibold">{formatOrderStatus(order.status)}</dd>
            </div>
            <div>
              <dt className="text-[var(--ink-soft)]">결제 상태</dt>
              <dd className="mt-1 font-semibold">{formatPaymentStatus(order.paymentStatus)}</dd>
            </div>
            <div>
              <dt className="text-[var(--ink-soft)]">주문 유형</dt>
              <dd className="mt-1 font-semibold">
                {order.customerType === "MEMBER" ? "회원 주문" : "비회원 주문"}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--ink-soft)]">결제 수단</dt>
              <dd className="mt-1 font-semibold">{formatPaymentMethod(order.paymentMethod)}</dd>
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
              <dt className="text-[var(--ink-soft)]">결제 메모</dt>
              <dd className="mt-1 font-semibold">{order.paymentMessage}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[var(--ink-soft)]">배송 메모</dt>
              <dd className="mt-1 font-semibold">
                {order.note || "배송 메모가 없습니다."}
              </dd>
            </div>
          </dl>
        </div>

        {canCancel ? (
          <CancelOrderButton
            orderNumber={order.orderNumber}
            phone={session.authenticated ? undefined : guestPhone}
          />
        ) : null}
      </section>

      <aside className="surface-card rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,239,233,0.76))] p-8 sm:p-10">
        <p className="display-eyebrow">주문 상품</p>
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
