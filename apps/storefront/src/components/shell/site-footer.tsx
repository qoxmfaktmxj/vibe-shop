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
            怨듦컙怨?猷⑦떞???먯뿰?ㅻ읇寃??댁슱由щ뒗 由щ튃 ??됱뀡???쒖븞?⑸땲??
            由щ튃, ?ㅼ튇, ?곕땲??移댄뀒怨좊━???곹뭹怨??댁빞湲곕? 李⑤텇???ㅼ쑝濡??먮젅?댁뀡?⑸땲??
          </p>
        </div>

        <div className="space-y-5">
          <p
            className="text-[10px] tracking-[0.3em] uppercase text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display), monospace" }}
          >
            ?덈궡
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/faq" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">
              ?먯＜ 臾삳뒗 吏덈Ц
            </Link>
            <Link href="/terms" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">
              ?댁슜?쎄?
            </Link>
            <Link href="/privacy" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">
              媛쒖씤?뺣낫 泥섎━諛⑹묠
            </Link>
            <Link href="/lookup-order" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">
              鍮꾪쉶??二쇰Ц 議고쉶
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <p
            className="text-[10px] tracking-[0.3em] uppercase text-[var(--ink)]"
            style={{ fontFamily: "var(--font-display), monospace" }}
          >
            諛붾줈媛湲?
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/search"
              className="border border-[var(--line)] bg-[var(--surface-high)] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              style={{ fontFamily: "var(--font-display), monospace" }}
            >
              ?곹뭹 寃??
            </Link>
            <Link
              href="/orders"
              className="border border-[var(--line)] bg-[var(--surface-high)] px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--ink)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              style={{ fontFamily: "var(--font-display), monospace" }}
            >
              二쇰Ц ?댁뿭
            </Link>
          </div>
        </div>

        <div className="text-xs text-[var(--ink-muted)] lg:col-span-3">
          짤 2026 MARU ?붿????꾪?由ъ뿉. 紐⑤뱺 沅뚮━ 蹂댁쑀.
        </div>
      </div>
    </footer>
  );
}
