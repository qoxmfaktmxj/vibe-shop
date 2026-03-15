import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[rgba(255,255,255,0.92)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-[var(--ink-soft)] sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="display-eyebrow">Vibe Shop</p>
          <p className="mt-2 display-heading text-xl text-[var(--ink)]">
            일상을 정돈하는 셀렉션
          </p>
        </div>
        <div className="space-y-3">
          <p>차분한 리빙, 키친, 웰니스 상품을 한곳에서 소개합니다.</p>
          <p>주문 조회와 주요 안내 페이지를 함께 확인할 수 있습니다.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/faq" className="rounded-2xl border border-[var(--line)] px-3 py-1 hover:bg-[var(--surface-strong)]">
              FAQ
            </Link>
            <Link href="/terms" className="rounded-2xl border border-[var(--line)] px-3 py-1 hover:bg-[var(--surface-strong)]">
              이용약관
            </Link>
            <Link href="/privacy" className="rounded-2xl border border-[var(--line)] px-3 py-1 hover:bg-[var(--surface-strong)]">
              개인정보처리방침
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

