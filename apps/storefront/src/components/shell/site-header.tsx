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
    <header className="sticky top-0 z-50 border-b border-[var(--chrome-border)] bg-[var(--chrome-bg-strong)] backdrop-blur-xl">
      <div className="page-container flex items-center justify-between gap-4 py-3 sm:py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-baseline gap-2 text-[var(--chrome-fg)]">
            <span className="text-lg font-bold tracking-tight sm:text-xl">MARU</span>
            <span className="hidden text-xs text-[var(--chrome-fg-muted)] sm:inline">
              Digital Atelier
            </span>
          </Link>

          {links.length > 0 ? (
            <nav aria-label="카테고리" className="hidden items-center gap-5 lg:flex">
              {links.map((category) => (
                <a
                  key={category.id}
                  href={category.slug ? `/category/${encodeURIComponent(category.slug)}` : "/search"}
                  className="text-sm text-[var(--chrome-fg-muted)] transition-colors hover:text-[var(--chrome-fg)]"
                >
                  {category.name}
                </a>
              ))}
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <AccountHeaderButton />
          <CartHeaderButton />
          <SiteAuthActions />
        </div>
      </div>
    </header>
  );
}
