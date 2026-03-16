import { redirect } from "next/navigation";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getAuthSession } from "@/lib/server-api";

function sanitizeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/account";
  }

  return nextPath;
}

export default async function LoginPage({
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
      eyebrow="Login"
      title="회원 로그인"
      description="계정으로 로그인하면 세션이 유지되고, 로그인 직전 장바구니가 회원 상태로 이어집니다."
      alternateHref={`/signup?next=${encodeURIComponent(nextPath)}`}
      alternateLabel="회원가입"
      alternateDescription="아직 계정이 없다면 바로 가입해서 같은 흐름으로 이어서 이용할 수 있습니다."
    >
      <LoginForm nextPath={nextPath} />
    </AuthFormShell>
  );
}
