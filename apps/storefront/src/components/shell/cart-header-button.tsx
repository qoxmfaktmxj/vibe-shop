"use client";

import Link from "next/link";

import { useCart } from "@/lib/cart-store";

export function CartHeaderButton() {
  const { hydrated, itemCount } = useCart();
  const count = hydrated ? itemCount : 0;

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `장바구니 ${count}개` : "장바구니"}
      className="inline-flex items-center gap-3 rounded-full border border-[var(--line-strong)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-[1px] hover:border-[var(--ink)]"
    >
      <span>장바구니</span>
      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--secondary)] px-2 py-1 text-[10px] font-bold leading-none text-white">
        {count}
      </span>
    </Link>
  );
}
