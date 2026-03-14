"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { Category } from "@/lib/contracts";
import { useCart } from "@/lib/cart-store";

function HeaderLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-[var(--accent-strong)] text-white shadow-[0_10px_24px_rgba(41,51,155,0.16)]"
          : "border border-[rgba(41,51,155,0.14)] bg-[rgba(255,255,243,0.8)] text-[var(--ink-soft)] hover:bg-[rgba(116,164,188,0.16)]"
      }`}
    >
      {label}
    </Link>
  );
}

export function SiteHeader({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const { itemCount, hydrated } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(20,40,29,0.08)] bg-[rgba(255,255,243,0.84)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex flex-col">
            <span className="display-eyebrow">Vibe Shop</span>
            <span className="display-heading text-2xl font-semibold tracking-tight">
              오늘의 감도
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="button-secondary px-4 py-2"
            >
              장바구니 {hydrated ? itemCount : 0}
            </Link>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          <HeaderLink href="/" label="메인" active={pathname === "/"} />
          <HeaderLink href="/lookup-order" label="비회원 주문조회" active={pathname === "/lookup-order"} />
          {categories.map((category) => (
            <HeaderLink
              key={category.slug}
              href={`/category/${category.slug}`}
              label={category.name}
              active={pathname === `/category/${category.slug}`}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}

