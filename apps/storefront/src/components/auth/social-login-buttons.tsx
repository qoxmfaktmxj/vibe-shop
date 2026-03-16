import Image from "next/image";
import Link from "next/link";

import { SOCIAL_PROVIDERS } from "@/lib/social-auth";

export function SocialLoginButtons({ nextPath }: { nextPath: string }) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[var(--ink-soft)]">
        <span className="h-px flex-1 bg-[var(--line)]" />
        <span>Social Login</span>
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <div className="grid gap-3">
        {SOCIAL_PROVIDERS.map((item) => (
          <Link
            key={item.provider}
            href={`/api/auth/social/login/${item.provider}?next=${encodeURIComponent(nextPath)}`}
            className={`group flex items-center gap-3 rounded-[18px] border px-4 py-3 transition hover:-translate-y-[1px] hover:shadow-[var(--shadow-soft)] ${item.accentClassName}`}
            aria-label={item.label}
          >
            <span className="relative h-9 w-9 overflow-hidden rounded-full bg-white/80">
              <Image
                src={item.iconSrc}
                alt={item.iconAlt}
                fill
                sizes="36px"
                className="object-contain p-1.5"
              />
            </span>
            <span className="text-sm font-semibold">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
