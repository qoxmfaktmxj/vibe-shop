const ORDER_STATUS_LABELS: Record<string, string> = {
  RECEIVED: "주문 접수",
  PENDING_PAYMENT: "결제 대기",
  PAID: "결제 완료",
  PREPARING: "상품 준비중",
  SHIPPED: "배송중",
  DELIVERED: "배송 완료",
  REFUND_REQUESTED: "환불 요청",
  REFUNDED: "환불 완료",
  CANCELLED: "주문 취소",
};

export function formatOrderStatus(status: string) {
  return ORDER_STATUS_LABELS[status] ?? status;
}
