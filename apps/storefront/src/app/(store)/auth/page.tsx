import { redirect } from "next/navigation";

import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";
import { sanitizeNextPath } from "@/lib/auth-paths";
import { getAuthSession } from "@/lib/server-api";
import { getSocialLoginErrorMessage } from "@/lib/social-auth";

function resolveTab(value?: string) {
  return value === "signup" ? "signup" : "login";
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; tab?: string }>;
}) {
  const session = await getAuthSession().catch(() => ({ authenticated: false, user: null }));
  if (session.authenticated) {
    redirect("/account");
  }

  const { next, error, tab } = await searchParams;
  const resolvedTab = resolveTab(tab);
  const nextPath = sanitizeNextPath(next);
  const initialErrorMessage = getSocialLoginErrorMessage(error);
  const isSignup = resolvedTab === "signup";

  return (
    <AuthFormShell
      eyebrow="계정 안내"
      title={isSignup ? "회원가입으로 전환" : "로그인"}
      description={
        isSignup
          ? "아직 계정이 없다면 회원가입으로 새 계정을 만들 수 있습니다."
          : "기존 계정으로 로그인하면 주문, 배송, 리뷰, 찜 목록을 바로 확인할 수 있습니다."
      }
      alternateHref={`/auth?tab=${isSignup ? "login" : "signup"}&next=${encodeURIComponent(nextPath)}`}
      alternateLabel={isSignup ? "로그인으로 전환" : "회원가입으로 전환"}
      alternateDescription={
        isSignup
          ? "이미 계정이 있다면 로그인으로 바로 이동해 기존 계정을 사용할 수 있습니다."
          : "아직 계정이 없다면 회원가입으로 새 계정을 만들 수 있습니다."
      }
    >
      {isSignup ? (
        <SignupForm nextPath={nextPath} />
      ) : (
        <LoginForm nextPath={nextPath} initialErrorMessage={initialErrorMessage} />
      )}
    </AuthFormShell>
  );
}
