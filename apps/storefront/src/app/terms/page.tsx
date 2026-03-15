import { ContentPage } from "@/components/content/content-page";

const TERMS_SECTIONS = [
  "현재 이용약관은 주문과 배송 안내에 필요한 기본 내용을 중심으로 운영되고 있습니다.",
  "회원가입, 정기결제, 포인트, 쿠폰 등 추가 서비스 정책은 제공 범위가 확정되면 별도로 안내합니다.",
  "지금은 주문 접수, 주문 상태 확인, 주문 취소, 비회원 주문 조회에 필요한 내용을 먼저 제공합니다.",
] as const;

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Policy"
      title="이용약관"
      description="현재 제공 중인 주문 서비스 기준으로 기본 약관을 안내합니다."
    >
      {TERMS_SECTIONS.map((section) => (
        <p key={section} className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
          {section}
        </p>
      ))}
    </ContentPage>
  );
}
