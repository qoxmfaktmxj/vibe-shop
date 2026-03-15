import { ContentPage } from "@/components/content/content-page";

const FAQ_ITEMS = [
  {
    question: "현재 주문은 실제 결제까지 연결되나요?",
    answer:
      "아직은 아닙니다. 현재 단계에서는 주문 생성, 주문 상태, 취소, 주문조회 흐름까지를 우선 검증하고 있습니다.",
  },
  {
    question: "비회원도 주문을 다시 확인할 수 있나요?",
    answer:
      "가능합니다. 주문번호와 주문 시 입력한 연락처로 비회원 주문조회와 주문내역 조회를 할 수 있습니다.",
  },
  {
    question: "장바구니는 어디에 저장되나요?",
    answer:
      "현재는 브라우저 localStorage 대신 API 기반 서버 세션 장바구니로 저장됩니다.",
  },
] as const;

export default function FaqPage() {
  return (
    <ContentPage
      eyebrow="FAQ"
      title="자주 묻는 질문"
      description="현재 MVP 단계에서 자주 확인하는 질문과 답변을 먼저 정리했습니다."
    >
      {FAQ_ITEMS.map((item) => (
        <article key={item.question} className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,243,0.72)] p-5">
          <h2 className="display-heading text-xl font-semibold text-[var(--ink)]">
            {item.question}
          </h2>
          <p className="mt-3">{item.answer}</p>
        </article>
      ))}
    </ContentPage>
  );
}
