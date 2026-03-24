"use client";

import { useState, useTransition } from "react";

import { useAdminAuth } from "@/lib/auth-store";

export function LoginForm() {
  const { signIn } = useAdminAuth();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
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

        startTransition(() => {
          void (async () => {
            try {
              await signIn(form);
              window.location.assign("/");
            } catch (loginError) {
              setError(
                loginError instanceof Error
                  ? loginError.message
                  : "관리자 로그인 처리 중 문제가 발생했습니다.",
              );
            }
          })();
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
          className="admin-input px-4 py-3"
          placeholder="owner@example.com"
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
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button type="submit" disabled={isPending} className="admin-button px-6 py-4 disabled:opacity-60">
        {isPending ? "로그인 중입니다." : "로그인"}
      </button>
    </form>
  );
}
