"use client";

import { useState } from "react";

import type { CartProduct } from "@/lib/contracts";
import { useCart } from "@/lib/cart-store";

export function AddToCartButton({ product }: { product: CartProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        addItem(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      className={`${added ? "button-hot" : "button-ink"} px-4 py-2`}
    >
      {added ? "장바구니에 담았어요" : "장바구니 담기"}
    </button>
  );
}

