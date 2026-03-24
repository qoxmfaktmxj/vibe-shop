"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { useAuth } from "@/lib/auth-store";
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
      className={`pb-1 text-[10px] font-medium tracking-[0.24em] uppercase transition ${
        active
          ? "border-b border-[var(--ink)] text-[var(--ink)]"
          : "border-b border-transparent text-[var(--ink-soft)] hover:text-[var(--ink)]"
      }`}
    >
      {label}
    </Link>
  );
}

export function SiteHeader({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, hydrated } = useCart();
  const { session, signOut } = useAuth();
  const [isPending, startTransition] = useTransition();

  return (
    <header className="sticky top-0 z-40 glass-nav border-b border-[var(--line)]">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-8 py-5 lg:px-20">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="min-w-0">
            <p
              className="text-base font-light tracking-[0.2em] uppercase text-[var(--ink)]"
              style={{ fontFamily: "var(--font-display), monospace" }}
            >
              MARU
            </p>
            <p className="mt-0.5 text-[9px] font-normal uppercase tracking-[0.3em] text-[var(--ink-muted)]">
              Digital Atelier
            </p>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <HeaderLink href="/" label="Home" active={pathname === "/"} />
            <HeaderLink href="/search" label="Search" active={pathname.startsWith("/search")} />
            <HeaderLink href="/orders" label="Orders" active={pathname === "/orders"} />
            <HeaderLink href="/lookup-order" label="주문조회" active={pathname === "/lookup-order"} />
            <HeaderLink href="/faq" label="FAQ" active={pathname === "/faq"} />
          </nav>

          <div className="flex items-center gap-3">
            {session.authenticated ? (
              <>
                <Link
                  href="/account"
                  className="hidden items-center gap-2 border-b border-transparent px-0 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)] lg:inline-flex"
                >
                  {session.user?.name}
                </Link>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      await signOut();
                      router.refresh();
                    })
                  }
                  className="hidden border-b border-transparent px-0 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)] lg:inline-block disabled:opacity-60"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden border-b border-transparent px-0 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)] lg:inline-block"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="hidden border-b border-transparent px-0 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--ink-soft)] hover:border-[var(--ink)] hover:text-[var(--ink)] lg:inline-block"
                >
                  Join
                </Link>
              </>
            )}
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 bg-[var(--ink)] px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "#ffffff" }}
            >
              Bag {hydrated ? itemCount : 0}
            </Link>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--line)] pt-3 md:hidden">
          <HeaderLink href="/" label="Home" active={pathname === "/"} />
          <HeaderLink href="/search" label="Search" active={pathname.startsWith("/search")} />
          <HeaderLink href="/orders" label="Orders" active={pathname === "/orders"} />
          <HeaderLink href="/faq" label="FAQ" active={pathname === "/faq"} />
          {session.authenticated ? (
            <HeaderLink href="/account" label="Account" active={pathname === "/account"} />
          ) : (
            <HeaderLink href="/login" label="Login" active={pathname === "/login"} />
          )}
        </nav>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--line)] pt-3">
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
