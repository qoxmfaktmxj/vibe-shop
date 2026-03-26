# MARU

MARU는 라이프스타일 커머스를 목표로 하는 신규 구축형 쇼핑 플랫폼입니다. 현재 저장소는 사용자용 스토어프런트, 운영 API, 브라우저 기반 E2E 검증 자산을 함께 관리하는 모노레포 구조로 운영됩니다.

이번 README의 주요 화면 이미지는 2026-03-26 기준 로컬 개발 서버를 Playwright로 실제 구동해 다시 캡처한 결과입니다.

## 저장소 구성

- `apps/storefront`: Next.js 기반 사용자 화면과 `/admin` 경로를 제공하는 프런트엔드 앱
- `apps/api`: Spring Boot 기반 백엔드 API
- `tests/e2e`: Playwright 기반 핵심 브라우저 시나리오
- `docs`: 설계, 계약, 배포, 분석 문서

## 주요 화면

### 1. 홈

메인 히어로, 검색 진입, 카테고리 카드, 추천 상품 섹션이 한 화면에 모여 있는 첫 진입 화면입니다. 사용자는 이 화면에서 바로 검색을 시작하거나 대표 카테고리와 추천 상품으로 이동할 수 있습니다.

![홈 화면](docs/readme-screenshots/01-home.png)

### 2. 카테고리

`/category/living` 화면으로, 카테고리 히어로 배너와 카테고리 전용 검색, 신상품/인기 상품 묶음, 전체 컬렉션 그리드를 제공합니다. 특정 카테고리 탐색 흐름을 설명할 때 가장 대표적인 랜딩 화면입니다.

![카테고리 화면](docs/readme-screenshots/02-category-living.png)

### 3. 상품 상세

대표 상품인 `brew-mug` 상세 화면입니다. 상품 이미지, 가격, 리뷰 요약, 장바구니 담기, 찜, 추천 상품, 리뷰 목록이 한 흐름으로 이어져 구매 전환의 중심 역할을 합니다.

![상품 상세 화면](docs/readme-screenshots/03-product-detail.png)

### 4. 장바구니

담은 상품의 수량과 금액을 확인하고, 주문 요약과 체크아웃 진입 CTA를 바로 볼 수 있는 화면입니다. 하단 추천 상품 섹션까지 이어져 추가 구매 흐름도 함께 확인할 수 있습니다.

![장바구니 화면](docs/readme-screenshots/04-cart.png)

### 5. 체크아웃

비회원 주문 기준으로 연락처, 배송지, 결제 수단, 주문 요약을 한 화면에서 입력하는 주문서입니다. 모바일 우선 구조를 유지하면서도 데스크톱에서는 주문 요약 패널을 우측에 고정해 확인할 수 있습니다.

![체크아웃 화면](docs/readme-screenshots/05-checkout.png)

## 기술 스택

- 프런트엔드: Next.js, React, TypeScript
- 백엔드: Spring Boot, Java 21
- 데이터베이스: PostgreSQL
- 테스트: ESLint, TypeScript typecheck, Spring 테스트, Playwright E2E

## 빠른 시작

### 1. 의존성 설치

```bash
npm ci
npm ci --prefix apps/storefront
```

### 2. 로컬 Postgres 실행

```bash
npm run infra:up
```

기본 compose 설정은 PostgreSQL을 `127.0.0.1:55432` 에 노출합니다.

### 3. 개발 서버 실행

API와 스토어프런트를 각각 실행합니다.

```bash
npm run dev:api
npm run dev:storefront
```

기본 로컬 주소:

- storefront: `http://127.0.0.1:3000`
- admin route: `http://127.0.0.1:3000/admin`
- api: `http://127.0.0.1:8080`

## 검증 명령

루트에서 아래 명령을 순서대로 사용할 수 있습니다.

```bash
npm run lint:storefront
npm run typecheck
npm run build:storefront
npm run test:api
npm run qa
npm run qa:e2e
```

- `npm run qa`: storefront lint, typecheck, build와 API 테스트를 묶어 실행합니다.
- `npm run qa:e2e`: Playwright로 핵심 사용자 흐름을 브라우저에서 검증합니다.

## 관련 문서

- `docs/README.md`
- `docs/api-contract-v1.md`
- `docs/erd-v1.md`
- `docs/design-system.md`
- `docs/screen-inventory-and-ux-audit-2026-03-24.md`
- `docs/deploy-shop-minseok91-cloud.md`

## 비고

- 스크린샷은 로컬 서버 기준 실제 브라우저 자동화로 생성했습니다.
- 현재 저장소에는 과거 분석 문서도 함께 남아 있으므로, 최신 개발 판단은 `docs/`의 현재 계약 문서와 실제 코드 기준으로 확인하는 것이 안전합니다.
