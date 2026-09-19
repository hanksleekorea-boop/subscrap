# WT10-20260909T070547Z

- 생성 시각(UTC): 2026-09-09T07:05:47Z
- 프로젝트 지문: `6c65a0f2fc83f3ca2248b2fb16554c471a059f442979a14a6ea6969d8ea2b81c`
- 상태: **PARTIAL_EVIDENCE / BLOCKED_EXTERNAL**
- 읽기 전용 원칙: 제품 코드·설정·Git·외부 서비스는 변경하지 않음

## 결론

현재 Subscrap은 로컬 우선·개인정보·파일/이메일 기반 구독 탐색과 가계부 피벗의 기반이 잘 갖춰져 있다. 그러나 Cloudflare 공개 전환, 운영 Google OAuth, D1·키, DNS, 실제 기기·사람·광고·법률 증거가 없어 **완전한 상용화 또는 Cloudflare-only 상태는 아니다**.

## Top10 비교

가장 직접적인 비교군은 Rocket Money·Monarch Money이며, 나머지 8개는 반복결제·예산·지출·수동 추적의 우수 관행 비교군이다. Subscrap은 개인정보 통제와 원문 최소화가 강점이고, 선두 대비 연결 생태계·운영 성숙도·실사용 증거가 약점이다.

## 즉시 실행 순서

1. Cloudflare 대상 Pages/Workers 프로젝트와 zone/DNS 권한을 action-time에 확인한다.
2. Google Cloud `wesaver`의 실제 project ID와 OAuth client/redirect URI를 확인한다.
3. D1 migration·USER_DATA_ENCRYPTION_KEY·백업·롤백을 dry-run 후 실행한다.
4. 동일 출처 정적 번들을 Pages에 배포하고 HTTP/지문을 재검증한다.
5. 유휴 Android 한 대에서 핵심 흐름을 수동 확인한다.
6. 광고·동의·법률·접근성·지원 실증을 완료한다.

## 상태

분석 산출물은 생성되었지만 v3.2 X10_COMPLETE나 G8 COMPLETE는 선언하지 않는다.
