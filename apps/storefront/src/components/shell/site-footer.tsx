import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(20,40,29,0.08)] bg-[rgba(255,255,243,0.84)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-[var(--ink-soft)] sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="display-eyebrow">PM Approved MVP</p>
          <p className="mt-2 display-heading text-xl text-[var(--ink)]">
            사용자 화면 1차 MVP
          </p>
        </div>
        <div className="space-y-3">
          <p>스토어프런트: Next.js 16 / React 19</p>
          <p>API: Spring Boot 4 / PostgreSQL Ready</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/faq" className="rounded-full border border-[var(--line)] px-3 py-1 hover:bg-[rgba(116,164,188,0.14)]">
              FAQ
            </Link>
            <Link href="/terms" className="rounded-full border border-[var(--line)] px-3 py-1 hover:bg-[rgba(116,164,188,0.14)]">
              이용약관
            </Link>
            <Link href="/privacy" className="rounded-full border border-[var(--line)] px-3 py-1 hover:bg-[rgba(116,164,188,0.14)]">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

