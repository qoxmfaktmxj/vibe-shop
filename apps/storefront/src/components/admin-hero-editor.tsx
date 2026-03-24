"use client";

import { useState, useTransition } from "react";

import { updateDisplay } from "@/lib/admin-client-api";
import type { AdminDisplay, UpdateAdminDisplayPayload } from "@/lib/admin-contracts";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AdminHeroEditor({
  initialDisplay,
}: {
  initialDisplay: Pick<AdminDisplay, "heroTitle" | "heroSubtitle" | "heroCtaLabel" | "heroCtaHref">;
}) {
  const [form, setForm] = useState<UpdateAdminDisplayPayload>({
    heroTitle: initialDisplay.heroTitle,
    heroSubtitle: initialDisplay.heroSubtitle,
    heroCtaLabel: initialDisplay.heroCtaLabel,
    heroCtaHref: initialDisplay.heroCtaHref,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, startSaving] = useTransition();

  return (
    <article className="admin-card rounded-[36px] p-8">
      <p className="eyebrow text-[var(--ink-soft)]">Display Hero</p>
      <h2 className="display mt-4 text-3xl font-semibold">Home hero copy</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
        Keep the landing message editable without loading the rest of the admin console.
      </p>

      <form
        className="mt-8 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setMessage("");
          setError("");

          startSaving(() => {
            void (async () => {
              try {
                const nextDisplay = await updateDisplay({
                  heroTitle: form.heroTitle.trim(),
                  heroSubtitle: form.heroSubtitle.trim(),
                  heroCtaLabel: form.heroCtaLabel.trim(),
                  heroCtaHref: form.heroCtaHref.trim(),
                });

                setForm({
                  heroTitle: nextDisplay.heroTitle,
                  heroSubtitle: nextDisplay.heroSubtitle,
                  heroCtaLabel: nextDisplay.heroCtaLabel,
                  heroCtaHref: nextDisplay.heroCtaHref,
                });
                setMessage("Hero content updated.");
              } catch (nextError) {
                setError(getErrorMessage(nextError, "Failed to update hero content."));
              }
            })();
          });
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-medium">Hero title</span>
          <input
            name="heroTitle"
            required
            value={form.heroTitle}
            onChange={(event) => setForm((current) => ({ ...current, heroTitle: event.target.value }))}
            className="admin-input px-4 py-3"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Hero subtitle</span>
          <textarea
            name="heroSubtitle"
            required
            rows={4}
            value={form.heroSubtitle}
            onChange={(event) => setForm((current) => ({ ...current, heroSubtitle: event.target.value }))}
            className="admin-input px-4 py-3"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium">CTA label</span>
            <input
              name="heroCtaLabel"
              required
              value={form.heroCtaLabel}
              onChange={(event) => setForm((current) => ({ ...current, heroCtaLabel: event.target.value }))}
              className="admin-input px-4 py-3"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">CTA href</span>
            <input
              name="heroCtaHref"
              required
              value={form.heroCtaHref}
              onChange={(event) => setForm((current) => ({ ...current, heroCtaHref: event.target.value }))}
              className="admin-input px-4 py-3"
            />
          </label>
        </div>

        {message ? <p className="text-sm text-[var(--teal)]">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button type="submit" disabled={isSaving} className="admin-button w-fit px-6 py-4 disabled:opacity-60">
          {isSaving ? "Saving..." : "Save hero content"}
        </button>
      </form>
    </article>
  );
}
