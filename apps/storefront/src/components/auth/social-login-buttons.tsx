"use client";

import Image from "next/image";

import { SOCIAL_PROVIDERS } from "@/lib/social-auth";

export function SocialLoginButtons({ nextPath }: { nextPath: string }) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
        <span className="h-px flex-1 bg-[var(--line)]" />
        <span>소셜 로그인</span>
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <div className="grid gap-3">
        {SOCIAL_PROVIDERS.map((item) => (
          <a
            key={item.provider}
            href={`/api/auth/social/login/${item.provider}?next=${encodeURIComponent(nextPath)}`}
            className={`group flex items-center gap-3 border px-4 py-3 transition-colors hover:border-[var(--ink)] ${item.accentClassName}`}
            aria-label={item.label}
          >
            <span className="relative h-9 w-9 overflow-hidden bg-[var(--surface)]">
              <Image
                src={item.iconSrc}
                alt={item.iconAlt}
                fill
                sizes="36px"
                className="object-contain p-1.5"
              />
            </span>
            <span className="text-sm font-semibold">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
