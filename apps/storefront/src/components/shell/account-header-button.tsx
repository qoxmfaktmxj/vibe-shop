"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/lib/auth-store";

function AccountIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

export function AccountHeaderButton() {
  const pathname = usePathname();
  const { session } = useAuth();
  const href = session.authenticated ? "/account" : "/auth?tab=login&next=%2Faccount";
  const isActive = pathname === "/account";
  const label = session.authenticated ? "내 정보 보기" : "로그인 후 내 정보 보기";

  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      aria-current={isActive ? "page" : undefined}
      className={[
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--chrome-border)] bg-[var(--chrome-hover)] text-[var(--chrome-fg)] transition hover:-translate-y-[1px] hover:border-white/30 hover:bg-white/18 focus-visible:outline-[var(--focus-warm)]",
        isActive
          ? "border-white/30 bg-white/18"
          : "",
      ].join(" ")}
    >
      <AccountIcon />
      {session.authenticated ? (
        <span
          aria-hidden="true"
          className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full border border-[var(--chrome-bg)] bg-[var(--chrome-fg)]"
        />
      ) : null}
    </Link>
  );
}
