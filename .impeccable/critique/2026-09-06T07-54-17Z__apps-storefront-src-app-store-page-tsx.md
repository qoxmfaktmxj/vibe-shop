---
target: MARU cinematic home
total_score: 24
max_score: 36
na_heuristics: 8
p0_count: 0
p1_count: 1
assessment: 1차 독립 평가
scope: code only
timestamp: 2026-09-06T07-54-17Z
slug: apps-storefront-src-app-store-page-tsx
---
# 1차 독립 평가

방법: 독립 평가 A nielsen_round1, 검증 B evidence_round1.

이 스냅샷은 같은 작업에서 완료된 평가 기록을 저장한 것이다. 타임스탬프는 기록 시점이다.

| 항목 | 점수 |
| --- | ---: |
| 시스템 상태 표시 | 3 |
| 현실과의 일치 | 2 |
| 사용자 통제와 자유 | 3 |
| 일관성과 표준 | 3 |
| 오류 예방 | 3 |
| 기억보다 인식 | 3 |
| 유연성과 효율 | 2 |
| 미적이고 간결한 디자인 | N/A |
| 오류 인식과 복구 | 3 |
| 도움말과 안내 | 2 |
| 합계 | 24/36 |

배너와 별도 상품의 가격 혼합, 추천 상품으로의 긴 이동, 서비스 도움말 미연결, 모션 감소 설정의 화살표 방향 문제가 확인됐다. 미적 완성도는 실제 화면 근거가 없어 제외했다.

평가 범위: code only. 정적 SSR은 클라이언트 hydration이 없다. 따라서 실제 모션, 거래, 성능 검증의 대체 근거가 아니다. 4점이 가장 높은 내부 품질 척도이며 NN/G의 공식 점수가 아니다.

상세한 근거와 대표 사용자, 적용한 수정, 인지부하 및 남은 작업은 docs/landing-design-review-2026-09-06.md에 있다.

Questions skipped: 사용자가 구현과 최소 두 차례 검토를 이미 요청했고, 이번 수정은 그 범위 안이다.
