import Link from "next/link";

export function AuthFormShell({
  eyebrow,
  title,
  description,
  alternateHref,
  alternateLabel,
  alternateDescription,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  alternateHref: string;
  alternateLabel: string;
  alternateDescription: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid-shell lg:grid-cols-[1.05fr_0.95fr]">
      <section className="surface-card rounded-[36px] p-8 sm:p-10">
        <p className="display-eyebrow">{eyebrow}</p>
        <h1 className="display-heading mt-4 text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
          {description}
        </p>
        <div className="mt-8">{children}</div>
      </section>

      <aside className="surface-card rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,239,233,0.76))] p-8 sm:p-10">
        <p className="display-eyebrow">계정</p>
        <h2 className="display-heading mt-4 text-3xl">{alternateLabel}</h2>
        <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">{alternateDescription}</p>
        <Link href={alternateHref} className="button-secondary mt-8 px-5 py-3">
          {alternateLabel}
        </Link>
      </aside>
    </div>
  );
}
