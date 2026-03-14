# storefront

`apps/storefront`는 사용자용 쇼핑 화면 앱이다.  
현재 목적은 "메인에서 상품을 보고, 장바구니에 담고, 주문을 생성하는 흐름"을 빠르게 검증하는 데 있다.

## 사용 기술

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## 현재 화면

- `/`
  - 홈
- `/category/[slug]`
  - 카테고리 상품 목록
- `/products/[slug]`
  - 상품 상세
- `/cart`
  - 장바구니
- `/checkout`
  - 주문서 작성
- `/orders/[orderNumber]`
  - 주문 완료

## 실행 방법

루트에서 실행하는 방법:

```bash
npm run dev:storefront
```

앱 디렉터리에서 직접 실행하는 방법:

```bash
npm run dev
```

기본 포트는 `3000`이다.

## 환경 변수

예시 파일:

- `.env.local.example`

주요 값:

- `API_BASE_URL`
- `NEXT_PUBLIC_API_BASE_URL`

서버 컴포넌트와 브라우저가 모두 API 서버 주소를 알고 있어야 하므로, 로컬에서는 보통 둘 다 같은 값으로 맞춘다.

```bash
API_BASE_URL=http://127.0.0.1:8080
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8080
```

## 검증 방법

정적 검증:

```bash
npm run lint
npm run build
```

브라우저 흐름 검증은 루트의 Playwright 시나리오를 사용한다.

```bash
cd ../..
npm run qa:e2e
```

## 구현 메모

- API 호출은 `src/lib/server-api.ts`, `src/lib/client-api.ts`로 분리한다.
- 장바구니는 현재 `localStorage` 기반이다.
- 디자인은 초기 MVP 수준이지만, 이후 전시/검색/상품 경험을 기준으로 확장할 예정이다.
