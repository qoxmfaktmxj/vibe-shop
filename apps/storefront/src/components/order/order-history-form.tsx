"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

export function OrderHistoryForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [phone, setPhone] = useState(searchParams.get("phone") ?? "");

  return (
    <form
      className="mt-8 flex flex-col gap-3 sm:flex-row"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = phone.trim();
        startTransition(() => {
          router.push(trimmed ? `/orders?phone=${encodeURIComponent(trimmed)}` : "/orders");
        });
      }}
    >
      <input
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="주문 연락처 입력"
        className="min-w-0 flex-1 rounded-2xl border border-[var(--line)] bg-[rgba(255,255,243,0.92)] px-4 py-3"
      />
      <button
        type="submit"
        disabled={isPending}
        className="button-primary px-5 py-3 disabled:opacity-60"
      >
        {isPending ? "조회 중..." : "주문내역 보기"}
      </button>
    </form>
  );
}
