# WT10-20260909T070547Z

- 생성 시각(UTC): 2026-09-09T07:05:47Z
- 프로젝트 지문: `6c65a0f2fc83f3ca2248b2fb16554c471a059f442979a14a6ea6969d8ea2b81c`
- 상태: **PARTIAL_EVIDENCE / BLOCKED_EXTERNAL**
- 읽기 전용 원칙: 제품 코드·설정·Git·외부 서비스는 변경하지 않음

## 핵심 데이터

Transaction, SubscriptionCandidate, Evidence, SavingsRecord, UserProfile, AccountData를 소유자·생명주기·삭제 범위와 함께 관리한다. 원문은 기본 저장하지 않고 계정 데이터는 AES-GCM 암호화 상자 계약을 따른다.

## API

- GET /auth/google/start, /auth/google/callback, /auth/session, /auth/logout
- GET/PUT /v1/account/profile
- GET/PUT/DELETE /v1/account/data (버전 충돌 409, 500,000 UTF-8 bytes 제한)
- POST /v1/auth/logout

운영 Worker·D1·키 등록은 외부 증거 전까지 미배포다.
