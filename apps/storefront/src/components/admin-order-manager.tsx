"use client";

import { useMemo, useState, useTransition } from "react";

import { updateOrderStatus } from "@/lib/admin-client-api";
import type { AdminOrder } from "@/lib/admin-contracts";
import { AdminPagination } from "@/components/admin-pagination";

type AdminOrderManagerProps = {
  initialOrders: AdminOrder[];
};

const ORDERS_PER_PAGE = 10;

function formatPrice(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("ko-KR");
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function formatCustomerType(value: string) {
  const labels: Record<string, string> = {
    MEMBER: "회원",
    GUEST: "비회원",
  };
  return labels[value] ?? value;
}

function formatOrderStatus(value: string) {
  const labels: Record<string, string> = {
    PENDING_PAYMENT: "결제 대기",
    PAID: "결제 완료",
    PREPARING: "상품 준비",
    SHIPPED: "배송 중",
    DELIVERED: "배송 완료",
    REFUND_REQUESTED: "환불 요청",
    REFUNDED: "환불 완료",
    CANCELLED: "주문 취소",
  };
  return labels[value] ?? value;
}

export function AdminOrderManager({ initialOrders }: AdminOrderManagerProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [draftStatuses, setDraftStatuses] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return orders;
    }

    return orders.filter((order) =>
      [
        order.orderNumber,
        order.customerName,
        order.phone,
        order.customerType,
        order.status,
        order.paymentMethod,
        order.paymentStatus,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [orders, query]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ORDERS_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE,
  );

  return (
    <article className="admin-card rounded-[36px] p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow text-[var(--ink-soft)]">주문 관리</p>
          <h2 className="display mt-4 text-3xl font-semibold">주문 목록</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            주문번호, 고객, 결제 상태, 현재 처리 단계를 한 줄에서 확인하고 바로
            상태를 바꿀 수 있도록 정리했습니다.
          </p>
        </div>

        <input
          name="orderQuery"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          className="admin-input min-w-[280px] px-4 py-3"
          placeholder="주문번호, 고객명, 연락처 검색"
        />
      </div>

      <div className="mt-8 overflow-x-auto">
        <div className="min-w-[1140px]">
          <div className="grid grid-cols-[1.5fr_1.4fr_1.5fr_1.4fr_1fr_220px] gap-3 rounded-[22px] bg-[rgba(16,33,39,0.04)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
            <div>주문번호</div>
            <div>고객</div>
            <div>주문 정보</div>
            <div>생성 시각</div>
            <div>결제 금액</div>
            <div>상태 변경</div>
          </div>

          <div className="mt-3 space-y-3">
            {paginatedOrders.map((order) => {
              const draftStatus =
                draftStatuses[order.orderNumber] ?? order.status;

              return (
                <div
                  key={order.orderNumber}
                  className="grid grid-cols-[1.5fr_1.4fr_1.5fr_1.4fr_1fr_220px] gap-3 rounded-[24px] border border-[var(--line)] bg-white/72 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-[var(--ink)]">
                      {order.orderNumber}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-[rgba(36,93,90,0.12)] px-2.5 py-1 font-semibold text-[var(--teal)]">
                        {formatOrderStatus(order.status)}
                      </span>
                      <span className="rounded-full bg-[rgba(16,33,39,0.06)] px-2.5 py-1 font-semibold text-[var(--ink-soft)]">
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 text-sm leading-6 text-[var(--ink-soft)]">
                    <p className="font-semibold text-[var(--ink)]">
                      {order.customerName}
                    </p>
                    <p>{formatCustomerType(order.customerType)}</p>
                    <p>{order.phone}</p>
                  </div>

                  <div className="min-w-0 text-sm leading-6 text-[var(--ink-soft)]">
                    <p>상품 {order.itemCount}개</p>
                    <p>{order.paymentMethod}</p>
                  </div>

                  <div className="text-sm leading-6 text-[var(--ink-soft)]">
                    {formatDateTime(order.createdAt)}
                  </div>

                  <div className="text-sm font-semibold text-[var(--ink)]">
                    {formatPrice(order.total)}원
                  </div>

                  <div className="grid gap-2">
                    <select
                      value={draftStatus}
                      onChange={(event) =>
                        setDraftStatuses((current) => ({
                          ...current,
                          [order.orderNumber]: event.target.value,
                        }))
                      }
                      className="admin-input px-4 py-3"
                    >
                      <option value="PENDING_PAYMENT">결제 대기</option>
                      <option value="PAID">결제 완료</option>
                      <option value="PREPARING">상품 준비</option>
                      <option value="SHIPPED">배송 중</option>
                      <option value="DELIVERED">배송 완료</option>
                      <option value="REFUND_REQUESTED">환불 요청</option>
                      <option value="REFUNDED">환불 완료</option>
                      <option value="CANCELLED">주문 취소</option>
                    </select>

                    <button
                      type="button"
                      disabled={isPending || draftStatus === order.status}
                      onClick={() => {
                        setMessage("");
                        setError("");

                        startTransition(() => {
                          void (async () => {
                            try {
                              const nextOrder = await updateOrderStatus(
                                order.orderNumber,
                                { status: draftStatus },
                              );

                              setOrders((current) =>
                                current.map((item) =>
                                  item.orderNumber === nextOrder.orderNumber
                                    ? nextOrder
                                    : item,
                                ),
                              );
                              setDraftStatuses((current) => ({
                                ...current,
                                [order.orderNumber]: nextOrder.status,
                              }));
                              setMessage(
                                `${nextOrder.orderNumber} 주문 상태를 저장했습니다.`,
                              );
                            } catch (saveError) {
                              setError(
                                getErrorMessage(
                                  saveError,
                                  "주문 상태를 저장하지 못했습니다.",
                                ),
                              );
                            }
                          })();
                        });
                      }}
                      className="admin-button-secondary px-4 py-3 disabled:opacity-60"
                    >
                      상태 저장
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <AdminPagination
        page={currentPage}
        totalPages={totalPages}
        summary={
          filteredOrders.length === 0
            ? "검색 결과가 없습니다."
            : `${(currentPage - 1) * ORDERS_PER_PAGE + 1}-${Math.min(
                currentPage * ORDERS_PER_PAGE,
                filteredOrders.length,
              )}번째 주문 표시`
        }
        onChange={setPage}
      />

      {message ? <p className="mt-5 text-sm text-[var(--teal)]">{message}</p> : null}
      {error ? <p className="mt-5 text-sm text-red-600">{error}</p> : null}
    </article>
  );
}
