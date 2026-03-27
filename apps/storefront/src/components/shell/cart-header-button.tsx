"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart-store";

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6" />
      <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      <path d="M17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
    </svg>
  );
}

export function CartHeaderButton() {
  const { hydrated, itemCount } = useCart();
  const count = hydrated ? itemCount : 0;

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `장바구니 상품 ${count}개` : "장바구니"}
      className="inline-flex min-h-11 items-center gap-3 rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-hover)] px-4 py-2 text-sm font-semibold text-[var(--chrome-fg)] transition hover:-translate-y-[1px] hover:border-white/30 hover:bg-white/18 focus-visible:outline-[var(--focus-warm)]"
    >
      <CartIcon />
      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--chrome-fg)] px-2 py-1 text-[10px] font-bold leading-none text-[var(--chrome-bg)]">
        {count}
      </span>
    </Link>
  );
}
