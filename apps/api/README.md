# api

`apps/api`는 storefront가 사용하는 백엔드 API 서버다.  
현재는 카탈로그 조회와 주문 생성 흐름에 필요한 최소 기능만 들어 있다.

## 사용 기술

- Spring Boot 4
- Java 21
- Spring Web MVC
- Spring Data JPA
- Flyway
- PostgreSQL

## 현재 제공 기능

- 홈 전시 데이터 조회
- 카테고리 목록 조회
- 상품 목록 조회
- 상품 상세 조회
- 주문 금액 preview
- 주문 생성
- 주문 조회

현재 단계에서는 주문 상태 머신, 결제 승인, 재고 차감, 취소/반품/교환은 아직 구현하지 않았다.

## 실행 방법

루트에서 실행:

```bash
npm run dev:api
```

앱 디렉터리에서 직접 실행:

```bash
./gradlew bootRun
```

Windows:

```bash
gradlew.bat bootRun
```

기본 포트는 `8080`이다.

## 환경 변수

예시 파일:

- `.env.example`

주요 값:

- `APP_PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`
- `CORS_ALLOWED_ORIGINS`

## DB와 마이그레이션

- Flyway 마이그레이션 파일: `src/main/resources/db/migration`
- 현재 기본 스키마는 카테고리, 상품, 주문, 주문라인 기준이다.
- seed 데이터로 카테고리 3개와 상품 6개가 들어간다.

## 테스트

```bash
npm run test:api
```

현재는 기본 애플리케이션 기동과 설정 기준의 테스트가 중심이다.  
Postgres 기반 통합 테스트와 서비스 단위 테스트는 이후 더 보강할 계획이다.

## 관련 문서

- 루트 README: `../../README.md`
- API 계약: `../../docs/api-contract-v1.md`
- ERD 초안: `../../docs/erd-v1.md`
