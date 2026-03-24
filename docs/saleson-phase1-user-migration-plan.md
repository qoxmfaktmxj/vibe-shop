Status: historical
Owner: planning
Last reviewed: 2026-03-24

# SalesOn 1차 분석 및 마이그레이션 계획

## 범위

- 1차 범위: 사용자 화면
- 2차 범위: 관리자 화면 확장
- 분석 대상: `C:\Users\kms\Downloads\saleson-solution-saleson-3.13.2\saleson-solution-saleson-3.13.2`

## 현재 레거시 구조 요약

- 백엔드: Spring Boot 2.3.4, Java 8, Gradle 6.7
- 모듈: `saleson-api`, `saleson-web`, `saleson-common`, `saleson-batch`
- 사용자 프런트: `saleson-front`
- 사용자 프런트 구현 방식: Vue 2 + CDN + 페이지별 HTML + 공통 `op.saleson.js`
- DB 덤프: `db/saleson-3.13.2.sql`
- 결론: 완전한 소스 저장소가 아니라 `부분 소스 + 설정 + 정적 화면 + 바이너리 JAR` 패키지에 가깝다

## 핵심 판단

- 1차는 기존 코드를 직접 이식하기보다 `화면/API 계약을 재구성`하는 방식이 맞다.
- 사용자 화면은 `saleson-front` 기준으로 상당 부분 복원 가능하다.
- 관리자 화면은 정적 자산, DB 로그, JAR 흔적은 있으나 실제 화면 소스가 충분하지 않다.
- 결제, 라이선스, 배치, 일부 공통 프레임워크는 1차 직접 이식 대상이 아니라 `연동 경계`로만 남겨두는 것이 안전하다.

## 1차 사용자 화면 인벤토리

| 도메인 | 주요 화면 | 현재 파일 수 | 핵심 API 그룹 | 우선순위 |
| --- | --- | ---: | --- | --- |
| 공통 홈/전시 | 메인, 팝업, 스타일북, 베스트/신상품/기획전 | 9 | display, event, popup | P0 |
| 카테고리/검색 | 카테고리 목록, 검색 결과 | 2 | category, item, search, quick-info | P0 |
| 상품 | 상품 상세, 상품 리뷰/QnA, 재입고 알림 | 2 | item, review, qna, coupon, relation | P0 |
| 장바구니 | 장바구니, 수량/배송비 정책 반영 | 1 | cart, order/buy | P0 |
| 주문/결제 | 비회원 약관, 주문 step1/step2 | 3 | order, payment, coupon, privacy/policy | P0 |
| 인증/회원 | 로그인, 회원가입, 아이디/비밀번호 찾기, 비밀번호 변경 | 8 | auth, policy, privacy | P0 |
| 마이페이지 | 주문, 배송지, 쿠폰, 포인트, 위시리스트, 리뷰, 1:1 문의 | 15 | mypage, order, shipping, coupon, qna | P1 |
| 콘텐츠 | 회사소개, FAQ, 공지, 개인정보처리방침, 입점문의 | 5 | common, faq, notice, policy, store-inquiry | P2 |

## 페이지별 API 매핑

### 홈/전시

| 페이지 | 레거시 파일 | 주요 API |
| --- | --- | --- |
| 메인 | `index.html` | `getPromotion`, `getMdItems`, `getNewItems`, `getGroupBestItems`, `getEvent`, `getDisplayStyleBooks`, `getPopups` |
| 카테고리 목록 | `category/index.html` | `getCurrentCategories`, `getCurrentCategoriesFilter`, `getPriceAreaList`, `getItems`, `getCartInfo`, `getQuickInfo`, `addToCart`, `addToWishList` |
| 이벤트 베스트 | `event/best.html` | `getBestItems`, `addToCart`, `addToWishList` |
| 이벤트 신상품 | `event/new.html` | `getNewItems`, `addToCart`, `addToWishList` |
| 이벤트 스팟 | `event/spot.html` | `getSpotItems` |
| 스타일북 | `event/stylebook.html` | `getStyleBooks`, `getStyleBookById` |
| 기획전 목록 | `featured/list.html` | `getEvent` |
| 기획전 상세 | `featured/detail.html` | `getEventDetail`, `getEventReply`, `createEventReply`, `addToCart`, `addToWishList` |
| 팝업 상세 | `popup/index.html` | `getPopupById` |

### 상품/검색

| 페이지 | 레거시 파일 | 주요 API |
| --- | --- | --- |
| 상품 상세 | `items/details.html` | `getItem`, `getItemReviewsForDetail`, `getItemQna`, `getIslandType`, `getRestockNotice`, `viewItemRelations`, `addToCart`, `addToWishList`, `buyOrder`, `review`, `createItemQna`, `restockNotice`, `couponDownload`, `downloadItemCouponList`, `downloadAllItemCouponList`, `addItemReviewLike`, `getCartInfo`, `getQuickInfo` |
| 검색 결과 | `items/result.html` | `getSearchResult`, `addToCart`, `addToWishList` |

### 장바구니/주문

| 페이지 | 레거시 파일 | 주요 API |
| --- | --- | --- |
| 장바구니 | `cart/index.html` | `getCartItems`, `updateCartQuantity`, `updateShippingPaymentType`, `deleteCart`, `addToWishList`, `buyOrder` |
| 비회원 주문 약관 | `order/no-member.html` | `getPolicy`, `getPrivacy` |
| 주문서 작성 | `order/step1.html` | `paymentStep`, `orderSave`, `pay`, `offlineCouponExchange`, `getIslandType` |
| 주문 완료 | `order/step2.html` | `getOrder` |

### 인증/회원

| 페이지 | 레거시 파일 | 주요 API |
| --- | --- | --- |
| 로그인 | `users/login.html` | `getAuthToken`, `getAuthGuestToken`, `sendAuthNumber`, `buyOrder` |
| 회원가입 | `users/join.html` | `sendAuthNumber`, `checkAuthNumber`, `joinMember`, `getPolicy`, `getPrivacy`, `getPolicyMarketing` |
| 가입 완료 | `users/join-complete.html` | 없음 |
| 아이디/비밀번호 찾기 | `users/find-idpw.html` | `findId`, `findPasswordStep1`, `findPasswordStep2`, `sendAuthNumber` |
| 비밀번호 변경 | `users/change-password.html` | `changePassword`, `delayChangePassword` |
| 회원정보 수정 | `users/modify.html` | `checkPassword`, `getMember`, `getSnsInfo`, `updateMember` |
| 회원 탈퇴 | `users/secede.html` | `secedeMember` |
| 휴면 계정 복구 | `users/sleep-user.html` | `recovery` |

### 마이페이지

| 페이지 | 레거시 파일 | 주요 API |
| --- | --- | --- |
| 마이페이지 메인 | `mypage/index.html` | `getMypage` |
| 주문 목록 | `mypage/order.html` | `getOrderList`, `getItemReviewInfo`, `getUnregisteredItemReviews`, `confirmPurchase`, `orderCancel`, `getReturnPop`, `returnProcess`, `getExchangePop`, `exchangeProcess`, `getCancelPop`, `cancelProcess`, `getRefundAmount`, `getBankInfo`, `review` |
| 주문 상세 | `mypage/order-detail.html` | `getOrder`, `getItemReviewInfo`, `getUnregisteredItemReviews`, `confirmPurchase`, `orderCancel`, `getReturnPop`, `returnProcess`, `getExchangePop`, `exchangeProcess`, `getCancelPop`, `cancelProcess`, `getRefundAmount`, `getBankInfo`, `review` |
| 취소/교환/반품 진입 | `mypage/order-cancel.html` | `getOrderList`, `confirmPurchase`, `orderCancel`, `getReturnPop`, `returnProcess`, `getExchangePop`, `exchangeProcess`, `getCancelPop`, `cancelProcess`, `getRefundAmount`, `getBankInfo` |
| 배송지 관리 | `mypage/delivery.html` | `getShipping`, `saveShipping`, `shippingListAction` |
| 쿠폰 | `mypage/coupon-list.html` | `getCoupon`, `getShippingCoupon`, `getAppliesTo`, `offlineCouponExchange`, `couponDownload`, `downloadCouponList`, `downloadAllCoupons` |
| 쿠폰 팝업 | `mypage/pop_downCoupon01.html` | `couponDownload`, `downloadCouponList` |
| 포인트 | `mypage/point-list.html` | `getPoints` |
| 등급 | `mypage/grade.html` | `getGrade` |
| 최근 본 상품 | `mypage/recent-view.html` | `getLatelyItems`, `addToCart`, `addToWishList` |
| 위시리스트 | `mypage/wishlist.html` | `getWishlist`, `delWishlist` |
| 리뷰 작성 팝업 | `mypage/pop_review.html` | `getItem`, `review` |
| 리뷰 관리 | `mypage/review.html` | `getItemReviews`, `deleteReview` |
| 1:1 문의 목록 | `mypage/inquiry.html` | `getInquiries`, `createInquiry`, `deleteInquiry` |
| 상품 문의 목록 | `mypage/inquiry-item.html` | `getItemInquiries`, `delItemInquiry` |

### 콘텐츠/보조 화면

| 페이지 | 레거시 파일 | 주요 API |
| --- | --- | --- |
| 회사소개 | `company/about.html` | `getAbout` |
| FAQ | `faq/list.html` | `getFaq` |
| 공지 | `notice/list.html` | `getNotice` |
| 개인정보처리방침 | `policy/privacy.html` | `getPrivacy` |
| 입점/제휴 문의 | `store/apply.html` | `getStoreInquiry`, `createStoreInquiry` |

## 1차 MVP 권장 순서

1. 공통 레이아웃, 헤더, 푸터, 팝업, 전역 네비게이션
2. 인증: 로그인, 회원가입, 비밀번호 찾기, 세션 처리
3. 메인, 카테고리 목록, 검색 결과
4. 상품 상세, 리뷰/QnA, 위시리스트, 장바구니 담기
5. 장바구니, 주문서, 주문 완료
6. 마이페이지 핵심: 주문 목록/상세, 배송지, 쿠폰, 위시리스트
7. 마이페이지 확장: 리뷰, 문의, 포인트, 등급, 최근 본 상품
8. 콘텐츠 화면: FAQ, 공지, 회사소개, 정책, 입점문의

## 1차 설계 원칙

- 레거시 HTML 구조를 그대로 옮기지 말고 라우트 기준으로 다시 나눈다.
- `op.saleson.js`는 그대로 재사용하지 않고 타입이 있는 API 클라이언트로 대체한다.
- 주문/결제는 화면과 API 경계만 먼저 복원하고, 실제 PG 연동은 분리된 어댑터로 둔다.
- 1차에서는 관리자, 배치, 라이선스, 서버 내 JSP 렌더링을 범위에서 제외한다.
- 레거시 DB를 그대로 노출하지 말고 도메인별 읽기/쓰기 계약을 먼저 확정한다.

## 1차 주요 리스크

- 백엔드 핵심 소스 일부가 `libs/opframework-3.4.0.jar` 등 바이너리에 숨어 있다.
- `application.properties` 계열에 DB 계정, 결제 키, 라이선스 경로가 하드코딩되어 있다.
- 주문/결제/정책/쿠폰은 사용자 화면에서 보이는 것보다 서버 규칙이 훨씬 복잡할 가능성이 높다.
- 장바구니, 주문, 마이페이지는 비회원 주문과 회원 주문 흐름이 섞여 있어 우선 설계가 필요하다.

## 2차 관리자 화면 확장 메모

DB 로그 기준으로 2차에서 우선 분석할 관리자 도메인은 아래 순서가 적절하다.

1. 상품 관리: `item/list`, `item/create`, `item/edit`, `item/review`
2. 전시 관리: `display/template`, `display/item`, `display/front-display`, `display/responsive-display`
3. 주문/클레임: `order/list`, `order/new-order`, `order/cancel`, `order/exchange`, `order/return`
4. 회원/권한: `user/customer`, `user/manager`, `user/manager-role`
5. 판매자/정산: `seller/*`, `remittance/*`
6. 운영 설정: `config/shop-config`, `config/payment-config`, `config/delivery`

현재 패키지에는 관리자 정적 자산과 로그 흔적은 있으나 실제 관리자 화면 소스가 충분하지 않으므로, 2차에 들어갈 때는 추가 자료가 필요할 가능성이 높다.

## 다음 작업 제안

- 사용자 화면 기준 Next.js 정보 구조 설계
- 도메인별 API 계약서 초안 작성
- 1차 MVP 백로그를 이슈 단위로 분해
Status: historical
Status: historical
Owner: planning archive
Last reviewed: 2026-03-24
