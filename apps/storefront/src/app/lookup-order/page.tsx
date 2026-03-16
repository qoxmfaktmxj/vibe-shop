import { GuestOrderLookupForm } from "@/components/order/guest-order-lookup-form";

export default async function GuestOrderLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNumber?: string }>;
}) {
  const { orderNumber } = await searchParams;
  const initialOrderNumber = orderNumber?.trim() ?? "";

  return (
    <div className="grid-shell lg:grid-cols-[1.15fr_0.85fr]">
      <section className="surface-card rounded-[36px] p-8 sm:p-10">
        <p className="display-eyebrow">Order Lookup</p>
        <h1 className="display-heading mt-4 text-4xl font-semibold">비회원 주문 조회</h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--ink-soft)]">
          주문 완료 화면에서 확인한 주문번호와 주문 시 입력한 연락처로 주문 상태를 다시 조회할 수 있습니다.
        </p>
        <GuestOrderLookupForm initialOrderNumber={initialOrderNumber} />
      </section>

      <aside className="surface-card rounded-[36px] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,239,233,0.76))] p-8 sm:p-10">
        <p className="display-eyebrow">안내</p>
        <div className="mt-6 space-y-4 text-sm leading-7 text-[var(--ink-soft)]">
          <p>주문번호와 주문 시 입력한 연락처를 정확히 입력해 주세요.</p>
          <p>조회 후에는 주문 상태와 배송 정보를 상세 화면에서 바로 확인할 수 있습니다.</p>
        </div>
      </aside>
    </div>
  );
}
