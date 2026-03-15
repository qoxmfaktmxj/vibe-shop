# vibe-shop

`vibe-shop`은 세일즈온 레거시를 참고해 새 구조로 다시 만드는 커머스 웹앱 저장소다.  
지금 단계는 "구매 퍼널 MVP를 실제 운영 구조에 가깝게 다듬는 Phase 1 초반"에 가깝다.

레거시 코드를 그대로 옮기기보다, 화면 흐름과 API 계약을 현재 구조에 맞게 다시 설계하는 방식을 기본 원칙으로 잡고 있다.

## 이 저장소에 들어 있는 앱

- `apps/storefront`
  - 사용자용 쇼핑 화면
  - 홈, 카테고리, 상품 상세, 서버 장바구니, 체크아웃, 주문 완료, 비회원 주문조회까지 구현
- `apps/api`
  - storefront가 사용하는 API
  - 카탈로그 조회, 서버 장바구니, 주문 preview/create/get, 비회원 주문조회 제공
- `apps/admin`
  - 2차 범위인 관리자 앱 자리
  - 현재는 착수 전 상태
- `tests/e2e`
  - Playwright 기반 브라우저 시나리오

앱별 세부 설명:

- [apps/storefront/README.md](./apps/storefront/README.md)
- [apps/api/README.md](./apps/api/README.md)
- [apps/admin/README.md](./apps/admin/README.md)

## 현재 구현 범위

현재는 아래 흐름을 MVP로 검증하고 있다.

1. 홈 진입
2. 카테고리 이동
3. 상품 상세 진입
4. 서버 장바구니 담기
5. 주문 금액 미리보기
6. 주문 생성
7. 주문 완료 페이지 확인
8. 비회원 주문 조회 재진입

현재 들어간 보강:

- 장바구니를 `localStorage` 단독 상태에서 서버 세션 장바구니로 변경
- 주문 생성 시 `idempotency key`로 중복 제출 방지
- 주문 상태 필드 추가
- 비회원 주문번호 + 연락처 조회 API 및 화면 추가

아직 없는 범위:

- 로그인, 회원가입, 비회원/회원 주문 분기
- 검색
- 마이페이지
- 리뷰, 상품문의, 위시리스트
- 실제 결제 승인
- 관리자 기능

## 기술 스택

### 프런트엔드

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

### 백엔드

- Spring Boot 4
- Java 21
- Spring Web MVC
- Spring Data JPA
- Flyway
- PostgreSQL

### 테스트와 검증

- Playwright
- JUnit
- ESLint

## 디렉터리 구조

```text
apps/
  storefront/   사용자 화면
  api/          API 서버
  admin/        관리자 화면(준비 중)
docs/           분석 문서, 계약 문서, ERD, 로드맵
tests/e2e/      브라우저 E2E 시나리오
scripts/        루트 실행 보조 스크립트
```

## 로컬 실행 환경

필수 환경:

- Node.js 22 이상
- npm 10 이상
- Java 21
- Docker Desktop

## 시작 방법

### 1. 의존성 설치

```bash
npm ci
npm ci --prefix apps/storefront
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
npm run dev
```

개별 실행도 가능하다.

```bash
npm run dev:api
npm run dev:storefront
```

기본 개발 포트:

- storefront: `http://127.0.0.1:3000`
- api: `http://127.0.0.1:8080`

## 환경 변수

### API

기본 예시는 [apps/api/.env.example](./apps/api/.env.example)에 있다.

주요 값:

- `APP_PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `CORS_ALLOWED_ORIGINS`

### storefront

기본 예시는 [apps/storefront/.env.local.example](./apps/storefront/.env.local.example)에 있다.

주요 값:

- `API_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL`

현재 규칙:

1. 서버 컴포넌트는 `API_BASE_URL`을 우선 사용한다.
2. 없으면 `NEXT_PUBLIC_API_BASE_URL`을 사용한다.
3. 브라우저에서는 `NEXT_PUBLIC_API_BASE_URL`을 우선 사용한다.
4. 둘 다 없으면 현재 host 기준 `:8080`을 기본값으로 잡는다.

## 자주 쓰는 명령

```bash
npm run infra:up
npm run infra:down
npm run dev
npm run lint:storefront
npm run build:storefront
npm run build:api
npm run test:api
npm run qa:e2e
```

## 테스트 방법

### 1. storefront 정적 검증

```bash
npm run lint:storefront
npm run build:storefront
```

### 2. API 테스트

```bash
npm run test:api
```

현재는 Spring context 외에 서버 장바구니와 주문 idempotency 서비스 테스트까지 포함한다.

### 3. 브라우저 E2E

Playwright smoke는 로컬 Postgres가 없으면 먼저 띄우고, 그다음 API와 storefront를 자동으로 실행해서 구매 퍼널을 끝까지 검증한다.

```bash
npm run qa:e2e:install
npm run qa:e2e
```

E2E 전용 포트:

- storefront: `3100`
- api: `8180`

기존 3000/8080 포트에 다른 로컬 앱이 떠 있어도 충돌하지 않게 분리했다.

실행 결과는 아래 위치에 남는다.

- `output/playwright/`
- `output/playwright-report/`
- `output/test-results/`

## 문서

- 재베이스라인 로드맵: [docs/saleson-rebaseline-roadmap-2026-03-14.md](./docs/saleson-rebaseline-roadmap-2026-03-14.md)
- 현재 API 계약: [docs/api-contract-v1.md](./docs/api-contract-v1.md)
- 현재 ERD 초안: [docs/erd-v1.md](./docs/erd-v1.md)

## 현재 판단

이 프로젝트는 방향이 틀린 상태가 아니라, 아직 범위는 작지만 구매 퍼널 코어를 하나씩 운영형 구조로 바꾸는 단계다.

다음 우선순위는 아래 순서가 맞다.

1. 인증과 세션
2. 회원/비회원 주문 분기
3. 주문 상태 확장, 재고, 결제 어댑터
4. 검색과 전시 확장
5. 마이페이지
6. 관리자 앱

## 참고 메모

- 관리자 화면은 2차 범위다.
- 현재 compose는 로컬 Postgres만 다룬다.
- 운영 가능한 수준의 주문/결제/재고/회원 체계는 아직 후속 작업이다.
