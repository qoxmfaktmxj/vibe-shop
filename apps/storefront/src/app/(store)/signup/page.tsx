import { redirect } from "next/navigation";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { sanitizeNextPath } from "@/lib/auth-paths";
import { getAuthSession } from "@/lib/server-api";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getAuthSession().catch(() => ({ authenticated: false, user: null }));
  if (session.authenticated) {
    redirect("/account");
  }

  const { next } = await searchParams;
  const nextPath = sanitizeNextPath(next);

  return (
    <AuthFormShell
      eyebrow="Signup"
      title="회원가입"
      description="새 계정을 만들면 바로 로그인되고, 현재 장바구니와 주문 흐름도 그대로 이어집니다."
      alternateHref={`/login?next=${encodeURIComponent(nextPath)}`}
      alternateLabel="로그인"
      alternateDescription="이미 계정이 있다면 로그인해서 주문, 배송지, 최근 주문 내역을 바로 이어서 확인할 수 있습니다."
    >
      <SignupForm nextPath={nextPath} />
    </AuthFormShell>
  );
}
