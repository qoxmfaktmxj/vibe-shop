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
  if (href === "/admin") {
    return currentPath === "/admin";
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function AdminShell({
  eyebrow = "MARU Digital Atelier 운영 콘솔",
  title,
  description,
  children,
  actions,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut } = useAdminAuth();
  const [isLoggingOut, startLoggingOut] = useTransition();
  const isDashboard = pathname === "/admin";

  return (
    <main className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-6 py-6 sm:px-8 lg:px-10">
      <section
        className={`admin-dark rounded-[36px] shadow-[0_28px_60px_rgba(16,33,39,0.18)] ${
          isDashboard ? "p-8 sm:p-10" : "p-6 sm:p-8"
        }`}
      >
        <div
          className={`flex flex-col gap-5 ${
            isDashboard
              ? "xl:flex-row xl:items-end xl:justify-between"
              : "lg:flex-row lg:items-start lg:justify-between"
          }`}
        >
          <div className={isDashboard ? "max-w-4xl" : "max-w-3xl"}>
            <p className="eyebrow text-[rgba(237,244,239,0.64)]">{eyebrow}</p>
            <h1
              className={`display mt-4 font-semibold tracking-[-0.04em] ${
                isDashboard
                  ? "text-5xl leading-[0.92] sm:text-6xl"
                  : "text-3xl leading-[1.02] sm:text-4xl"
              }`}
            >
              {title}
            </h1>
            <p
              className={`mt-4 text-[rgba(237,244,239,0.72)] ${
                isDashboard
                  ? "max-w-3xl text-base leading-8"
                  : "max-w-2xl text-sm leading-7"
              }`}
            >
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-white/12 px-5 py-3 text-sm text-[rgba(237,244,239,0.82)]">
              {session.user?.name} / {session.user?.role}
            </div>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() =>
                startLoggingOut(() => {
                  void (async () => {
                    await signOut();
                    router.replace("/admin/login");
                  })();
                })
              }
              className="admin-button-ghost px-5 py-3 disabled:opacity-60"
            >
              {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        </div>

        <nav
          className={`${isDashboard ? "mt-8" : "mt-6"} flex flex-wrap gap-3`}
          aria-label="관리자 주요 메뉴"
        >
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-pill rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active ? "admin-nav-pill-active" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </section>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}

      <div className="admin-shell">{children}</div>
    </main>
  );
}
