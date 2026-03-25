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
        className="inline-flex items-center rounded-full border border-[var(--line-strong)] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:bg-[var(--primary-dim)] disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? "로그아웃 중..." : "로그아웃"}
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
