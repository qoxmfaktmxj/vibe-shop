import { redirect } from "next/navigation";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LoginForm } from "@/components/auth/login-form";
import { sanitizeNextPath } from "@/lib/auth-paths";
import { getAuthSession } from "@/lib/server-api";
import { getSocialLoginErrorMessage } from "@/lib/social-auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const session = await getAuthSession().catch(() => ({ authenticated: false, user: null }));
  if (session.authenticated) {
    redirect("/account");
  }

  const { next, error } = await searchParams;
  const nextPath = sanitizeNextPath(next);
  const initialErrorMessage = getSocialLoginErrorMessage(error);

  return (
    <AuthFormShell
      eyebrow="Login"
      title="회원 로그인"
      description="이메일 로그인과 소셜 로그인을 함께 지원합니다. 로그인 전 장바구니도 같은 계정으로 이어집니다."
      alternateHref={`/signup?next=${encodeURIComponent(nextPath)}`}
      alternateLabel="회원가입"
      alternateDescription="아직 계정이 없다면 바로 가입하고, 현재 담아 둔 장바구니와 주문 흐름을 그대로 이어서 사용할 수 있습니다."
    >
      <LoginForm nextPath={nextPath} initialErrorMessage={initialErrorMessage} />
    </AuthFormShell>
  );
}
