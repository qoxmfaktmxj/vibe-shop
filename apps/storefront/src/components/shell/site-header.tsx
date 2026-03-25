import Link from "next/link";

import { AccountHeaderButton } from "@/components/shell/account-header-button";
import { CartHeaderButton } from "@/components/shell/cart-header-button";
import { SiteAuthActions } from "@/components/shell/site-auth-actions";

export type SiteHeaderCategory = {
  id: string | number;
  name: string;
  slug?: string | null;
};

type SiteHeaderProps = {
  categories?: SiteHeaderCategory[];
};

export function SiteHeader({ categories = [] }: SiteHeaderProps) {
  const links = categories.slice(0, 6);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-white/92 backdrop-blur">
      <div className="page-container flex flex-col gap-4 py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex flex-col leading-none text-[var(--ink)]">
            <span className="text-xl font-semibold tracking-tight">Maru</span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.28em] text-[var(--ink-soft)]">
              디지털 아틀리에
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:justify-end">
            <AccountHeaderButton />
            <CartHeaderButton />
            <SiteAuthActions />
          </div>
        </div>

        {links.length > 0 ? (
          <nav aria-label="카테고리" className="hidden items-center gap-5 md:flex">
            {links.map((category) => (
              <a
                key={category.id}
                href={`/?category=${encodeURIComponent(category.slug ?? category.name)}`}
                className="text-sm text-[var(--ink-soft)] transition-colors hover:text-[var(--ink)]"
              >
                {category.name}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
