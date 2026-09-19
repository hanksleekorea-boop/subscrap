# WT10-20260909T070547Z

- 생성 시각(UTC): 2026-09-09T07:05:47Z
- 프로젝트 지문: `6c65a0f2fc83f3ca2248b2fb16554c471a059f442979a14a6ea6969d8ea2b81c`
- 상태: **PARTIAL_EVIDENCE / BLOCKED_EXTERNAL**
- 읽기 전용 원칙: 제품 코드·설정·Git·외부 서비스는 변경하지 않음

## 예시 TASK-1-001

1. `npm.cmd run handoff:check` 실행, ready=true 확인.
2. Cloudflare 대상·DNS·Google project ID를 읽기 전용으로 확인.
3. 확인되지 않으면 외부 쓰기를 하지 않고 WAITING_EXTERNAL로 기록.
4. 관련 JSON 증거와 STATE/HISTORY를 갱신.
5. `npm.cmd run test:history` 재실행.
6. 실패 시 파일·자격증명을 보존하고 해당 카드만 중단.
