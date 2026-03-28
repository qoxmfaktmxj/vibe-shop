import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-[var(--footer-border)] bg-[var(--footer-bg)] sm:mt-20">
      <div className="page-container grid gap-10 py-12 text-sm lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:py-14">
        {/* Brand */}
        <div className="space-y-4">
          <p className="text-lg font-bold tracking-tight text-[var(--ink)]">
            MARU
          </p>
          <p className="max-w-sm leading-relaxed text-[var(--ink-soft)]">
            공간에 어울리는 리빙 셀렉션을 제안합니다.
            리빙, 인테리어, 키친 아이템을 MARU에서 만나보세요.
          </p>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
            안내
          </p>
          <div className="flex flex-col gap-2.5">
            <Link href="/faq" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">
              자주 묻는 질문
            </Link>
            <Link href="/terms" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">
              이용약관
            </Link>
            <Link href="/privacy" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">
              개인정보 처리방침
            </Link>
            <Link href="/lookup-order" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">
              비회원 주문 조회
            </Link>
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
            바로가기
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/search"
              className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-3.5 py-2 text-xs font-medium text-[var(--ink)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              상품 검색
            </Link>
            <Link
              href="/orders"
              className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-white px-3.5 py-2 text-xs font-medium text-[var(--ink)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              주문 내역
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-xs text-[var(--ink-muted)] lg:col-span-3">
          &copy; 2026 MARU. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
