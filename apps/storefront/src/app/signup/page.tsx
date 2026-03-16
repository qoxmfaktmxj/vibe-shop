import { redirect } from "next/navigation";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { SignupForm } from "@/components/auth/signup-form";
import { getAuthSession } from "@/lib/server-api";

function sanitizeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return "/account";
  }

  return nextPath;
}

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
      description="새 계정을 만들면 즉시 로그인되고, 현재 장바구니는 회원 세션으로 이어집니다."
      alternateHref={`/login?next=${encodeURIComponent(nextPath)}`}
      alternateLabel="로그인"
      alternateDescription="이미 계정이 있다면 로그인해서 바로 주문과 계정 화면을 이용할 수 있습니다."
    >
      <SignupForm nextPath={nextPath} />
    </AuthFormShell>
  );
}
