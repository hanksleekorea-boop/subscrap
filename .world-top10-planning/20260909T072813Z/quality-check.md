# WT10-20260909T070547Z

- 생성 시각(UTC): 2026-09-09T07:05:47Z
- 프로젝트 지문: `6c65a0f2fc83f3ca2248b2fb16554c471a059f442979a14a6ea6969d8ea2b81c`
- 상태: **PARTIAL_EVIDENCE / BLOCKED_EXTERNAL**
- 읽기 전용 원칙: 제품 코드·설정·Git·외부 서비스는 변경하지 않음

## 자동 점검

- JSON/CSV/Markdown 파일 생성: PASS
- 모든 JSON 공통 메타 필드: PASS
- Top10 고정·중복 제거: PASS
- UNKNOWN을 0점으로 계산하지 않음: PASS
- 제품 코드·Git·외부 서비스 변경: 0건
- HFP 1단계 실제 로컬 게이트: PASS (`stage-01/evidence/HFP_STAGE1_EXECUTION.json`)
- HFP 2단계 실제 로컬 게이트: PASS (`stage-02/evidence/HFP_STAGE2_EXECUTION.json`)
- HFP 3단계 실제 로컬 게이트: PASS (`stage-03/evidence/HFP_STAGE3_EXECUTION.json`)
- HFP 4단계 실제 로컬 게이트: PASS (`stage-04/evidence/HFP_STAGE4_EXECUTION.json`)
- HFP 5단계 로컬 계약 게이트: PASS (`stage-05/evidence/HFP_STAGE5_EXECUTION.json`)
- v3.3 STAGE-1/2 외부·운영 증거: 미확인
- 일부러 틀린 표본 10종: 구조 검사는 PASS, 실제 거부 실행은 별도 자동화 필요
- X10 최소치: FAIL/PARTIAL (10/800 후보, 160/1600 지표, 0/10000 경계사례)
- G0~G8 종합: PARTIAL_EVIDENCE / BLOCKED_EXTERNAL

## 실제 실행 보강

- HFP 3단계: `PUBLIC_CANDIDATE_LOCAL` — 전체 게이트 exit 0
- HFP 4단계: `PUBLIC_CANDIDATE_LOCAL` — 전체 게이트 exit 0
- HFP 5단계: `LOCAL_CONTRACT_COMPLETE_EXTERNAL_PENDING` — 로컬 계약 게이트 exit 0, 외부 증거 대기
- 두 결과는 로컬 코드·자동검사 증거이며 실제 외부 공개·실계정·실기기·사람 검증을 포함하지 않는다.
