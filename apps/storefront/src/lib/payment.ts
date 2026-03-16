import type { PaymentMethod } from "@/lib/contracts";

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CARD: "신용카드",
  BANK_TRANSFER: "계좌이체",
  VIRTUAL_ACCOUNT: "가상계좌",
  MOBILE: "휴대폰 결제",
  EASY_PAY: "간편결제",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  READY: "결제 준비",
  PENDING: "승인 대기",
  SUCCEEDED: "결제 성공",
  FAILED: "결제 실패",
  CANCELLED: "결제 취소",
  REFUNDED: "환불 완료",
};

export function formatPaymentMethod(paymentMethod: PaymentMethod | string) {
  return PAYMENT_METHOD_LABELS[paymentMethod as PaymentMethod] ?? paymentMethod;
}

export function formatPaymentStatus(paymentStatus: string) {
  return PAYMENT_STATUS_LABELS[paymentStatus] ?? paymentStatus;
}
