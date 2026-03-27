"use client";

import { useState, useTransition } from "react";

import { useAdminAuth } from "@/lib/admin-auth-store";

const disabledMessage =
  "\uAD00\uB9AC\uC790 \uACC4\uC815\uC774 \uC774\uBBF8 \uC788\uC73C\uBBC0\uB85C \uC774 \uD654\uBA74\uC5D0\uC11C\uB294 \uD68C\uC6D0\uAC00\uC785\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.";
const signupErrorMessage =
  "\uAD00\uB9AC\uC790 \uD68C\uC6D0\uAC00\uC785\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.";
const nameLabel = "\uC774\uB984";
const emailLabel = "\uC774\uBA54\uC77C";
const passwordLabel = "\uBE44\uBC00\uBC88\uD638";
const namePlaceholder = "\uAD00\uB9AC\uC790 \uC774\uB984";
const passwordPlaceholder =
  "8\uC790 \uC774\uC0C1 \uBE44\uBC00\uBC88\uD638";
const pendingLabel =
  "\uAD00\uB9AC\uC790 \uACC4\uC815 \uC0DD\uC131 \uC911...";
const submitLabel = "\uAD00\uB9AC\uC790 \uD68C\uC6D0\uAC00\uC785";

export function AdminBootstrapSignupForm({
  enabled,
}: {
  enabled: boolean;
}) {
  const { signUpBootstrapAdmin } = useAdminAuth();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  if (!enabled) {
    return (
      <div className="rounded-[24px] border border-[var(--line)] bg-white/40 px-5 py-4 text-sm leading-7 text-[var(--ink-soft)]">
        {disabledMessage}
      </div>
    );
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        setError("");

        startTransition(() => {
          void (async () => {
            try {
              await signUpBootstrapAdmin(form);
              window.location.assign("/admin");
            } catch (signupError) {
              setError(
                signupError instanceof Error
                  ? signupError.message
                  : signupErrorMessage,
              );
            }
          })();
        });
      }}
    >
      <label className="grid gap-2">
        <span className="text-sm font-medium">{nameLabel}</span>
        <input
          required
          type="text"
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          className="admin-input px-4 py-3"
          placeholder={namePlaceholder}
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium">{emailLabel}</span>
        <input
          required
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
          className="admin-input px-4 py-3"
          placeholder="owner@maru.local"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium">{passwordLabel}</span>
        <input
          required
          minLength={8}
          type="password"
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          className="admin-input px-4 py-3"
          placeholder={passwordPlaceholder}
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="admin-button px-6 py-4 disabled:opacity-60"
      >
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
