"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { useAuth } from "@/lib/auth-store";

function buildAuthHref(pathname: string | null) {
  if (!pathname || pathname.startsWith("/auth") || pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return "/auth?tab=login";
  }

  return `/auth?tab=login&next=${encodeURIComponent(pathname)}`;
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
            router.replace("/");
          });
        }}
        aria-label="로그아웃"
        className="inline-flex min-h-11 items-center rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-hover)] px-4 py-2 text-sm font-semibold text-[var(--chrome-fg)] transition hover:-translate-y-[1px] hover:border-[var(--line-strong)] hover:bg-[var(--surface-low)] focus-visible:outline-[var(--focus)] disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? "로그아웃 중..." : "로그아웃"}
      </button>
    );
  }

  return (
    <Link
      href={buildAuthHref(pathname)}
      className="inline-flex min-h-11 items-center rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-hover)] px-5 py-2 text-sm font-semibold text-[var(--chrome-fg)] transition hover:-translate-y-[1px] hover:border-[var(--line-strong)] hover:bg-[var(--surface-low)] focus-visible:outline-[var(--focus)]"
    >
      로그인
    </Link>
  );
}
