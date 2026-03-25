export type SocialProvider = "google" | "kakao";

export const SOCIAL_PROVIDERS: Array<{
  provider: SocialProvider;
  label: string;
  iconSrc: string;
  iconAlt: string;
  accentClassName: string;
}> = [
  {
    provider: "google",
    label: "Google로 계속하기",
    iconSrc: "/images/social/google-login.png",
    iconAlt: "Google 로그인 아이콘",
    accentClassName: "border-[rgba(66,133,244,0.18)] bg-white text-[var(--ink)]",
  },
  {
    provider: "kakao",
    label: "카카오로 계속하기",
    iconSrc: "/images/social/kakao-login.png",
    iconAlt: "카카오 로그인 아이콘",
    accentClassName: "border-[rgba(254,229,0,0.3)] bg-[#FEE500] text-[#191600]",
  },
];

export function isSocialProvider(value: string): value is SocialProvider {
  return value === "google" || value === "kakao";
}

export function getSocialLoginErrorMessage(error?: string | null) {
  switch (error) {
    case "social_google_unavailable":
      return "Google 로그인 설정이 아직 연결되지 않았습니다. Client ID와 redirect URI를 설정한 뒤 다시 시도해 주세요.";
    case "social_kakao_unavailable":
      return "카카오 로그인 설정이 아직 연결되지 않았습니다. Client ID와 redirect URI를 설정한 뒤 다시 시도해 주세요.";
    case "unsupported_provider":
      return "지원하지 않는 소셜 로그인 방식입니다.";
    case "invalid_state":
      return "소셜 로그인 상태 확인에 실패했습니다. 다시 시도해 주세요.";
    case "missing_code":
      return "소셜 로그인 인증 코드가 전달되지 않았습니다.";
    case "oauth_access_denied":
      return "소셜 로그인 동의가 취소되었습니다.";
    case "token_exchange_failed":
      return "소셜 로그인 토큰을 확인하지 못했습니다. 설정을 다시 확인해 주세요.";
    case "profile_fetch_failed":
      return "소셜 프로필을 가져오지 못했습니다.";
    case "email_required":
      return "이메일 제공 동의가 필요합니다. 동의 화면에서 이메일 권한을 허용해 주세요.";
    case "social_exchange_failed":
      return "소셜 계정을 쇼핑몰 세션으로 연결하지 못했습니다.";
    case "unexpected":
      return "소셜 로그인 처리 중 예기치 못한 문제가 발생했습니다.";
    default:
      return "";
  }
}
