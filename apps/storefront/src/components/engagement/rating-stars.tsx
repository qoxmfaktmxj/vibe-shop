"use client";

export function RatingStars({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const filled = Math.round(rating);
  const className = size === "sm" ? "text-sm" : "text-base";

  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={index < filled ? "text-[var(--primary)]" : "text-[rgba(67,79,88,0.28)]"}
        >
          ★
        </span>
      ))}
    </div>
  );
}
