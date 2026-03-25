export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-[1480px] flex-col gap-6 px-6 py-8 sm:px-8 lg:px-10">
      <section className="admin-dark rounded-[40px] p-8 sm:p-10">
        <div className="grid gap-4">
          <p className="eyebrow text-white/60">로딩 중</p>
          <h1 className="display text-4xl font-semibold leading-[0.94] sm:text-5xl">
            관리자 화면을 준비하고 있습니다.
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-white/68">
            대시보드와 운영 데이터가 로드되는 중입니다. 잠시만 기다려 주세요.
          </p>
          <div className="h-3 w-28 animate-pulse rounded-full bg-white/15" />
          <div className="h-12 w-full max-w-[34rem] animate-pulse rounded-full bg-white/12" />
          <div className="h-4 w-full max-w-[42rem] animate-pulse rounded-full bg-white/12" />
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="admin-card h-40 animate-pulse rounded-[28px]" />
        ))}
      </section>
    </main>
  );
}
