"use client";

import { useState } from "react";

import type { CartProduct } from "@/lib/contracts";
import { useCart } from "@/lib/cart-store";

export function AddToCartButton({
  product,
  disabled = false,
}: {
  product: CartProduct;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");

  return (
    <>
      <button
        type="button"
        disabled={disabled || isPending}
        aria-live="polite"
        onClick={async () => {
          if (disabled || isPending) {
            return;
          }

          setError("");
          setIsPending(true);
          const success = await addItem(product);
          setIsPending(false);

          if (!success) {
            setError("장바구니에 담지 못했습니다. 다시 시도해 주세요.");
            return;
          }

          setAdded(true);
          window.setTimeout(() => setAdded(false), 1400);
        }}
        className={`${added ? "button-secondary" : "button-hot"} w-full px-4 py-3 text-[11px] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[7.75rem]`}
      >
        {disabled ? "품절" : added ? "담기 완료" : isPending ? "담는 중..." : "장바구니 담기"}
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </>
  );
}
