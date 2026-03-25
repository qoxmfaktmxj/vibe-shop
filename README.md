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
