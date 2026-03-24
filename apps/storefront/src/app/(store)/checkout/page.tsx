import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "주문서 작성 | MARU",
};

export default function CheckoutPage() {
  return <CheckoutForm />;
}

