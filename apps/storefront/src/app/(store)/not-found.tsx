import Link from "next/link";

export default function NotFound() {
  return (
    <div className="surface-card rounded-[36px] p-8 text-center sm:p-10">
      <p className="display-eyebrow">페이지</p>
      <h1 className="display-heading mt-4 text-4xl">
        페이지를 찾을 수 없습니다.
      </h1>
      <p className="mt-4 text-[var(--ink-soft)]">
        주소를 다시 확인하거나 메인 화면에서 다시 둘러보세요.
      </p>
      <Link
        href="/"
        className="button-primary mt-6 px-5 py-3"
      >
        메인으로 이동
      </Link>
    </div>
  );
}
