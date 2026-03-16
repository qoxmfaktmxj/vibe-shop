"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { useAuth } from "@/lib/auth-store";

export function SignupForm({ nextPath }: { nextPath: string }) {
  const { signUp } = useAuth();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
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
              await signUp(form);
              window.location.assign(nextPath);
            } catch (signUpError) {
              setError(
                signUpError instanceof Error
                  ? signUpError.message
                  : "회원가입 처리 중 문제가 발생했습니다.",
              );
            }
          });
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-medium">이름</span>
          <input
            required
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="soft-input px-4 py-3"
            placeholder="김민수"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">이메일</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="soft-input px-4 py-3"
            placeholder="you@example.com"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">비밀번호</span>
          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="soft-input px-4 py-3"
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
          className="button-primary px-5 py-3 disabled:opacity-60"
        >
          {isPending ? "가입 중입니다." : "회원가입"}
        </button>

        <p className="text-sm text-[var(--ink-soft)]">
          이미 계정이 있다면{" "}
          <Link
            href={`/login?next=${encodeURIComponent(nextPath)}`}
            className="font-semibold text-[var(--primary)]"
          >
            로그인
          </Link>
        </p>
      </form>

      <SocialLoginButtons nextPath={nextPath} />
    </div>
  );
}
