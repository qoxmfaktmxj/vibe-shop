"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { useAdminAuth } from "@/lib/auth-store";
import { ADMIN_NAV_ITEMS } from "@/lib/admin-nav";

type AdminShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

function isActivePath(currentPath: string, href: string) {
  if (href === "/") {
    return currentPath === href;
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function AdminShell({
  eyebrow = "Vibe Shop Admin",
  title,
  description,
  children,
  actions,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, signOut } = useAdminAuth();
  const [isLoggingOut, startLoggingOut] = useTransition();

  return (
    <main className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-6 py-8 sm:px-8 lg:px-10">
      <section className="admin-dark rounded-[40px] p-8 sm:p-10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <p className="eyebrow text-[rgba(237,244,239,0.64)]">{eyebrow}</p>
            <h1 className="display mt-5 text-5xl font-semibold leading-[0.92] sm:text-6xl">{title}</h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-[rgba(237,244,239,0.72)]">{description}</p>
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
                    router.push("/login");
                    router.refresh();
                  })();
                })
              }
              className="admin-button-ghost px-5 py-3 disabled:opacity-60"
            >
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>

        <nav className="mt-8 flex flex-wrap gap-3">
          {ADMIN_NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-white text-[var(--panel-strong)]"
                    : "border border-white/12 text-[rgba(237,244,239,0.78)] hover:border-white/28"
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
