# EXECUTIVE DEMO RUNBOOK

## Goal

1 minute 안에 아래 한 문장을 증명한다.

`고객의 주문이 바로 관리자 운영으로 연결된다.`

이 데모는 기능 나열이 아니라, 고객 행동과 운영 행동이 하나의 흐름으로 닫힌다는 점을 보여주는 영상/시연용이다.

## Primary Story

1. 고객은 홈에서 상품을 검색한다.
2. 상품 상세에서 장바구니에 담는다.
3. 장바구니에서 주문으로 이동한다.
4. 체크아웃에서 주문을 완료한다.
5. 운영자는 관리자 화면에서 방금 주문을 확인한다.
6. 같은 관리자 콘솔에서 `상품 > New product`로 운영 확장성까지 보여준다.

## Demo Length

- 목표: `50~65초`
- 추천 컷 편집: `58초 전후`

## Recommended Local URLs

- storefront: `http://127.0.0.1:4100`
- admin login: `http://127.0.0.1:4100/admin/login`
- api health: `http://127.0.0.1:8180/actuator/health`

`localhost` 대신 `127.0.0.1`을 기본 시연 주소로 사용한다. 현재 로컬 개발 환경에서는 `127.0.0.1` 경로가 가장 안정적이다.

## Demo Accounts

### Customer

메인 시연에서는 로그인 화면을 보여주지 않는다.

- 수동 시연: 브라우저를 미리 고객 로그인 상태로 준비
- 자동 시연: Playwright 스크립트가 새 데모 회원을 백그라운드에서 생성

참고용 로컬 seed 계정:

- email: `demo-user-1@maru.local`
- password: `Password123!`

### Admin

- email: `admin@maru.local`
- password: `admin1234!`

전제:

- API가 데모 seed를 포함해 기동 중이어야 한다.

## Stable Product Targets

검색/구매 플로우에서 가장 안정적으로 쓰는 상품:

- 검색어: `linen`
- 우선 타깃 상품 슬러그: `linen-bed-set`
- 백업 상품 슬러그: `brew-mug`

## Exact 1-Minute Flow

1. Home
2. Search `linen`
3. Open `linen-bed-set`
4. Add to cart
5. Open cart
6. Go to checkout
7. Place order
8. Switch to admin login
9. Login as admin
10. Open `주문`
11. Show new order
12. Open `상품`
13. Click `New product`

## What To Say

- 고객은 상품을 찾고 바로 구매할 수 있습니다.
- 주문이 생성되면 운영자는 관리자 화면에서 즉시 확인할 수 있습니다.
- 같은 콘솔에서 상품 운영까지 이어집니다.

## What Not To Show

1. 회원가입 화면
2. 고객 로그인 화면
3. FAQ / 약관 / 개인정보
4. 비회원 주문조회
5. 관리자 회원 / 리뷰 / 통계 / 운영 모니터링
6. 상품 저장 완료까지의 전체 입력

## Recording Recommendation

- 브라우저 줌: `100%`
- 해상도: `1440x900` 또는 `1600x900`
- 녹화 도구:
  - OBS
  - Loom
  - Windows 기본 캡처 + 후편집

## Backup Plan

### Backup A

검색 결과에서 `linen-bed-set`이 바로 안 보이면:

1. 검색 화면까지만 보여준다.
2. `/products/linen-bed-set`로 바로 이동한다.

### Backup B

고객 세션이 꼬이면:

1. Playwright 스크립트로 다시 세션을 만들거나
2. 수동으로 로그인된 브라우저 프로필을 사용한다.

### Backup C

관리자 로그인 이슈가 생기면:

1. `/admin` 대시보드 진입까지만 보여주고
2. `주문`, `상품` 네비게이션 존재를 강조한다.

## Commands

### Start local

```bash
npm run infra:up
```

데모 스택 자동 실행:

```bash
npm run demo:start
```

정리:

```bash
npm run demo:stop
```

수동 실행이 필요하면 API와 storefront를 별도 터미널에서 실행:

```bash
npm run dev:api
npm run dev:storefront
```

### Automated demo

표준 버전:

```bash
node scripts/executive-demo.playwright.cjs
```

60초 버전:

```bash
node scripts/executive-demo-60s.playwright.cjs
```

### Script options

```bash
$env:DEMO_HEADLESS='1'
$env:DEMO_SLOW_MO='0'
$env:DEMO_BASE_URL='http://127.0.0.1:4100'
node scripts/executive-demo-60s.playwright.cjs
```
