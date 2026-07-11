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
    <header className="sticky top-0 z-50 border-b border-[var(--chrome-border)] bg-[var(--chrome-bg-strong)] backdrop-blur-md">
      <div className="hidden border-b border-[var(--chrome-border)] lg:block">
        <div className="page-container flex h-8 items-center justify-between text-[11px] tracking-[0.04em] text-[var(--chrome-fg-muted)]">
          <p>새로운 일상을 위한 리빙 셀렉션</p>
          <p>전국 무료배송 · 리빙 컨시어지 10:00–18:00</p>
        </div>
      </div>

      <div className="page-container grid min-h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 lg:min-h-20">
        <Link
          href="/search"
          aria-label="검색"
          className="inline-flex min-h-11 w-fit items-center gap-2 text-sm text-[var(--chrome-fg-muted)] transition-colors hover:text-[var(--chrome-fg)]"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
          <span className="hidden sm:inline">검색</span>
        </Link>

        <Link href="/" className="text-center text-[var(--chrome-fg)]" aria-label="MARU 홈">
          <span className="block font-[var(--font-display)] text-2xl tracking-[0.18em] sm:text-[1.75rem]">MARU</span>
          <span className="mt-0.5 hidden text-[9px] uppercase tracking-[0.28em] text-[var(--chrome-fg-muted)] sm:block">
            Maison &amp; Objects
          </span>
        </Link>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <AccountHeaderButton />
          <CartHeaderButton />
          <SiteAuthActions />
        </div>
      </div>

      {links.length > 0 ? (
        <nav aria-label="카테고리" className="page-container no-scrollbar flex items-center justify-start gap-6 overflow-x-auto border-t border-[var(--chrome-border)] lg:justify-center lg:gap-9">
          {links.map((category) => (
            <Link
              key={category.id}
              href={category.slug ? `/category/${encodeURIComponent(category.slug)}` : "/search"}
              className="inline-flex min-h-11 shrink-0 items-center border-b border-transparent text-xs font-medium tracking-[0.04em] text-[var(--chrome-fg-muted)] transition-colors hover:border-[var(--chrome-fg)] hover:text-[var(--chrome-fg)]"
            >
              {category.name}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
