import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/server-api";

export default async function AccountPage() {
  const session = await getAuthSession().catch(() => ({ authenticated: false, user: null }));

  if (!session.authenticated || !session.user) {
    redirect("/login?next=/account");
  }

  return (
    <div className="grid-shell lg:grid-cols-[1.05fr_0.95fr]">
      <section className="surface-card rounded-[36px] p-8 sm:p-10">
        <p className="display-eyebrow">Account</p>
        <h1 className="display-heading mt-4 text-4xl font-semibold">내 계정</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
          로그인과 세션이 정상 연결된 상태입니다. 다음 단계에서 주문 분기와 마이페이지가 이 계정 기준으로 확장됩니다.
        </p>

        <div className="mt-8 grid gap-4">
          <article className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6">
            <p className="display-eyebrow">Name</p>
            <p className="mt-3 text-2xl font-semibold">{session.user.name}</p>
          </article>
          <article className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6">
            <p className="display-eyebrow">Email</p>
            <p className="mt-3 text-xl font-semibold">{session.user.email}</p>
          </article>
          <article className="rounded-[28px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-6">
            <p className="display-eyebrow">Provider</p>
            <p className="mt-3 text-xl font-semibold">{session.user.provider}</p>
          </article>
        </div>
      </section>

      <aside className="surface-card rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,239,233,0.76))] p-8 sm:p-10">
        <p className="display-eyebrow">Next</p>
        <h2 className="display-heading mt-4 text-3xl font-semibold">확장 예정</h2>
        <ul className="mt-6 space-y-4 text-sm leading-7 text-[var(--ink-soft)]">
          <li>회원/비회원 주문 분기</li>
          <li>내 주문 목록과 상세</li>
          <li>배송지 관리</li>
          <li>마이페이지 메인</li>
        </ul>
      </aside>
    </div>
  );
}
