"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { lookupGuestOrder } from "@/lib/client-api";

export function GuestOrderLookupForm({ initialOrderNumber = "" }: { initialOrderNumber?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    orderNumber: initialOrderNumber,
    phone: "",
  });

  return (
    <form
      className="mt-8 grid gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          try {
            const result = await lookupGuestOrder(form);
            setError("");
            router.push(
              `/orders/${result.orderNumber}?phone=${encodeURIComponent(form.phone.trim())}`,
            );
          } catch (lookupError) {
            setError(
              lookupError instanceof Error
                ? lookupError.message
                : "주문 정보를 찾지 못했습니다.",
            );
          }
        });
      }}
    >
      <label className="grid gap-2">
        <span className="text-sm font-medium">주문번호</span>
        <input
          required
          value={form.orderNumber}
          onChange={(event) =>
            setForm((current) => ({ ...current, orderNumber: event.target.value }))
          }
          className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.9)] px-4 py-3"
        />
        <span className="text-xs leading-5 text-[var(--ink-soft)]">
          주문 완료 화면 상단과 주문 확인 메일에서 확인할 수 있습니다.
        </span>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium">연락처</span>
        <input
          required
          value={form.phone}
          onChange={(event) =>
            setForm((current) => ({ ...current, phone: event.target.value }))
          }
          className="rounded-2xl border border-[var(--line)] bg-[rgba(255,255,255,0.9)] px-4 py-3"
        />
      </label>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="button-primary px-5 py-3 disabled:opacity-60"
      >
        {isPending ? "주문을 조회하고 있습니다." : "주문 조회"}
      </button>
    </form>
  );
}
