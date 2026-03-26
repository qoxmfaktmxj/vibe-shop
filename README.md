# Maru

Maru는 `apps/storefront`에 단일 Next.js 웹 앱이 있고, `apps/api`에 Spring Boot API가 있는 커머스 모노레포입니다.  
storefront 앱은 고객용 라우트와 `/admin` 하위의 관리자 라우트를 모두 제공합니다.

## 앱 구성

- `apps/storefront`
  - Next.js 웹 앱
  - 고객 라우트: `/...`
  - 관리자 라우트: `/admin/...`

- `apps/api`
  - Spring Boot API
  - auth/session, catalog, orders, account, review, wishlist, recommendation, admin 엔드포인트 제공

- `tests/e2e`
  - 주요 storefront 및 admin 흐름에 대한 Playwright 브라우저 테스트 커버리지

## 주요 화면

아래 이미지는 로컬 storefront를 실제 브라우저 자동화로 열어서 캡처한 현재 기준 화면입니다.

### 1. 홈

메인 히어로, 카테고리 진입, 추천 섹션이 한 화면에 모여 있는 진입 화면입니다. 상단 카테고리 네비게이션과 메인 배너 CTA를 통해 바로 탐색을 시작할 수 있습니다.

![홈 화면](docs/readme-screenshots/01-home.png)

### 2. 카테고리

카테고리 랜딩은 리빙/키친/웰니스별 큐레이션 문구와 함께 신상품, 인기 상품, 전체 컬렉션을 분리해서 보여줍니다. 같은 화면 안에서 카테고리 검색과 정렬도 이어집니다.

![리빙 카테고리 화면](docs/readme-screenshots/02-category-living.png)

### 3. 상품 상세

상품 상세는 대표 이미지, 가격, 재고, 리뷰 요약, 장바구니/찜 액션을 한 번에 노출합니다. 하단에는 함께 보면 좋은 추천 상품과 리뷰 영역이 이어집니다.

![상품 상세 화면](docs/readme-screenshots/03-product-detail.png)

### 4. 장바구니

장바구니는 담아 둔 상품 수량 조절, 예상 결제 금액, 주문서 이동 버튼을 한 화면에 정리합니다. 하단 추천 섹션으로 추가 구매 흐름도 이어집니다.

![장바구니 화면](docs/readme-screenshots/04-cart.png)

### 5. 체크아웃

체크아웃은 비회원 주문 기준으로 연락처, 배송지, 결제 수단, 주문 요약을 한 화면에서 입력하도록 구성되어 있습니다. 모바일 우선 레이아웃을 유지하면서 데스크톱에서도 한 번에 마무리할 수 있게 설계했습니다.

![체크아웃 화면](docs/readme-screenshots/05-checkout.png)

## 스택

- 프론트엔드: Next.js 16, React 19, TypeScript
- 백엔드: Spring Boot 4, Java 21, JPA, Flyway
- 데이터베이스: PostgreSQL
- 품질 검증: lint, typecheck, build, API tests, Playwright E2E

## 빠른 시작

1. 의존성 설치

```bash
npm ci
npm ci --prefix apps/storefront
```

2. 로컬 Postgres 실행

```bash
npm run infra:up
```

로컬 compose 스택은 기본적으로 `127.0.0.1:55432` 에서 Postgres를 노출합니다.

3. 앱 실행

```bash
npm run dev:api
npm run dev:storefront
```

기본 로컬 포트:

- storefront: `http://127.0.0.1:3000`
- admin: `http://127.0.0.1:3000/admin`
- api: `http://127.0.0.1:8080`

## 품질 게이트

레포 루트에서 아래 명령을 사용하세요.

```bash
npm run lint:storefront
npm run typecheck
npm run build:storefront
npm run test:api
npm run qa
npm run qa:e2e
```

`npm run qa`는 레포 전역의 비-E2E 품질 게이트입니다.

- storefront lint + typecheck + build
- API 테스트

## 배포

배포 관련 자산은 레포 루트에 있습니다.

- `compose.deploy.yaml`
- `.env.deploy.example`
- `docs/deploy-shop-minseok91-cloud.md`

배포 스택에는 다음이 포함됩니다.

- PostgreSQL
- API
- storefront 웹 앱 (고객 + 관리자 라우트)

## 기준 문서

현재 기준 문서는 아래 위치에 있습니다.

- `docs/README.md`
- `docs/api-contract-v1.md`
- `docs/erd-v1.md`
- `docs/design-system.md`
- `docs/screen-inventory-and-ux-audit-2026-03-24.md`

기존 기획 문서는 `docs/` 아래에 그대로 남아 있지만, 명시적으로 `Status: historical` 로 표시되어 있으며 현재 제품 계약 문서로 취급하면 안 됩니다.

## 현재 리스크

- 대규모 라우트 변경 또는 인증 변경 이후에는 API, storefront, `/admin` 라우트 전반에 대한 회귀 검증이 여전히 함께 필요합니다.
- 데모 및 배포 설정은 반드시 환경 변수 중심으로 유지해야 하며, 하드코딩된 운영 기본값을 다시 넣지 않아야 합니다.
- 프론트엔드 계약은 현재 중앙화되어 있지만, API 스키마 생성은 아직 향후 작업입니다.
