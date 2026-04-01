<!-- Generated: 2026-03-30 | Updated: 2026-03-30 -->

# vibe-shop

## Purpose
Korean e-commerce monorepo: Next.js 16 storefront + Spring Boot 4 API + PostgreSQL. Includes customer-facing shop, admin dashboard, and shared contract types. Demo-ready with 300 product images across kitchen/living/wellness categories.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Root workspace scripts: dev, build, QA, E2E |
| `compose.yaml` | Docker Compose for PostgreSQL 17 (port 55432) |
| `compose.deploy.yaml` | Production deployment compose |
| `playwright.config.js` | E2E test configuration |
| `redesign_shop.pen` | UI design file (Pencil format) |
| `.env.deploy.example` | Deployment env template |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `apps/` | Application code — API and Storefront (see `apps/AGENTS.md`) |
| `docs/` | Design docs, ERD, demo runbooks (see `docs/AGENTS.md`) |
| `packages/` | Shared TypeScript contract types (see `packages/AGENTS.md`) |
| `scripts/` | Build, dev, and demo utility scripts (see `scripts/AGENTS.md`) |
| `tests/` | E2E Playwright test suites (see `tests/AGENTS.md`) |
| `images/` | Project screenshots for README |

## For AI Agents

### Working In This Directory
- Run `npm run infra:up` to start PostgreSQL before any dev work
- Use `npm run dev` to start both API (port 8081) and storefront (port 3200) concurrently
- Run `npm run qa` for full lint + typecheck + build + API tests
- Run `npm run qa:e2e` for browser-based end-to-end tests
- Node >= 22, npm >= 10, Java 21 required

### Testing Requirements
- `npm run qa` must pass before any PR
- E2E tests via Playwright in `tests/e2e/`
- API unit tests via Gradle: `npm run test:api`

### Common Patterns
- Frontend communicates with backend only through API client layer (`client-api.ts`, `server-api.ts`)
- Shared types live in `packages/contracts/` — never duplicate type definitions
- DB schema changes require explicit Flyway migrations (`V{n}__description.sql`)

## Dependencies

### External
- Node.js 22+, npm 10+
- Java 21 (Gradle toolchain)
- Docker (for PostgreSQL 17)
- Playwright (E2E testing)

---

# AGENTS.md

이 저장소의 기본 개발 방식은 `신규 구축` 기준이다.
레거시 쇼핑몰은 참고 자료로만 사용하고, 구현은 새 구조와 새 코드 기준으로 진행한다.

## 프로젝트 방향

- 1차 범위는 사용자 화면이다.
- 2차 범위는 관리자 화면이다.
- 프런트엔드와 백엔드는 분리해서 개발한다.
- 사용자 화면과 관리자 화면은 각각 독립 프런트엔드 앱으로 본다.
- 백엔드는 API 중심으로 설계한다.
- DB는 신규 설계 기준으로 `PostgreSQL`을 우선 검토한다.
- 레거시 DB 스키마와 API는 참고만 하고 그대로 복제하지 않는다.

## 기본 기술 방향

- 사용자 프런트엔드: `Next.js + React + TypeScript`
- 관리자 프런트엔드: `Next.js + React + TypeScript`
- 백엔드: `Spring Boot + Java`
- 데이터베이스: `PostgreSQL`
- 테스트: 단위 테스트, API 테스트, 브라우저 기반 E2E 테스트

## 권장 구조

- `apps/storefront`: 사용자 화면과 `/admin` 경로를 함께 제공하는 단일 프런트엔드
- `apps/api`: 백엔드 API
- `tests/e2e`: 브라우저 테스트와 핵심 E2E 시나리오
- `docs`: 분석 문서, 설계 문서, 작업 메모

## 역할 정의

이 프로젝트는 아래 4개 역할이 협업하는 방식으로 진행한다고 가정한다.

### 1. PM

- 요구사항을 기능 단위로 정리한다.
- 작업 범위와 우선순위를 정한다.
- 각 기능의 완료 기준과 수용 기준을 명확히 한다.
- QA 결과를 검토한 뒤 최종 승인 여부를 판단한다.
- 사용자에게 전달하는 최종 상태 보고는 PM 승인 이후에만 한다.

### 2. 프런트엔드 개발자

- 화면 구현, 상태 관리, 사용자 상호작용, 접근성, 반응형 UI를 담당한다.
- 백엔드 계약 없이 임의로 데이터를 가정해 고정 구현하지 않는다.
- API 계약이 미완성이면 mock 또는 fixture 사용 여부를 명시한다.
- 구현 후 자체 동작 확인을 먼저 수행한다.

### 3. 백엔드 개발자

- 도메인 모델, API, 인증, 권한, 데이터 저장, 외부 연동 경계를 담당한다.
- 스키마 변경은 명시적인 마이그레이션 기준으로 관리한다.
- 프런트엔드가 사용할 요청/응답 계약을 문서화한다.
- 구현 후 단위 테스트와 API 테스트를 우선 수행한다.

### 4. QA

- 별도 앱이나 별도 폴더 소유자가 아니라 `역할`로 본다.
- 기능 전체 흐름을 기준으로 테스트한다.
- 실제 브라우저 테스트를 포함해 회귀 여부를 확인한다.
- 통과/실패, 재현 절차, 잔여 리스크를 PM에게 보고한다.
- QA가 확인하지 않은 작업은 완료로 보지 않는다.

## 작업 흐름

모든 기능 작업은 아래 순서를 기본으로 따른다.

1. PM이 요구사항, 범위, 완료 기준을 정리한다.
2. 프런트엔드와 백엔드가 필요한 계약과 작업 범위를 나눈다.
3. 프런트엔드와 백엔드가 구현 및 자체 검증을 수행한다.
4. QA가 기능 테스트와 브라우저 테스트를 수행한다.
5. QA가 결과를 PM에게 보고한다.
6. PM이 최종 승인한 뒤에만 사용자에게 완료 보고를 한다.

## 완료 기준

다음 조건을 만족해야 기능 완료로 본다.

- 요구사항 범위가 구현되어 있다.
- 프런트엔드와 백엔드 계약이 서로 일치한다.
- 필요한 테스트가 통과한다.
- QA가 실제 브라우저 검증을 포함해 확인했다.
- 남은 리스크가 있으면 PM 보고에 포함되어 있다.
- PM이 최종 승인했다.

## 구현 원칙

- 큰 변경보다 작은 단위 변경을 우선한다.
- 기존 코드와 실행 흐름을 먼저 확인하고 추측하지 않는다.
- 화면 구현과 API 구현을 섞어 두지 않는다.
- 프런트엔드는 API 클라이언트 계층을 통해서만 백엔드와 통신한다.
- 공통 타입과 계약은 중복 정의하지 않는다.
- 결제, 정산, 배치, 관리자 권한 같은 고위험 영역은 단계적으로 옮긴다.

## QA 원칙

- QA 전용 폴더를 따로 만들 필요는 없다.
- 단, 브라우저 테스트 코드와 E2E 시나리오는 저장소에 남긴다.
- 수동 검증만으로 끝내지 말고 가능한 핵심 시나리오는 자동화한다.
- QA 결과는 PM이 검토할 수 있는 형태로 남긴다.

## 보고 원칙

- 구현 완료와 승인 완료를 같은 의미로 쓰지 않는다.
- 개발자가 "구현 완료"라고 보고해도, QA와 PM 승인 전에는 "최종 완료"가 아니다.
- 사용자에게는 PM 승인 이후 상태만 보고한다.

