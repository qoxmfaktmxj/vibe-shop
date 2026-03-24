import { ContentPage } from "@/components/content/content-page";

const PRIVACY_ITEMS = [
  "주문 생성과 조회를 위해 이름, 연락처, 주소, 배송 메모를 수집합니다.",
  "비회원 주문조회와 주문내역 조회는 주문번호 또는 연락처 기준으로 동작합니다.",
  "개인정보 처리 세부 보관 기간과 제3자 제공 정책은 결제/운영 기능 확장 시 별도로 고정할 예정입니다.",
] as const;

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Privacy"
      title="개인정보처리방침"
      description="주문과 배송에 필요한 개인정보 처리 범위를 중심으로 안내합니다."
    >
      {PRIVACY_ITEMS.map((item) => (
        <p key={item} className="rounded-[24px] border border-[var(--line)] bg-[rgba(255,255,255,0.72)] p-5">
          {item}
        </p>
      ))}
    </ContentPage>
  );
}
