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
      aria-label={count > 0 ? `장바구니 ${count}개 상품` : "장바구니"}
      className="inline-flex min-h-11 items-center gap-3 rounded-full border border-[var(--line-strong)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-[1px] hover:border-[var(--ink)]"
    >
      <CartIcon />
      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--secondary)] px-2 py-1 text-[10px] font-bold leading-none text-white">
        {count}
      </span>
    </Link>
  );
}
