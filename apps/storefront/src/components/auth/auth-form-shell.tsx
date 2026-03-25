import Link from "next/link";

export function AuthFormShell({
  eyebrow,
  title,
  description,
  alternateHref,
  alternateLabel,
  alternateDescription,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  alternateHref: string;
  alternateLabel: string;
  alternateDescription: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid-shell lg:grid-cols-[1.05fr_0.95fr]">
      <section className="surface-card rounded-[36px] p-8 sm:p-10">
        <p className="display-eyebrow">{eyebrow}</p>
        <h1 className="display-heading mt-4 text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">{description}</p>
        <div className="mt-8">{children}</div>
      </section>

      <aside className="surface-card rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,239,233,0.76))] p-8 sm:p-10">
        <p className="display-eyebrow">계정 안내</p>
        <h2 className="display-heading mt-4 text-3xl">{alternateLabel}</h2>
        <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">{alternateDescription}</p>
        <div className="mt-8 grid gap-3 rounded-[24px] border border-[var(--line)] bg-white/70 p-5 text-sm leading-7 text-[var(--ink-soft)]">
          <p>주문 내역, 배송지, 리뷰와 찜 목록을 한 계정에서 이어서 관리할 수 있습니다.</p>
          <p>소셜 로그인과 일반 로그인을 모두 지원하며 장바구니 상태도 같은 세션으로 이어집니다.</p>
        </div>
        <Link href={alternateHref} className="button-secondary mt-8 rounded-[20px] px-5 py-3">
          {alternateLabel}
        </Link>
      </aside>
    </div>
  );
}
