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
      className={`pb-1 text-[11px] font-semibold tracking-[0.2em] uppercase transition ${
        active
          ? "border-b border-[var(--primary)] text-[var(--primary)]"
          : "border-b border-transparent text-[var(--ink-soft)] hover:border-[var(--line)] hover:text-[var(--ink)]"
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
    <header className="sticky top-0 z-40 glass-nav border-b border-black/5">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-5 py-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="min-w-0">
            <p className="display-heading text-lg font-extrabold tracking-tight text-[var(--ink)] sm:text-xl">
              Vibe Shop
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--ink-soft)]">
              Digital Atelier
            </p>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <HeaderLink href="/" label="Home" active={pathname === "/"} />
            <HeaderLink href="/search" label="Search" active={pathname.startsWith("/search")} />
            <HeaderLink href="/orders" label="Orders" active={pathname === "/orders"} />
            <HeaderLink href="/lookup-order" label="Lookup" active={pathname === "/lookup-order"} />
            <HeaderLink href="/faq" label="Journal" active={pathname === "/faq"} />
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/search"
              className="hidden items-center gap-2 rounded-lg bg-[var(--surface-low)] px-4 py-2 text-xs font-medium text-[var(--ink-soft)] md:inline-flex"
            >
              Search
            </Link>
            <Link
              href="/lookup-order"
              className="hidden rounded-lg border border-[var(--line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)] lg:inline-flex"
            >
              Guest
            </Link>
            <Link
              href="/cart"
              className="inline-flex items-center rounded-lg bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink)] shadow-[var(--shadow-soft)]"
            >
              Bag {hydrated ? itemCount : 0}
            </Link>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-black/5 pt-4 md:hidden">
          <HeaderLink href="/" label="Home" active={pathname === "/"} />
          <HeaderLink href="/search" label="Search" active={pathname.startsWith("/search")} />
          <HeaderLink href="/orders" label="Orders" active={pathname === "/orders"} />
          <HeaderLink href="/lookup-order" label="Lookup" active={pathname === "/lookup-order"} />
        </nav>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-black/5 pt-4">
          {categories.map((category) => (
            <HeaderLink
              key={category.slug}
              href={`/category/${category.slug}`}
              label={category.name}
              active={pathname.startsWith(`/category/${category.slug}`)}
            />
          ))}
        </nav>
      </div>
    </header>
  );
}
