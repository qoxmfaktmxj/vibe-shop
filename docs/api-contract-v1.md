# API Contract v1

Vibe Shop API 계약 문서다.  
이 문서는 현재 `apps/api` 구현을 기준으로 정리하며, storefront / admin 이 실제로 사용하는 요청·응답 구조를 중심으로 설명한다.

## 1. 공통 규칙

- Base URL: `/api/v1`
- Content-Type: `application/json`
- 고객 인증은 `vibe_shop_session` 쿠키 기반 세션으로 처리한다.
- 관리자 인증은 `vibe_shop_admin_session` 쿠키 기반 세션으로 처리한다.
- 장바구니는 `vibe_shop_cart` 쿠키를 사용한다.
- 인증 토큰은 응답 body/custom header로 주지 않고 **`Set-Cookie` 로만 전달**한다.
- 오류 응답은 아래 형식을 기본으로 사용한다.

```json
{
  "code": "bad_request",
  "message": "요청 처리 중 문제가 발생했습니다."
}
```

대표 오류 코드:
- `not_found`
- `bad_request`
- `validation_failed`
- `unauthorized`

---

## 2. 인증 / 세션

### 2.1 회원가입

`POST /api/v1/auth/signup`

Request

```json
{
  "name": "홍길동",
  "email": "user@example.com",
  "password": "Password123!"
}
```

Response

```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "name": "홍길동",
    "email": "user@example.com",
    "provider": "LOCAL"
  }
}
```

비고:
- 인증 상태는 `Set-Cookie: vibe_shop_session=...; HttpOnly` 로 유지된다.
- 응답 body에 `sessionToken` 은 포함되지 않는다.

### 2.2 로그인

`POST /api/v1/auth/login`

Request

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Response

```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "name": "홍길동",
    "email": "user@example.com",
    "provider": "LOCAL"
  }
}
```

### 2.3 로그아웃

`POST /api/v1/auth/logout`

Response

```json
{
  "authenticated": false,
  "user": null
}
```

### 2.4 현재 세션 조회

`GET /api/v1/auth/session`

인증 상태:

```json
{
  "authenticated": true,
  "user": {
    "id": 1,
    "name": "홍길동",
    "email": "user@example.com",
    "provider": "LOCAL"
  }
}
```

비인증 상태:

```json
{
  "authenticated": false,
  "user": null
}
```

---

## 3. 소셜 로그인

### 3.1 소셜 로그인 교환

`POST /api/v1/auth/social/exchange`

Request

```json
{
  "provider": "GOOGLE",
  "accessToken": "provider-access-token"
}
```

Response

```json
{
  "authenticated": true,
  "user": {
    "id": 10,
    "name": "소셜 사용자",
    "email": "social@example.com",
    "provider": "GOOGLE"
  }
}
```

비고:
- 클라이언트는 `providerUserId`, `email`, `displayName` 을 직접 전달하지 않는다.
- 서버가 provider access token을 검증해 소셜 계정 정보를 조회한다.
- 소셜 세션도 일반 로그인과 동일하게 `HttpOnly` 쿠키 기반으로 유지된다.

---

## 4. 카탈로그 / 검색

### 4.1 홈 전시 데이터 조회

`GET /api/v1/home`

Response 예시

```json
{
  "heroTitle": "리빙의 결을 따라 고른 이번 시즌 셀렉션",
  "heroSubtitle": "리빙, 키친, 웰니스 카테고리에서 지금 바로 보기 좋은 신상품과 인기 상품만 따로 제안합니다.",
  "heroCtaLabel": "컬렉션 보기",
  "heroCtaHref": "/search",
  "displaySections": [
    {
      "code": "PROMOTION",
      "title": "프로모션 배너",
      "subtitle": "기획전과 프로모션 링크를 하단 섹션에 노출합니다.",
      "visible": true,
      "items": []
    }
  ],
  "featuredCategories": [],
  "curatedPicks": [],
  "newArrivals": [],
  "bestSellers": []
}
```

### 4.2 카테고리 목록 조회

`GET /api/v1/categories`

### 4.3 상품 목록 조회 / 검색

`GET /api/v1/products`

Query
- `category` : optional
- `q` : optional, 검색어
- `sort` : optional

예시
- `/api/v1/products`
- `/api/v1/products?category=living`
- `/api/v1/products?q=linen`
- `/api/v1/products?category=living&sort=popular`

Response 예시

```json
[
  {
    "id": 10,
    "slug": "linen-bed-set",
    "name": "Linen Bed Set",
    "categorySlug": "living",
    "categoryName": "Living",
    "summary": "Summary",
    "price": 89000,
    "badge": "BEST",
    "accentColor": "#29339b",
    "imageUrl": "/images/products/living-01.jpg",
    "imageAlt": "Linen Bed Set image",
    "wishlisted": false
  }
]
```

### 4.4 상품 상세 조회

`GET /api/v1/products/{slug}`

Response 예시

```json
{
  "id": 10,
  "slug": "linen-bed-set",
  "name": "Linen Bed Set",
  "categorySlug": "living",
  "categoryName": "Living",
  "summary": "Summary",
  "description": "Description",
  "price": 89000,
  "badge": "BEST",
  "accentColor": "#29339b",
  "imageUrl": "/images/products/living-01.jpg",
  "imageAlt": "Linen Bed Set image",
  "wishlisted": false,
  "stock": 10,
  "canWriteReview": false,
  "hasReviewed": false,
  "reviewSummary": {
    "averageRating": 0,
    "reviewCount": 0
  },
  "reviews": []
}
```

---

## 5. 장바구니

### 5.1 장바구니 조회

`GET /api/v1/cart`

Response

```json
{
  "items": [
    {
      "productId": 10,
      "slug": "linen-bed-set",
      "name": "Linen Bed Set",
      "price": 89000,
      "accentColor": "#29339b",
      "imageUrl": "/images/products/living-01.jpg",
      "imageAlt": "Linen Bed Set image",
      "quantity": 2
    }
  ],
  "itemCount": 2,
  "subtotal": 178000
}
```

### 5.2 장바구니 수량 변경 / 담기

`PUT /api/v1/cart/items/{productId}`

Request

```json
{
  "quantity": 2
}
```

비고:
- 비회원은 `vibe_shop_cart` 쿠키를 사용한다.
- 로그인 상태면 회원 장바구니 키(`member:{userId}`)로 저장한다.
- 로그인 시 비회원 장바구니를 회원 장바구니에 병합한다.

### 5.3 장바구니 항목 제거

`DELETE /api/v1/cart/items/{productId}`

### 5.4 장바구니 비우기

`DELETE /api/v1/cart`

---

## 6. 주문 / 결제

### 6.1 주문 미리보기

`POST /api/v1/orders/preview`

Request

```json
{
  "items": [
    {
      "productId": 10,
      "quantity": 1
    }
  ]
}
```

Response

```json
{
  "lines": [
    {
      "productId": 10,
      "productName": "Linen Bed Set",
      "quantity": 1,
      "unitPrice": 89000,
      "lineTotal": 89000
    }
  ],
  "subtotal": 89000,
  "shippingFee": 0,
  "total": 89000
}
```

### 6.2 주문 생성

`POST /api/v1/orders`

Request

```json
{
  "idempotencyKey": "checkout-20260324-1",
  "customerName": "홍길동",
  "phone": "01012345678",
  "postalCode": "06236",
  "address1": "Teheran-ro 123",
  "address2": "8F",
  "note": "Leave at concierge",
  "paymentMethod": "CARD",
  "items": [
    {
      "productId": 10,
      "quantity": 1
    }
  ]
}
```

Response

```json
{
  "orderNumber": "VS202603240001",
  "status": "PAID",
  "paymentStatus": "SUCCEEDED",
  "paymentMethod": "CARD"
}
```

### 6.3 비회원 주문 조회용 주문번호 확인

`POST /api/v1/orders/lookup`

Request

```json
{
  "orderNumber": "VS202603240001",
  "phone": "01012345678"
}
```

Response

```json
{
  "orderNumber": "VS202603240001"
}
```

### 6.4 주문 취소

`POST /api/v1/orders/{orderNumber}/cancel`

- 회원: 세션 쿠키 기준
- 비회원: `?phone=...` 전달

Response

```json
{
  "orderNumber": "VS202603240001",
  "status": "CANCELLED"
}
```

### 6.5 주문 상세 조회

`GET /api/v1/orders/{orderNumber}`

### 6.6 주문 목록 조회

`GET /api/v1/orders`

- 회원: 세션 쿠키 기준 내 주문 목록
- 비회원: `?phone=...` 기준 조회

Response 예시

```json
[
  {
    "orderNumber": "VS202603240001",
    "status": "PAID",
    "customerType": "MEMBER",
    "customerName": "홍길동",
    "total": 89000,
    "createdAt": "2026-03-24T10:00:00+09:00",
    "itemCount": 1
  }
]
```

---

## 7. 계정

### 7.1 내 프로필 조회

`GET /api/v1/account`

Response

```json
{
  "id": 1,
  "name": "홍길동",
  "email": "user@example.com",
  "provider": "LOCAL",
  "createdAt": "2026-03-24T10:00:00+09:00",
  "orderCount": 3,
  "addressCount": 2,
  "wishlistCount": 5,
  "reviewCount": 1
}
```

### 7.2 내 프로필 수정

`PUT /api/v1/account`

Request

```json
{
  "name": "홍길동"
}
```

### 7.3 배송지 조회

`GET /api/v1/account/addresses`

### 7.4 배송지 추가

`POST /api/v1/account/addresses`

### 7.5 배송지 수정

`PUT /api/v1/account/addresses/{addressId}`

### 7.6 배송지 삭제

`DELETE /api/v1/account/addresses/{addressId}`

Response

```json
{
  "addressId": 12
}
```

---

## 8. 리뷰

### 8.1 리뷰 작성

`POST /api/v1/products/{productId}/reviews`

Request

```json
{
  "rating": 5,
  "title": "Excellent texture",
  "content": "Matches the room tone perfectly."
}
```

Response 예시

```json
{
  "id": 100,
  "productId": 10,
  "productSlug": "linen-bed-set",
  "productName": "Linen Bed Set",
  "productImageUrl": "/images/products/living-01.jpg",
  "productImageAlt": "Linen Bed Set image",
  "rating": 5,
  "title": "Excellent texture",
  "content": "Matches the room tone perfectly.",
  "status": "PUBLISHED",
  "createdAt": "2026-03-24T10:00:00+09:00"
}
```

비고:
- 구매 이력이 있는 회원만 리뷰를 작성할 수 있다.
- 동일 상품에 대한 중복 리뷰는 허용하지 않는다.

### 8.2 내 리뷰 조회

`GET /api/v1/account/reviews`

---

## 9. 위시리스트

### 9.1 위시리스트 조회

`GET /api/v1/account/wishlist`

### 9.2 위시리스트 추가

`POST /api/v1/account/wishlist/items/{productId}`

Response

```json
{
  "productId": 10,
  "wishlisted": true
}
```

### 9.3 위시리스트 제거

`DELETE /api/v1/account/wishlist/items/{productId}`

Response

```json
{
  "productId": 10,
  "wishlisted": false
}
```

---

## 10. 관리자 인증 / 세션

### 10.1 관리자 로그인

`POST /api/v1/admin/session/login`

Request

```json
{
  "email": "owner@example.com",
  "password": "password123!"
}
```

Response

```json
{
  "authenticated": true,
  "user": {
    "id": 900,
    "name": "Owner",
    "email": "owner@example.com",
    "role": "OWNER"
  }
}
```

비고:
- 관리자 세션도 일반 로그인과 동일하게 쿠키 기반이다.
- 응답 body/header에 별도 admin session token을 노출하지 않는다.

### 10.2 관리자 로그아웃

`POST /api/v1/admin/session/logout`

### 10.3 관리자 세션 조회

`GET /api/v1/admin/session`

---

## 11. 관리자 기능

### 11.1 대시보드
- `GET /api/v1/admin/dashboard`

### 11.2 상품 관리
- `GET /api/v1/admin/products`
- `PUT /api/v1/admin/products/{productId}`

### 11.3 주문 관리
- `GET /api/v1/admin/orders`
- `PUT /api/v1/admin/orders/{orderNumber}/status`

### 11.4 카테고리 관리
- `GET /api/v1/admin/categories`
- `POST /api/v1/admin/categories`
- `PUT /api/v1/admin/categories/{categoryId}`
- `DELETE /api/v1/admin/categories/{categoryId}`

### 11.5 전시 관리
- `GET /api/v1/admin/display`
- `PUT /api/v1/admin/display`
- `PUT /api/v1/admin/display/sections/{code}`
- `POST /api/v1/admin/display/items`
- `PUT /api/v1/admin/display/items/{itemId}`
- `DELETE /api/v1/admin/display/items/{itemId}`

### 11.6 회원 관리
- `GET /api/v1/admin/members`
- `PUT /api/v1/admin/members/{memberId}/status`

### 11.7 리뷰 관리
- `GET /api/v1/admin/reviews`
- `PUT /api/v1/admin/reviews/{reviewId}/status`

### 11.8 통계
- `GET /api/v1/admin/statistics`

---

## 12. 제한사항 / 메모

- 본 문서는 현재 구현 기준의 수동 문서다.
- 일부 응답 필드는 운영 과정에서 확장될 수 있다.
- 주문/결제/환불 정책은 시뮬레이션 및 기본 흐름 구현 중심이다.
- 향후 OpenAPI 등 자동 문서화 체계로 전환하는 것을 권장한다.

---

현재 문서는 **수동 관리 중**이며, 향후 **자동 문서화 체계로 전환 예정**이다.
