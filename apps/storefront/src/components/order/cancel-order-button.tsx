"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cancelOrder } from "@/lib/client-api";

export function CancelOrderButton({
  orderNumber,
}: {
  orderNumber: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              await cancelOrder(orderNumber);
              setError("");
              router.refresh();
            } catch (cancelError) {
              setError(
                cancelError instanceof Error
                  ? cancelError.message
                  : "주문을 취소하지 못했습니다.",
              );
            }
          });
        }}
        className="button-secondary px-5 py-3 disabled:opacity-60"
      >
        {isPending ? "주문을 취소하고 있습니다." : "주문 취소"}
      </button>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
