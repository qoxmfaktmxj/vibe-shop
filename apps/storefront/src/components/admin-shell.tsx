"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { useAdminAuth } from "@/lib/admin-auth-store";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav";

type AdminShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

function isActivePath(currentPath: string, href: string) {
  if (href === "/admin") return currentPath === "/admin";
  return currentPath === href || currentPath.startsWith(href + "/");
}

export function AdminShell({
  eyebrow = "MARU 운영 콘솔",
  title,
  description,
  children,
  actions,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut } = useAdminAuth();
  const [isLoggingOut, startLoggingOut] = useTransition();

  const handleSignOut = () => {
    startLoggingOut(() => {
      void (async () => {
        await signOut();
        router.replace("/admin/login");
      })();
    });
  };

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-b border-[var(--line)] bg-[var(--panel)] lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex min-h-16 items-center justify-between border-b border-[var(--line)] px-5 lg:min-h-20">
          <Link href="/admin" className="text-sm font-bold tracking-[0.16em]">
            MARU <span className="text-[var(--accent)]">OPS</span>
          </Link>
          <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">Enterprise</span>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 py-3 lg:flex-col lg:px-4 lg:py-5" aria-label="관리자 주요 메뉴">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "admin-nav-pill shrink-0 px-4 py-3 text-sm font-medium transition-colors",
                  active ? "admin-nav-pill-active" : "",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden border-t border-[var(--line)] p-4 lg:absolute lg:inset-x-0 lg:bottom-0 lg:block">
          <p className="truncate text-xs font-semibold">{session.user?.name}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[var(--ink-soft)]">{session.user?.role}</p>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleSignOut}
            className="admin-button-ghost mt-4 w-full px-4 py-2.5 disabled:opacity-60"
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-b border-[var(--line)] bg-[var(--panel)] px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <p className="eyebrow text-[var(--ink-soft)]">{eyebrow}</p>
              <h1 className="display mt-2 text-2xl font-semibold sm:text-3xl">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {actions}
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleSignOut}
                className="admin-button-ghost px-4 py-2.5 disabled:opacity-60 lg:hidden"
              >
                {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
              </button>
            </div>
          </div>
        </header>

        <div className="admin-shell p-5 sm:p-8 lg:p-10">{children}</div>
      </div>
    </main>
  );
}
