import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--footer-border)] bg-[var(--footer-surface)] sm:mt-24">
      <div className="page-container grid gap-10 py-14 text-sm text-[var(--ink-soft)] lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:py-16">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <p
              className="text-base font-light tracking-[0.2em] uppercase text-[var(--ink)]"
              style={{ fontFamily: "var(--font-display), monospace" }}
            >
              MARU
            </p>
            <span
              aria-hidden
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#603A35]"
            >
              <svg viewBox="0 0 128 128" className="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="64" cy="64" r="42" fill="#704640" fillOpacity="0.55" />
                <path
                  d="M32 92V36H44L64 61L84 36H96V92H84V55L67 77H61L44 55V92H32Z"
                  fill="#F8F3EF"
                />
                <path
                  d="M64 24C86.0914 24 104 41.9086 104 64"
                  stroke="#F0DDD7"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeOpacity="0.7"
                />
              </svg>
            </span>
          </div>
          <p className="max-w-sm leading-7 text-[var(--ink-soft)]">
            공간과 루틴에 자연스럽게 어울리는 리빙 셀렉션을 제안합니다.
            리빙, 키친, 웰니스 카테고리의 상품과 이야기를 차분한 톤으로 큐레이션합니다.
          </p>
        </div>

        <div className="space-y-5">
          <p
            className="text-[10px] tracking-[0.3em] uppercase text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display), monospace" }}
          >
            안내
          </p>
          <div className="flex flex-col gap-3">
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

        <div className="space-y-5">
          <p
            className="text-[10px] tracking-[0.3em] uppercase text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display), monospace" }}
          >
            바로가기
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/search"
              className="border border-[var(--line)] bg-[var(--surface-high)] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              style={{ fontFamily: "var(--font-display), monospace" }}
            >
              상품 검색
            </Link>
            <Link
              href="/orders"
              className="border border-[var(--line)] bg-[var(--surface-high)] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              style={{ fontFamily: "var(--font-display), monospace" }}
            >
              주문 내역
            </Link>
          </div>
        </div>

        <div className="text-xs text-[var(--ink-muted)] lg:col-span-3">
          © 2026 MARU 디지털 아틀리에. 모든 권리 보유.
        </div>
      </div>
    </footer>
  );
}
