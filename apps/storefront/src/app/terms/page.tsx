import { ContentPage } from "@/components/content/content-page";

const TERMS_SECTIONS = [
  "현재 약관 페이지는 신규 구축 중인 스토어프런트의 MVP 운영 기준을 정리하는 임시 초안입니다.",
  "회원가입, 정기결제, 포인트, 쿠폰, 판매자 정산 등 고위험 조항은 인증/운영 기능이 들어온 뒤 별도 확정이 필요합니다.",
  "지금 단계에서는 주문 생성, 주문 상태 확인, 주문 취소, 비회원 주문조회 범위에 필요한 기본 안내만 제공합니다.",
] as const;

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Policy"
      title="이용약관"
      description="운영 정책이 모두 확정되기 전까지는 MVP 범위에 맞는 기본 약관 구조를 먼저 제공합니다."
    >
      {TERMS_SECTIONS.map((section) => (
        <p key={section} className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,243,0.72)] p-5">
          {section}
        </p>
      ))}
    </ContentPage>
  );
}
