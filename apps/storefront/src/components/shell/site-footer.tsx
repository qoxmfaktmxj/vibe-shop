import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-[var(--ink)]">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-8 py-16 text-sm lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:px-20">
        <div className="space-y-5">
          <p
            className="text-base font-light tracking-[0.2em] uppercase text-white"
            style={{ fontFamily: "var(--font-display), monospace" }}
          >
            MARU
          </p>
          <p className="max-w-sm leading-7 text-white/72">
            공간과 루틴에 자연스럽게 어울리는 리빙 셀렉션을 제안합니다.
            리빙, 키친, 웰니스 카테고리의 상품과 이야기를 차분한 톤으로 큐레이션합니다.
          </p>
        </div>

        <div className="space-y-5">
          <p
            className="text-[10px] tracking-[0.3em] uppercase text-white/50"
            style={{ fontFamily: "var(--font-display), monospace" }}
          >
            안내
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/faq" className="text-white/72 transition hover:text-white">
              자주 묻는 질문
            </Link>
            <Link href="/terms" className="text-white/72 transition hover:text-white">
              이용약관
            </Link>
            <Link href="/privacy" className="text-white/72 transition hover:text-white">
              개인정보 처리방침
            </Link>
            <Link href="/lookup-order" className="text-white/72 transition hover:text-white">
              비회원 주문 조회
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <p
            className="text-[10px] tracking-[0.3em] uppercase text-white/50"
            style={{ fontFamily: "var(--font-display), monospace" }}
          >
            검색
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/search"
              className="border border-white/20 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/80 transition hover:border-white/60 hover:text-white"
              style={{ fontFamily: "var(--font-display), monospace" }}
            >
              상품 검색
            </Link>
            <Link
              href="/orders"
              className="border border-white/20 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white/80 transition hover:border-white/60 hover:text-white"
              style={{ fontFamily: "var(--font-display), monospace" }}
            >
              주문 내역
            </Link>
          </div>
        </div>

        <div className="text-xs text-white/40 lg:col-span-3">
          © 2026 MARU Digital Atelier. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
