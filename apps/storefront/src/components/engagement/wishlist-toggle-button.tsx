"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addWishlistItem, removeWishlistItem } from "@/lib/client-api";
import { useAuth } from "@/lib/auth-store";

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-5 w-5 transition ${active ? "fill-current" : "fill-none"}`}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 20.2 4.95 13.4A4.63 4.63 0 0 1 4 7.94a4.86 4.86 0 0 1 6.95-.67L12 8.26l1.05-.99A4.86 4.86 0 0 1 20 7.94a4.63 4.63 0 0 1-.95 5.46L12 20.2Z" />
    </svg>
  );
}

export function WishlistToggleButton({
  productId,
  initialWishlisted,
  size = "card",
  onChange,
}: {
  productId: number;
  initialWishlisted: boolean;
  size?: "card" | "detail";
  onChange?: (wishlisted: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session } = useAuth();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const classes =
    size === "detail"
      ? "button-secondary inline-flex items-center gap-2 px-4 py-3"
      : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-[rgba(255,255,255,0.84)] text-[var(--ink)] shadow-[var(--shadow-soft)] backdrop-blur-sm";

  return (
    <div className="grid gap-2">
      <button
        type="button"
        aria-label={wishlisted ? "찜 해제" : "찜 추가"}
        disabled={isPending}
        onClick={() => {
          if (!session.authenticated) {
            const next = pathname || "/";
            router.push(`/login?next=${encodeURIComponent(next)}`);
            return;
          }

          setError("");
          startTransition(() => {
            void (async () => {
              try {
                const nextState = wishlisted
                  ? await removeWishlistItem(productId)
                  : await addWishlistItem(productId);
                setWishlisted(nextState.wishlisted);
                onChange?.(nextState.wishlisted);
              } catch (nextError) {
                setError(nextError instanceof Error ? nextError.message : "찜 처리 중 문제가 발생했습니다.");
              }
            })();
          });
        }}
        className={`${classes} ${wishlisted ? "text-[var(--primary)]" : ""} disabled:opacity-60`}
      >
        <HeartIcon active={wishlisted} />
        {size === "detail" ? <span>{wishlisted ? "찜한 상품" : "찜하기"}</span> : null}
      </button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
