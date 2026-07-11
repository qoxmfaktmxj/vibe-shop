import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--footer-border)] bg-[var(--footer-bg)] sm:mt-28">
      <div className="page-container grid gap-12 py-14 text-sm md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr] lg:py-20">
        <div>
          <p className="font-[var(--font-display)] text-2xl tracking-[0.18em] text-[var(--ink)]">MARU</p>
          <p className="mt-6 max-w-sm font-[var(--font-display)] text-xl leading-relaxed text-[var(--ink)]">
            머무는 시간이 더 좋아지는 오브제.
          </p>
          <p className="mt-3 max-w-sm text-xs leading-6 text-[var(--ink-soft)]">
            좋은 소재와 편안한 형태를 오래 곁에 둘 수 있도록 선별합니다.
          </p>
        </div>

        <div className="space-y-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]">고객 서비스</p>
          <div className="flex flex-col gap-3">
            <Link href="/faq" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">
              자주 묻는 질문
            </Link>
            <Link href="/lookup-order" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">
              비회원 주문 조회
            </Link>
            <Link href="/orders" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">
              주문 및 배송
            </Link>
          </div>
        </div>

        <div className="space-y-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]">MARU 안내</p>
          <div className="flex flex-col gap-3">
            <Link href="/search" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">전체 컬렉션</Link>
            <Link href="/terms" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">이용약관</Link>
            <Link href="/privacy" className="text-[var(--ink-soft)] transition hover:text-[var(--primary)]">개인정보 처리방침</Link>
          </div>
        </div>

        <div className="space-y-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--ink)]">리빙 컨시어지</p>
          <div className="space-y-2 text-xs leading-6 text-[var(--ink-soft)]">
            <p>평일 10:00–18:00</p>
            <p>배송·선물·상품 선택을 도와드립니다.</p>
          </div>
        </div>

        <div className="border-t border-[var(--footer-border)] pt-6 text-[11px] tracking-[0.04em] text-[var(--ink-muted)] md:col-span-2 lg:col-span-4">
          &copy; 2026 MARU. Curated for considered living.
        </div>
      </div>
    </footer>
  );
}
