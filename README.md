# Maru

Maru는 사용자 스토어프런트와 관리자 화면을 하나의 Next.js 앱에서 제공하고,
Spring Boot API가 뒤에서 주문, 카탈로그, 계정, 관리자 기능을 담당하는 커머스 모노레포입니다.

## 한눈에 보기

- 프런트엔드: `apps/storefront`
- 백엔드: `apps/api`
- 데이터베이스: PostgreSQL
- 검증: lint, typecheck, build, API 테스트, Playwright E2E

## 주요 화면

아래 이미지는 로컬에서 정상 연결 상태를 확인한 뒤, 1280 폭 기준으로 짧게 잘라 캡처한 화면입니다.

### 1. 메인 홈

첫 화면은 메인 배너와 카테고리 진입을 중심으로, 바로 탐색을 시작하게 만드는 구조입니다.

![메인 홈](docs/readme-screenshots/01-home-hero.jpg)

### 2. 검색 결과

검색어, 카테고리, 정렬을 한 화면에 묶어서 원하는 상품군을 빠르게 좁힐 수 있습니다.

![검색 결과](docs/readme-screenshots/02-search-results.jpg)

### 3. 상품 상세

대표 상품 화면에서는 가격, 리뷰 밀도, 구매 요약이 한 번에 보이고 바로 장바구니로 이어집니다.

![상품 상세](docs/readme-screenshots/03-product-detail.jpg)

### 4. 관리자 진입

관리자 화면은 상품, 주문, 전시 운영을 분리된 작업 공간으로 다루는 구조입니다.

![관리자 로그인](docs/readme-screenshots/04-admin-login.jpg)

## 빠른 시작

### 1. 의존성 설치

```bash
npm ci
npm ci --prefix apps/storefront
```

### 2. 로컬 인프라 실행

```bash
npm run infra:up
```

### 3. 개발 서버 실행

```bash
npm run dev:api
npm run dev:storefront
```

기본 개발 주소:

- storefront: `http://127.0.0.1:3200`
- admin: `http://127.0.0.1:3200/admin`
- api: `http://127.0.0.1:8080`

### 4. 데모/캡처 스택 실행

```bash
node scripts/start-demo-stack.mjs
```

README 캡처에 사용한 고정 주소:

- storefront: `http://127.0.0.1:4100`
- api health: `http://127.0.0.1:8180/actuator/health`

종료:

```bash
node scripts/stop-demo-stack.mjs
```

## 검증 명령

```bash
npm run qa
npm run qa:e2e
```

## 추가 문서

- `docs/api-contract-v1.md`
- `docs/erd-v1.md`
- `docs/design-system.md`
- `docs/demo/`
