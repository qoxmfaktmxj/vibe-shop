# Vibe Shop

Vibe Shop은 **Next.js 기반 storefront / admin** 과 **Spring Boot 기반 API** 로 구성된 풀스택 커머스 프로젝트다.  
단순 화면 데모가 아니라, 상품 탐색부터 인증·세션, 장바구니, 주문, 계정, 리뷰, 위시리스트, 관리자 운영 흐름까지 **실제 서비스 구조에 가깝게 단계적으로 구현**하는 것을 목표로 한다.

## 프로젝트 개요

현재 저장소는 아래 3개 앱을 중심으로 동작한다.

- `apps/storefront`
  - 고객용 쇼핑 경험
  - 홈, 카테고리, 상품 목록/상세, 장바구니, 로그인, 회원가입, 마이페이지, 주문, 소셜 로그인 흐름 포함
- `apps/api`
  - Spring Boot API 서버
  - 카탈로그, 인증/세션, 장바구니, 주문, 계정, 리뷰, 위시리스트, 관리자 API 제공
- `apps/admin`
  - 운영자용 관리자 화면
  - 관리자 로그인, 대시보드, 상품/주문/회원/리뷰/전시 관리 기본 흐름 포함
- `tests/e2e`
  - Playwright 기반 브라우저 E2E 시나리오

## 현재 구현 범위

### 구현 완료 또는 기본 흐름 구현

#### 고객(Storefront)
- 홈 전시 데이터 조회
- 카테고리 탐색
- 상품 목록 조회 (`category`, `q`, `sort` 지원)
- 상품 상세 조회
- 장바구니 조회 / 수량 변경 / 삭제 / 비우기
- 비회원 장바구니와 로그인 후 회원 장바구니 병합
- 이메일 회원가입 / 로그인 / 로그아웃
- 세션 조회 (`HttpOnly` 쿠키 기반)
- Google / Kakao 소셜 로그인 교환 흐름
- 마이페이지 프로필 조회 / 수정
- 배송지 조회 / 추가 / 수정 / 삭제
- 위시리스트 조회 / 추가 / 제거
- 내 리뷰 조회
- 리뷰 작성
- 주문 미리보기 / 주문 생성 / 주문 조회 / 주문 취소
- 비회원 주문 조회 / 주문 목록 조회

#### 관리자(Admin)
- 관리자 로그인 / 로그아웃 / 세션 조회
- 운영 대시보드 조회
- 상품 목록 조회 / 수정
- 주문 목록 조회 / 상태 변경
- 카테고리 목록 조회 / 생성 / 수정 / 삭제
- 메인 전시 정보 조회 / 수정
- 전시 섹션 / 전시 아이템 생성·수정·삭제
- 회원 목록 조회 / 상태 변경
- 리뷰 목록 조회 / 상태 변경
- 통계 조회

### 부분 구현 / 제한사항

- 결제는 실제 PG 연동이 아니라 **시뮬레이션 중심 흐름**이다.
- 인증은 **세션 쿠키 기반**이며, JWT/Redis 기반 확장 구조는 아직 적용하지 않았다.
- 소셜 로그인은 provider access token을 서버에서 검증하지만, 운영 수준 설정/예외 처리 고도화는 여지가 있다.
- 관리자 기능은 핵심 운영 흐름 중심이며, 완전한 백오피스 수준은 아니다.
- 재고 / 배송 / 취소 / 환불 정책은 일부 단순화된 규칙을 사용한다.

### 향후 예정

- 실제 결제 게이트웨이 연동
- 쿠폰 / 프로모션 / 포인트 정책
- 재고 예약 / 이력 관리 고도화
- 운영 로그 / 감사 이력 / 관리자 권한 정책 확장
- OpenAPI 등 자동 문서화 체계 도입
- 세션 저장소 분리(Redis 등) 및 인증 운영 고도화

## 아키텍처

### Frontend
- Next.js 16
- React 19
- TypeScript
- App Router
- SSR + CSR 혼합 구조
- API 호출은 server/client 유틸을 분리해서 관리

### Backend
- Spring Boot 4
- Java 21
- Spring Web MVC
- Spring Validation
- Spring Data JPA
- Flyway
- PostgreSQL

### 인증 / 세션
- 고객 인증 쿠키: `vibe_shop_session`
- 관리자 인증 쿠키: `vibe_shop_admin_session`
- 장바구니 쿠키: `vibe_shop_cart`
- 인증 토큰은 **응답 body/header로 노출하지 않고 `Set-Cookie` 로만 전달**
- 서버는 `user_sessions.session_token_hash` 기준으로 세션을 조회

## 저장소 구조

```text
apps/
  storefront/   Next.js storefront
  admin/        Next.js admin
  api/          Spring Boot API

docs/
  api-contract-v1.md
  erd-v1.md
  test-product-image-sources.md

tests/
  e2e/          Playwright end-to-end tests

scripts/        실행 / 빌드 보조 스크립트
```

## 실행 환경

필수 권장 환경:

- Node.js 22+
- npm 10+
- Java 21
- Docker

## 실행 방법

### 1. 의존성 설치

```bash
npm ci
npm ci --prefix apps/storefront
npm ci --prefix apps/admin
```

### 2. 로컬 DB 실행

```bash
npm run infra:up
```

기본 Postgres 설정:

- host: `localhost`
- port: `5433`
- database: `vibeshop`
- username: `vibeshop`
- password: `vibeshop`

### 3. 개발 서버 실행

```bash
npm run dev:api
npm run dev:storefront
npm run dev:admin
```

또는 storefront + api를 함께 실행:

```bash
npm run dev
```

기본 개발 포트:

- storefront: `http://127.0.0.1:3000`
- admin: `http://127.0.0.1:3200`
- api: `http://127.0.0.1:8080`

## 자주 쓰는 명령

```bash
npm run infra:up
npm run infra:down
npm run dev
npm run dev:admin
npm run lint:storefront
npm run lint:admin
npm run build:storefront
npm run build:admin
npm run build:api
npm run test:api
npm run qa:e2e
```

## 테스트 체계

### 정적 검증
- `npm run lint:storefront`
- `npm run lint:admin`
- `npm run build:storefront`
- `npm run build:admin`

### API 테스트
- `npm run test:api`
- Spring Boot + JUnit 기반 통합 테스트
- 인증/세션, 장바구니, 주문, 리뷰, 관리자 흐름 검증 포함

### 브라우저 E2E
- `npm run qa:e2e`
- Playwright 기반
- storefront / api를 띄운 뒤 구매 퍼널과 핵심 사용자 흐름을 검증

## CI

GitHub Actions 기반 `CI` 워크플로가 구성되어 있다.

현재 파이프라인은 아래를 수행한다.

- Node.js / Java 환경 구성
- storefront lint / build
- API test
- Playwright smoke

## 문서

- API 계약: [docs/api-contract-v1.md](./docs/api-contract-v1.md)
- ERD: [docs/erd-v1.md](./docs/erd-v1.md)
- 테스트 이미지 출처: [docs/test-product-image-sources.md](./docs/test-product-image-sources.md)

## 현재 상태 요약

Vibe Shop은 더 이상 단순한 상품 목록 데모가 아니라,

- **세션 기반 인증**
- **회원/비회원 주문 흐름**
- **계정 / 리뷰 / 위시리스트**
- **관리자 운영 기능 기본 구조**

까지 포함한 **커머스 실전형 포트폴리오 프로젝트** 단계에 들어와 있다.

---

현재 문서는 **수동 관리 중**이며, 향후 OpenAPI/스키마 기반 **자동 문서화 체계로 전환 예정**이다.
