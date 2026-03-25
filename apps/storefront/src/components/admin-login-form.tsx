"use client";

import { useState, useTransition } from "react";

import { useAdminAuth } from "@/lib/admin-auth-store";

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
              window.location.assign("/admin");
            } catch (loginError) {
              setError(
                loginError instanceof Error
                  ? loginError.message
                  : "\uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.",
              );
            }
          })();
        });
      }}
    >
      <label className="grid gap-2">
        <span className="text-sm font-medium">\uC774\uBA54\uC77C</span>
        <input
          required
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="admin-input px-4 py-3"
          placeholder="admin@maru.local"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium">\uBE44\uBC00\uBC88\uD638</span>
        <input
          required
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          className="admin-input px-4 py-3"
          placeholder="\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574 \uC8FC\uC138\uC694"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button type="submit" disabled={isPending} className="admin-button px-6 py-4 disabled:opacity-60">
        {isPending ? "\uB85C\uADF8\uC778 \uC911..." : "\uB85C\uADF8\uC778"}
      </button>
    </form>
  );
}
