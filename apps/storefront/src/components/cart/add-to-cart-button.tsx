"use client";

import { useState } from "react";

import type { CartProduct } from "@/lib/contracts";
import { useCart } from "@/lib/cart-store";

export function AddToCartButton({ product }: { product: CartProduct }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [isPending, setIsPending] = useState(false);

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={async () => {
        if (isPending) {
          return;
        }

        setIsPending(true);
        const success = await addItem(product);
        setIsPending(false);

        if (!success) {
          return;
        }

        setAdded(true);
        window.setTimeout(() => setAdded(false), 1400);
      }}
      className={`${added ? "button-secondary" : "button-hot"} min-w-[7.75rem] px-4 py-3 text-[11px] disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {added ? "담기 완료" : isPending ? "담는 중..." : "장바구니 담기"}
    </button>
  );
}
