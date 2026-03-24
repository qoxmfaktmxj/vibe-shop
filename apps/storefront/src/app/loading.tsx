export default function Loading() {
  return (
    <section className="surface-card grid min-h-[420px] place-items-center rounded-[2rem] px-6 py-16 text-center">
      <div className="grid gap-4">
        <p className="display-eyebrow">Loading</p>
        <h1 className="display-heading text-4xl sm:text-5xl">Preparing the next view.</h1>
        <p className="mx-auto max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
          Catalog, account, and order data are loading. This keeps the navigation stable instead of
          dropping to an empty shell.
        </p>
      </div>
    </section>
  );
}
