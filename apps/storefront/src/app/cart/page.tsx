import type { Metadata } from "next";

import { CartScreen } from "@/components/cart/cart-screen";

export const metadata: Metadata = {
  title: "장바구니 | MARU",
};

export default function CartPage() {
  return <CartScreen />;
}

