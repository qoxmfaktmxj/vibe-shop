import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-[var(--ink)] sm:mt-24">
      <div className="page-container grid gap-10 py-14 text-sm text-white lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:py-16">
        <div className="space-y-5">
          <p
            className="text-base font-light tracking-[0.2em] uppercase text-white"
            style={{ fontFamily: "var(--font-display), monospace" }}
          >
            MARU
          </p>
          <p className="max-w-sm leading-7 text-white">
            공간과 루틴에 자연스럽게 어울리는 리빙 셀렉션을 제안합니다.
            리빙, 키친, 웰니스 카테고리의 상품과 이야기를 차분한 톤으로 큐레이션합니다.
          </p>
        </div>

        <div className="space-y-5">
          <p
            className="text-[10px] tracking-[0.3em] uppercase text-white"
            style={{ fontFamily: "var(--font-display), monospace" }}
          >
            안내
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/faq" className="text-white transition hover:text-white/80">
              자주 묻는 질문
            </Link>
            <Link href="/terms" className="text-white transition hover:text-white/80">
              이용약관
            </Link>
            <Link href="/privacy" className="text-white transition hover:text-white/80">
              개인정보 처리방침
            </Link>
            <Link href="/lookup-order" className="text-white transition hover:text-white/80">
              비회원 주문 조회
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <p
            className="text-[10px] tracking-[0.3em] uppercase text-white"
            style={{ fontFamily: "var(--font-display), monospace" }}
          >
            바로가기
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/search"
              className="border border-white/40 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white transition hover:border-white hover:text-white"
              style={{ fontFamily: "var(--font-display), monospace" }}
            >
              상품 검색
            </Link>
            <Link
              href="/orders"
              className="border border-white/40 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-white transition hover:border-white hover:text-white"
              style={{ fontFamily: "var(--font-display), monospace" }}
            >
              주문 내역
            </Link>
          </div>
        </div>

        <div className="text-xs text-white lg:col-span-3">
          © 2026 MARU 디지털 아틀리에. 모든 권리 보유.
        </div>
      </div>
    </footer>
  );
}
