import Link from "next/link";

export type SiteHeaderCategory = {
  id: string | number;
  name: string;
  slug?: string | null;
};

type SiteHeaderProps = {
  categories?: SiteHeaderCategory[];
};

export function SiteHeader({ categories = [] }: SiteHeaderProps) {
  const links = categories.slice(0, 6);

  return (
    <header className="border-b border-[var(--border)]/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="text-xl font-semibold tracking-tight text-[var(--ink)]">
          Vibe Shop
        </Link>

        <nav aria-label="Primary" className="hidden md:flex md:items-center md:gap-5">
          {links.map((category) => (
            <a
              key={category.id}
              href={`/?category=${encodeURIComponent(category.slug ?? category.name)}`}
              className="text-sm text-[var(--ink-secondary)] transition-colors hover:text-[var(--ink)]"
            >
              {category.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
