"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { useAuth } from "@/lib/auth-store";

export function LoginForm({
  nextPath,
  initialErrorMessage = "",
}: {
  nextPath: string;
  initialErrorMessage?: string;
}) {
  const { signIn } = useAuth();
  const [error, setError] = useState(initialErrorMessage);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  return (
    <div className="grid gap-5">
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            try {
              setError("");
              await signIn(form);
              window.location.assign(nextPath);
            } catch (signInError) {
              setError(
                signInError instanceof Error
                  ? signInError.message
                  : "로그인 처리 중 문제가 발생했습니다.",
              );
            }
          });
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-medium">이메일</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="soft-input rounded-[20px] px-4 py-3"
            placeholder="you@example.com"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">비밀번호</span>
          <input
            required
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="soft-input rounded-[20px] px-4 py-3"
            placeholder="8자 이상"
          />
        </label>

        {error ? (
          <p
            className="rounded-[18px] border border-[rgba(211,89,89,0.18)] bg-[rgba(255,244,244,0.96)] px-4 py-3 text-sm text-[#9b4040]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="button-primary rounded-[20px] px-5 py-3 disabled:opacity-60"
        >
          {isPending ? "로그인 중입니다" : "로그인"}
        </button>

        <p className="text-sm text-[var(--ink-soft)]">
          아직 계정이 없다면{" "}
          <Link href={`/auth?tab=signup&next=${encodeURIComponent(nextPath)}`} className="font-semibold text-[var(--primary)]">
            회원가입
          </Link>
        </p>
      </form>

      <SocialLoginButtons nextPath={nextPath} />
    </div>
  );
}
