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
            router.push("/");
            router.refresh();
          });
        }}
        aria-label="Logout"
        className="inline-flex items-center rounded-full border border-[var(--line-strong)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-[1px] hover:border-[var(--ink)] disabled:cursor-wait disabled:opacity-60"
      >
        {isPending ? "Logging out..." : "Logout"}
      </button>
    );
  }

  return (
    <Link
      href={buildAuthHref(pathname)}
      className="inline-flex items-center rounded-full border border-[var(--line-strong)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:-translate-y-[1px] hover:border-[var(--ink)]"
    >
      Log in
    </Link>
  );
}
