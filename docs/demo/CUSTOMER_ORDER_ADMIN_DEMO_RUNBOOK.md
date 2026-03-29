# CUSTOMER ORDER ADMIN DEMO

## 목적

이 데모는 1분 안쪽에서 아래 흐름이 한 번에 이어진다는 점을 보여주기 위한 시나리오입니다.

1. 고객이 메인 화면에서 진입한다.
2. 고객이 회원가입을 한다.
3. 고객이 다시 로그인한다.
4. 고객이 상품을 장바구니에 담고 주문한다.
5. 관리자가 로그인해서 방금 주문을 확인한다.
6. 관리자가 같은 콘솔에서 신규 상품을 추가 등록한다.

핵심 메시지는 하나입니다.

`구매 흐름과 운영 흐름이 같은 제품 안에서 자연스럽게 이어진다.`

## 기본 주소

- storefront: `http://127.0.0.1:4100`
- api health: `http://127.0.0.1:8180/actuator/health`

## 관리자 계정

- email: `admin@maru.local`
- password: `admin1234!`

## 실행

데모 스택 기동:

```powershell
node scripts/start-demo-stack.mjs
```

시나리오 미리보기:

```powershell
node scripts/customer-order-admin-demo.playwright.cjs
```

실제 녹화본 생성:

```powershell
node scripts/customer-order-admin-demo-record.cjs
```

## 산출물

녹화 스크립트는 아래 경로에 결과를 남깁니다.

- `output/demo/video`
- `output/demo/review-frames-2s`
- `output/demo/final`

가능하면 `vibe-rec/output/tools/ffmpeg/.../ffmpeg.exe`를 재사용해서 `mp4`까지 같이 생성합니다.

## 시나리오 타이밍 가이드

### 0s-6s

- 메인 화면 진입
- 배너와 카테고리 노출 확인

### 6s-18s

- 회원가입
- 계정 화면 진입
- 로그아웃

### 18s-28s

- 같은 계정으로 로그인

### 28s-42s

- 상품 상세 진입
- 장바구니 담기
- 장바구니에서 체크아웃 이동

### 42s-52s

- 배송 정보 입력
- 주문 완료

### 52s-60s

- 관리자 로그인
- 주문 목록 확인
- 신규 상품 추가

