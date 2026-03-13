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
          ? "bg-[var(--ink)] text-white"
          : "bg-white/70 text-[var(--ink-soft)] hover:bg-white"
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
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgba(251,247,242,0.86)] backdrop-blur-xl">
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
              className="surface-card rounded-full px-4 py-2 text-sm font-semibold"
            >
              장바구니 {hydrated ? itemCount : 0}
            </Link>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2">
          <HeaderLink href="/" label="메인" active={pathname === "/"} />
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

