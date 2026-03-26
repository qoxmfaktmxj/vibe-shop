import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/admin-server-api";

export default async function LoginPage() {
  const session = await getAdminSession().catch(() => ({ authenticated: false, user: null }));

  if (session.authenticated) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] items-center px-6 py-12 sm:px-8 lg:px-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="admin-dark rounded-[40px] p-8 sm:p-10 lg:p-12">
          <p className="eyebrow text-[rgba(237,244,239,0.66)]">Operations Panel</p>
          <h1 className="display mt-5 text-5xl font-semibold leading-[0.92] sm:text-6xl">
            관리자 페이지
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[rgba(237,244,239,0.72)]">
            전시, 상품, 주문, 회원, 리뷰를 각각의 작업 공간에서 운영합니다.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <article className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="eyebrow text-[rgba(237,244,239,0.58)]">상품</p>
              <p className="mt-3 text-sm leading-7 text-[rgba(237,244,239,0.78)]">
                재고, 인기 점수, 메인 노출 상태를 상품 작업 공간에서 바로 조정합니다.
              </p>
            </article>
            <article className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="eyebrow text-[rgba(237,244,239,0.58)]">주문</p>
              <p className="mt-3 text-sm leading-7 text-[rgba(237,244,239,0.78)]">
                주문 상태 변경과 확인에 필요한 흐름을 분리된 화면에서 빠르게 처리합니다.
              </p>
            </article>
            <article className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="eyebrow text-[rgba(237,244,239,0.58)]">전시</p>
              <p className="mt-3 text-sm leading-7 text-[rgba(237,244,239,0.78)]">
                메인 카피와 배너, 카테고리 메시지를 별도 화면에서 관리합니다.
              </p>
            </article>
          </div>
        </section>

        <section className="admin-card rounded-[40px] p-8 sm:p-10 lg:p-12">
          <p className="eyebrow text-[var(--ink-soft)]">관리자 로그인</p>
          <h2 className="display mt-5 text-4xl font-semibold leading-[0.94]">
            관리자 로그인
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--ink-soft)]">
            <code>OWNER</code> 또는 <code>MANAGER</code> 권한 계정으로 접근할 수 있습니다.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
