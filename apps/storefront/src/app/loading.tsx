export default function Loading() {
  return (
    <section className="surface-card grid min-h-[420px] place-items-center rounded-[2rem] px-6 py-16 text-center">
      <div className="grid gap-4">
        <p className="display-eyebrow">로딩 중</p>
        <h1 className="display-heading text-4xl sm:text-5xl">다음 화면을 준비하고 있습니다.</h1>
        <p className="mx-auto max-w-xl text-sm leading-7 text-[var(--ink-soft)]">카탈로그, 계정, 주문 정보를 불러오는 중입니다.</p>
      </div>
    </section>
  );
}
