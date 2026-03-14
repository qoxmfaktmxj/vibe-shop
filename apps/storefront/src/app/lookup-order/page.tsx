import { GuestOrderLookupForm } from "@/components/order/guest-order-lookup-form";

export default function GuestOrderLookupPage() {
  return (
    <div className="grid-shell lg:grid-cols-[1.15fr_0.85fr]">
      <section className="surface-card rounded-[36px] p-8 sm:p-10">
        <p className="display-eyebrow">Guest Lookup</p>
        <h1 className="display-heading mt-4 text-4xl font-semibold">
          비회원 주문 조회
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
          주문 완료 화면에서 확인한 주문번호와 주문 시 입력한 연락처로 주문 상태를 다시 조회할 수 있습니다.
        </p>
        <GuestOrderLookupForm />
      </section>

      <aside className="surface-card rounded-[36px] border-[rgba(41,51,155,0.14)] bg-[linear-gradient(180deg,rgba(41,51,155,0.06),rgba(255,255,243,0.88))] p-8 sm:p-10">
        <p className="display-eyebrow">Guide</p>
        <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--ink-soft)]">
          <p>현재 단계에서는 회원 로그인 없이도 주문 조회 흐름을 확인할 수 있도록 비회원 조회 진입점을 먼저 제공합니다.</p>
          <p>조회가 되면 기존 주문 상세 화면으로 이동하고, 주문 상태와 배송 정보를 함께 확인할 수 있습니다.</p>
        </div>
      </aside>
    </div>
  );
}
