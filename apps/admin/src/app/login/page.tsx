import { redirect } from "next/navigation";

import { LoginForm } from "@/components/login-form";
import { getAdminSession } from "@/lib/server-api";

export default async function LoginPage() {
  const session = await getAdminSession().catch(() => ({ authenticated: false, user: null }));

  if (session.authenticated) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1200px] items-center px-6 py-12 sm:px-8 lg:px-10">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="admin-dark rounded-[40px] p-8 sm:p-10 lg:p-12">
          <p className="eyebrow text-[rgba(237,244,239,0.66)]">Operations Panel</p>
          <h1 className="display mt-5 text-5xl font-semibold leading-[0.92] sm:text-6xl">
            매장 운영 흐름을 한 화면에서 정리합니다.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[rgba(237,244,239,0.72)]">
            상품 진열, 주문 상태, 메인 전시 문구를 관리자 앱에서 바로 조정합니다. 오늘 MVP는 운영
            대시보드 중심으로 구성했습니다.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <article className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="eyebrow text-[rgba(237,244,239,0.58)]">Products</p>
              <p className="mt-3 text-sm leading-7 text-[rgba(237,244,239,0.78)]">
                재고, 인기 점수, 배지, 추천 노출 여부를 한 번에 수정합니다.
              </p>
            </article>
            <article className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="eyebrow text-[rgba(237,244,239,0.58)]">Orders</p>
              <p className="mt-3 text-sm leading-7 text-[rgba(237,244,239,0.78)]">
                주문 진행 상태를 단계별로 전환하고 최신 주문 흐름을 확인합니다.
              </p>
            </article>
            <article className="rounded-[28px] border border-white/10 bg-white/6 p-5">
              <p className="eyebrow text-[rgba(237,244,239,0.58)]">Display</p>
              <p className="mt-3 text-sm leading-7 text-[rgba(237,244,239,0.78)]">
                storefront 메인 히어로 카피를 관리자 화면에서 바로 수정합니다.
              </p>
            </article>
          </div>
        </section>

        <section className="admin-card rounded-[40px] p-8 sm:p-10 lg:p-12">
          <p className="eyebrow text-[var(--ink-soft)]">Admin Login</p>
          <h2 className="display mt-5 text-4xl font-semibold leading-[0.94]">운영 계정으로 로그인</h2>
          <p className="mt-5 text-base leading-8 text-[var(--ink-soft)]">
            관리자 권한이 부여된 기존 계정으로 로그인해 주세요.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
        </section>
      </div>
    </main>
  );
}
