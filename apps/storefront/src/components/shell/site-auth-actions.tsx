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
        className="hidden min-h-11 items-center border-b border-transparent px-2 text-xs font-medium text-[var(--chrome-fg-muted)] transition-colors hover:border-[var(--chrome-fg)] hover:text-[var(--chrome-fg)] focus-visible:outline-[var(--focus)] disabled:cursor-wait disabled:opacity-60 sm:inline-flex"
      >
        {isPending ? "로그아웃 중..." : "로그아웃"}
      </button>
    );
  }

  return (
    <Link
      href={buildAuthHref(pathname)}
      className="hidden min-h-11 items-center border-b border-transparent px-2 text-xs font-medium text-[var(--chrome-fg-muted)] transition-colors hover:border-[var(--chrome-fg)] hover:text-[var(--chrome-fg)] focus-visible:outline-[var(--focus)] sm:inline-flex"
    >
      로그인
    </Link>
  );
}
