# API Contract v1

현재 문서는 `apps/api`와 `apps/storefront`가 실제로 사용 중인 MVP 계약만 정리한다. 레거시 SalesOn API 전체를 옮긴 문서가 아니다.

## Base URL

- local dev API: `http://127.0.0.1:8080`
- Playwright E2E API: `http://127.0.0.1:8180`
- prefix: `/api/v1`

## Error Response

모든 에러는 아래 구조를 기본으로 사용한다.

```json
{
  "code": "validation_failed",
  "message": "받는 분 이름을 입력해주세요."
}
```

주요 `code` 값:

- `not_found`
- `bad_request`
- `validation_failed`

## Catalog

### `GET /api/v1/home`

스토어프런트 홈에 필요한 대표 전시 데이터를 반환한다.

```json
{
  "heroTitle": "오늘의 감도로 공간을 채우는 셀렉트 숍",
  "heroSubtitle": "리빙, 키친, 웰니스까지 하루의 리듬을 바꾸는 제품만 가볍게 묶었습니다.",
  "featuredCategories": [
    {
      "id": 1,
      "slug": "living",
      "name": "리빙",
      "description": "공간을 차분하게 정리하는 데일리 리빙 셀렉션",
      "accentColor": "#ff8d6b"
    }
  ],
  "featuredProducts": [
    {
      "id": 1,
      "slug": "linen-bed-set",
      "name": "린넨 베드 세트",
      "categorySlug": "living",
      "categoryName": "리빙",
      "summary": "내추럴 무드로 침실 톤을 정리하는 베스트 조합",
      "price": 89000,
      "badge": "BEST",
      "accentColor": "#ff8d6b"
    }
  ]
}
```

### `GET /api/v1/categories`

헤더/카테고리 화면에 사용하는 카테고리 목록을 반환한다.

```json
[
  {
    "id": 1,
    "slug": "living",
    "name": "리빙",
    "description": "공간을 차분하게 정리하는 데일리 리빙 셀렉션",
    "accentColor": "#ff8d6b"
  }
]
```

### `GET /api/v1/products`

상품 목록을 반환한다.

쿼리:

- `category`: optional, 카테고리 slug

예시:

- `/api/v1/products`
- `/api/v1/products?category=living`

응답:

```json
[
  {
    "id": 1,
    "slug": "linen-bed-set",
    "name": "린넨 베드 세트",
    "categorySlug": "living",
    "categoryName": "리빙",
    "summary": "내추럴 무드로 침실 톤을 정리하는 베스트 조합",
    "price": 89000,
    "badge": "BEST",
    "accentColor": "#ff8d6b"
  }
]
```

### `GET /api/v1/products/{slug}`

상품 상세를 반환한다.

응답:

```json
{
  "id": 1,
  "slug": "linen-bed-set",
  "name": "린넨 베드 세트",
  "categorySlug": "living",
  "categoryName": "리빙",
  "summary": "내추럴 무드로 침실 톤을 정리하는 베스트 조합",
  "description": "크림, 스톤, 세이지 세 가지 톤으로 구성한 침구 세트입니다.",
  "price": 89000,
  "badge": "BEST",
  "accentColor": "#ff8d6b",
  "stock": 24
}
```

## Order

### `POST /api/v1/orders/preview`

주문서와 장바구니에서 금액을 계산한다.

요청:

```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 1
    }
  ]
}
```

응답:

```json
{
  "lines": [
    {
      "productId": 1,
      "productName": "린넨 베드 세트",
      "quantity": 1,
      "unitPrice": 89000,
      "lineTotal": 89000
    }
  ],
  "subtotal": 89000,
  "shippingFee": 3000,
  "total": 92000
}
```

비고:

- 현재 배송비 정책은 서버 하드코딩이다.
- 현재 재고 차감은 하지 않는다.

### `POST /api/v1/orders`

주문을 생성한다.

요청:

```json
{
  "customerName": "Kim Minsu",
  "phone": "01012345678",
  "postalCode": "06236",
  "address1": "Teheran-ro 123, Gangnam-gu",
  "address2": "8F",
  "note": "Leave at the door.",
  "items": [
    {
      "productId": 1,
      "quantity": 1
    }
  ]
}
```

응답:

```json
{
  "orderNumber": "VS260314142048138"
}
```

비고:

- 현재 단계에서 주문 생성은 주문/주문라인 저장까지다.
- 결제 승인, 상태 머신, idempotency, 재고 차감은 후속 범위다.

### `GET /api/v1/orders/{orderNumber}`

주문 완료 화면과 조회 화면에서 주문 정보를 가져온다.

응답:

```json
{
  "orderNumber": "VS260314142048138",
  "customerName": "Kim Minsu",
  "phone": "01012345678",
  "postalCode": "06236",
  "address1": "Teheran-ro 123, Gangnam-gu",
  "address2": "8F",
  "note": "Leave at the door.",
  "lines": [
    {
      "productId": 1,
      "productName": "린넨 베드 세트",
      "quantity": 1,
      "unitPrice": 89000,
      "lineTotal": 89000
    }
  ],
  "subtotal": 89000,
  "shippingFee": 3000,
  "total": 92000,
  "createdAt": "2026-03-14T14:20:48+09:00"
}
```

## Storefront Usage Rule

- 서버 컴포넌트는 `API_BASE_URL`을 우선 사용한다.
- 클라이언트 컴포넌트는 `NEXT_PUBLIC_API_BASE_URL`을 우선 사용한다.
- 둘 다 없으면 현재 코드는 브라우저 host 기준 `:8080`을 fallback으로 가정한다.

## Current Gaps

- 검색 계약 없음
- 인증/회원 계약 없음
- 서버 장바구니 계약 없음
- 리뷰/QnA/위시리스트 계약 없음
- 주문 상태/결제/취소/반품/교환 계약 없음
