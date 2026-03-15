const ORDER_STATUS_LABELS: Record<string, string> = {
  RECEIVED: "주문 접수",
  CANCELLED: "주문 취소",
};

export function formatOrderStatus(status: string) {
  return ORDER_STATUS_LABELS[status] ?? status;
}
