import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-[var(--surface-low)]">
      <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-5 py-16 text-sm text-[var(--ink-soft)] sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10">
        <div className="space-y-4">
          <p className="display-heading text-lg font-extrabold tracking-tight text-[var(--ink)]">
            Vibe Shop
          </p>
          <p className="max-w-sm leading-7">
            일상을 차분하게 정리하는 라이프스타일 큐레이션 스토어입니다. 큰 소음 대신
            소재, 비율, 리듬으로 분위기를 만듭니다.
          </p>
        </div>

        <div className="space-y-4">
          <p className="display-eyebrow">Information</p>
          <div className="flex flex-col gap-3">
            <Link href="/faq" className="text-[var(--ink-soft)] transition hover:text-[var(--ink)]">
              FAQ
            </Link>
            <Link href="/terms" className="text-[var(--ink-soft)] transition hover:text-[var(--ink)]">
              이용약관
            </Link>
            <Link href="/privacy" className="text-[var(--ink-soft)] transition hover:text-[var(--ink)]">
              개인정보처리방침
            </Link>
            <Link href="/lookup-order" className="text-[var(--ink-soft)] transition hover:text-[var(--ink)]">
              비회원 주문 조회
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <p className="display-eyebrow">Connect</p>
          <p className="leading-7">
            시즌 하이라이트와 운영 안내는 주문 조회, 검색, FAQ 화면을 통해 계속 확장합니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/search"
              className="rounded-lg bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink)] shadow-[var(--shadow-soft)]"
            >
              Search
            </Link>
            <Link
              href="/orders"
              className="rounded-lg border border-[var(--line)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
            >
              Orders
            </Link>
          </div>
        </div>

        <div className="text-xs text-[var(--ink-soft)] lg:col-span-3">
          © 2026 Vibe Shop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
