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
              setError(loginError instanceof Error ? loginError.message : "Failed to sign in.");
            }
          })();
        });
      }}
    >
      <label className="grid gap-2">
        <span className="text-sm font-medium">Email</span>
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
        <span className="text-sm font-medium">Password</span>
        <input
          required
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          className="admin-input px-4 py-3"
          placeholder="Enter your password"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button type="submit" disabled={isPending} className="admin-button px-6 py-4 disabled:opacity-60">
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
