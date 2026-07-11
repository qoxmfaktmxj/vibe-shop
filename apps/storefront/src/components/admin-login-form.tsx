"use client";

import { useState } from "react";

import { useAdminAuth } from "@/lib/admin-auth-store";

function LoginProgressIndicator() {
  return (
    <div className="grid gap-2" role="status" aria-live="polite">
      <div className="h-1.5 overflow-hidden bg-[var(--line)]">
        <div className="h-full w-2/3 animate-pulse bg-[var(--ink)]" />
      </div>
      <p className="text-center text-xs font-medium text-[var(--ink-soft)]">
        관리자 페이지로 이동 중입니다.
      </p>
    </div>
  );
}

export function LoginForm() {
  const { signIn } = useAdminAuth();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        void (async () => {
          try {
            await signIn(form);
            window.location.assign("/admin");
          } catch (loginError) {
            setError(
              loginError instanceof Error
                ? loginError.message
                : "로그인에 실패했습니다.",
            );
            setIsSubmitting(false);
          }
        })();
      }}
    >
      <label className="grid gap-2">
        <span className="text-sm font-medium">이메일</span>
        <input
          required
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="admin-input px-4 py-3"
          placeholder="admin@maru.local"
          disabled={isSubmitting}
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium">비밀번호</span>
        <input
          required
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          className="admin-input px-4 py-3"
          placeholder="비밀번호를 입력해 주세요"
          disabled={isSubmitting}
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button type="submit" disabled={isSubmitting} className="admin-button px-6 py-4 disabled:opacity-60">
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>

      {isSubmitting ? <LoginProgressIndicator /> : null}
    </form>
  );
}
