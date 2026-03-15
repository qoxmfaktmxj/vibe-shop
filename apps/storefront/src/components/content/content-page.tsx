import Link from "next/link";

export function ContentPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid-shell lg:grid-cols-[1.1fr_0.9fr]">
      <section className="surface-card rounded-[36px] p-8 sm:p-10">
        <p className="display-eyebrow">{eyebrow}</p>
        <h1 className="display-heading mt-4 text-4xl font-semibold">{title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--ink-soft)]">
          {description}
        </p>
      </section>

      <aside className="surface-card rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,239,233,0.76))] p-8 sm:p-10">
        <div className="space-y-6 text-sm leading-7 text-[var(--ink-soft)]">{children}</div>
        <Link href="/" className="button-secondary mt-8 px-5 py-3">
          메인으로 돌아가기
        </Link>
      </aside>
    </div>
  );
}
