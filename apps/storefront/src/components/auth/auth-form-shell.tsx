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
    <div className="mx-auto flex w-full max-w-[640px] justify-center">
      <section className="w-full border-y border-[var(--line)] py-10 sm:py-14">
        <p className="display-eyebrow">{eyebrow}</p>
        <h1 className="display-heading mt-4 text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">{description}</p>
        <div className="mt-8">{children}</div>

        <div className="mt-8 border-t border-[var(--line)] pt-6 text-sm leading-7 text-[var(--ink-soft)]">
          <p>{alternateDescription}</p>
          <Link href={alternateHref} className="button-secondary mt-5 inline-flex px-5 py-3">
            {alternateLabel}
          </Link>
        </div>
      </section>
    </div>
  );
}
