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
      className={`${added ? "button-secondary" : "button-hot"} px-4 py-3 text-[11px]`}
    >
      {added ? "담기 완료" : "Add to Bag"}
    </button>
  );
}
