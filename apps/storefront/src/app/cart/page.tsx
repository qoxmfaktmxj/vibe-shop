import type { Metadata } from "next";

import { CartScreen } from "@/components/cart/cart-screen";

export const metadata: Metadata = {
  title: "장바구니 | Vibe Shop",
};

export default function CartPage() {
  return <CartScreen />;
}

