"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { useAuth } from "@/lib/auth-store";

function buildAuthHref(basePath: "/login" | "/signup", pathname: string | null) {
  if (!pathname || pathname.startsWith("/auth") || pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return basePath;
  }

  return `${basePath}?next=${encodeURIComponent(pathname)}`;
}

export function SiteAuthActions() {
  const { session, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (session.authenticated) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            await signOut();
            router.push("/");
            router.refresh();
          });
        }}
        aria-label="로그아웃"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--ink)] text-white transition hover:-translate-y-[1px] hover:bg-black disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? (
          <span className="h-4 w-4 animate-pulse rounded-full bg-white/80" aria-hidden="true" />
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H4" />
            <path d="M19 4v16" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={buildAuthHref("/login", pathname)}
        className="inline-flex items-center rounded-full border border-[var(--line-strong)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-[1px] hover:border-[var(--ink)]"
      >
        로그인
      </Link>
      <Link
        href={buildAuthHref("/signup", pathname)}
        className="inline-flex items-center rounded-full border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:bg-[var(--primary-dim)]"
      >
        회원가입
      </Link>
    </div>
  );
}
