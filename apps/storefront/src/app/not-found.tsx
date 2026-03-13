import Link from "next/link";

export default function NotFound() {
  return (
    <div className="surface-card rounded-[36px] p-8 text-center sm:p-10">
      <p className="display-eyebrow">Not Found</p>
      <h1 className="display-heading mt-4 text-4xl font-semibold">
        요청한 화면을 찾을 수 없습니다.
      </h1>
      <p className="mt-4 text-[var(--ink-soft)]">
        URL을 다시 확인하거나 메인에서 흐름을 다시 시작해 주세요.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white"
      >
        메인으로 이동
      </Link>
    </div>
  );
}
