# MOBA Esports Manager Lite

League of Legends e스포츠 팀 운영 매니지먼트 시뮬레이션 게임입니다.

사용자는 LCK 팀의 감독/프런트가 되어 프리시즌 스토브리그, 로스터 구성, 1군/2군 관리, 계약 협상, 훈련, 전략 선택, 경기 진행, 대회 일정 관리, 시즌 결산을 진행합니다. Football Manager식 매니지먼트 흐름과 LoL e스포츠 시즌 구조를 결합해 LCK와 국제대회 흐름을 게임 형태로 재구성하는 프로젝트입니다.

## 게임 플레이

▶ 바로 플레이: **[여기서 플레이하기](https://moba-esports-manager-lite-beta.onrender.com/)**

LCK 팀의 감독이 되어 스토브리그부터 한 시즌을 직접 운영해볼 수 있습니다.

- **즐기는 법**: 시작 화면에서 LCK 10개 팀 중 하나를 고르고, 1군 5인 선발·계약·훈련·전략을 설정한 뒤 "진행"을 눌러 경기와 대회를 치릅니다. 라이브 매치 화면에서 밴픽과 문자중계로 경기를 관전할 수 있습니다.
- **시즌 데이터 저장**: 진행 상황은 MongoDB에 저장됩니다. 수동 저장/불러오기와 자동 저장을 지원하고, 브라우저별로 저장 공간이 자동 분리되어 같은 링크에서도 개인 세이브가 섞이지 않습니다.
- **가이드**: 게임 안에서 화면별 단계 가이드를 제공해, 홈·로스터·스토브리그·대회 등에서 무엇을 하면 되는지 바로 확인할 수 있습니다.

Render 무료 플랜 특성상 처음 접속할 때 서버가 잠들어 있을 수 있습니다. 별도로 전달받은 링크 접속 후 화면이 바로 뜨지 않으면 30초 정도 기다린 뒤 새로고침합니다.

현재 권장 환경은 PC/노트북 Chrome 또는 Edge, 1280x720 이상 가로 화면입니다. 모바일 세로 화면과 너무 작은 화면은 정식 지원하지 않습니다.

## 프로젝트 목표

- LCK 기반 e스포츠 매니지먼트 게임 프로토타입 구현
- 2026, 2027, 2028 LCK 3시즌이 실제로 진행되는 커리어 루프 완성
- 스토브리그, 로스터, 선수 상태, 전략/훈련, 경기, 대회, 저장 시스템 연결
- AI Agent와 협업하는 개발 워크플로우와 체크리스트 정리
- 기말 프로젝트 이후 개인 장기 목표로 20시즌 안정 작동까지 확장

## 주요 기능

- LCK 10개 팀 선택 기반 커리어 시작
- 2026 프리시즌 28일/4주 스토브리그
- 1군 선발/후보, 2군 아카데미, 계약 현황 분리 관리
- 콜업/콜다운과 선발 5인 드래그 앤 드롭 교체
- 계약 타입: 1년, 2년, 1+1년
- FA/재계약 협상, 제안 역할, 영입 확정/취소, AI 계약 경쟁
- 선수 상태 관리: 폼, 피로도, 5단계 사기
- 주간 전략과 훈련 강도 설정
- 밴픽 점수 기반 경기 시뮬레이션
- 실제 URL 기반 화면 이동과 대회/캘린더/로스터 하위 페이지
- LCK Cup, First Stand, LCK Rounds 1-2, MSI 진행
- 2026 Asian Games 시즌 LCK Rounds 3-4, 일반 시즌 LCK Rounds 3-5 진행
- Asian Games 대표 선발, 플레이 여부 선택, 메달/병역 보상
- Worlds 20팀 참가 풀, Play-In, Group Stage, Knockout, 우승팀 저장
- 시즌 요약, 3시즌 히스토리, 오프시즌 결과 기록
- MongoDB 기반 수동 저장, 새 저장, 불러오기, 자동 저장, 저장 충돌 감지
- Render 단일 링크 베타 배포 구조

## 현재 구현 상태

현재 프로젝트는 1시즌 MVP를 넘어, 기말 프로젝트 목표인 `LCK 3시즌 작동`을 달성한 상태입니다.

검증 기준:

- 2026 아시안게임 시즌 완주
- 2027 일반 시즌 완주
- 2028 일반 시즌 완주
- 2028 Worlds 종료 후 시즌 요약/스토브리그 도달
- 2029 LCK Cup 진입 직전 상태까지 debug runner로 확인

최근 베타 전 재정비:

- 리렌더링/route 왕복 버그 수정
- 2026 시작 전 프리시즌 스토브리그 구조 변경
- 1군/2군 로스터 분리와 콜업/콜다운 구조 추가
- LCK 10개 팀 선택 기반 커리어 시작 화면
- Ghost 포지션 SUP 수정
- 로스터 조작 자체로 사기가 변하지 않도록 수정
- 스토브리그 계약 제안 역할, 영입 확정 대기, 예산/포지션 제한 추가
- 데이터 저장 전용 메뉴와 그룹형 한글 사이드바 정리
- 2026 LCK 1군 선수 사진 1차 적용
- 모바일 미지원 안내와 팀 밸런싱 1차 적용

## 기술 스택

- React
- TypeScript
- Vite
- React Router
- Express
- MongoDB Atlas
- Vitest
- Playwright
- @dnd-kit/core

## 로컬 실행

Node.js 20.19 이상을 권장합니다.

```bash
npm.cmd install
```

MongoDB 연결에는 Git에 커밋하지 않는 `.env.local`이 필요합니다. 공개 가능한 변수 예시는 [.env.example](.env.example)을 참고합니다.

개발 중에는 서버와 클라이언트를 각각 실행합니다.

```bash
npm.cmd run dev:server
npm.cmd run dev:client
```

기본 로컬 주소:

```text
http://127.0.0.1:5173/
http://127.0.0.1:4000/api/health
```

## 배포

production에서는 Express 서버 하나가 Vite 빌드 결과물과 `/api` 저장 API를 함께 제공합니다.

Render Web Service 기준 명령:

```bash
npm install --include=dev && npm run build
npm run start
```

필수 환경변수:

```text
NODE_ENV=production
NODE_VERSION=20.19.0
MONGODB_URI=실제 MongoDB Atlas URI
MONGODB_DB_NAME=moba_esports_manager_beta
VITE_API_BASE_URL=/api
```

주의:

- 실제 `MONGODB_URI`는 GitHub, PR, 문서, 채팅에 올리지 않습니다.
- 베타 배포에서는 `VITE_SAVE_OWNER_ID`를 비워두면 브라우저별 저장 공간이 자동으로 분리됩니다.
- 자세한 배포 절차는 [docs/beta-deploy-guide.md](docs/beta-deploy-guide.md)를 참고합니다.

## 검증 명령

```bash
npm.cmd run build
npm.cmd test
npm.cmd run server:check
npm.cmd run test:system
npm.cmd run test:acceptance
```

Playwright Chromium이 없다는 오류가 나면:

```bash
npx.cmd playwright install chromium
```

## 개발 관리 방식

```text
main
└── dev
    └── feature/*
```

- `main`: 제출 및 안정 버전
- `dev`: 개발 통합 브랜치
- `feature/*`: 기능별 작업 브랜치

현재 베타 배포용 개인 저장소에도 같은 커밋을 push해 Render 배포를 갱신하고 있습니다.

## 참고 문서

각 항목을 클릭하면 GitHub 저장소의 해당 문서로 바로 이동합니다.

- [docs/overview.md](docs/overview.md) — 프로젝트 전체 개요와 핵심 흐름
- [docs/architecture.md](docs/architecture.md) — 폴더 구조와 도메인/기능 레이어 설계
- [docs/match-simulation.md](docs/match-simulation.md) — 밴픽·경기 결과 시뮬레이션 로직
- [docs/data-storage.md](docs/data-storage.md) — MongoDB 저장/불러오기/자동 저장 구조
- [docs/season-calendar.md](docs/season-calendar.md) — 시즌·대회 일정과 캘린더 구조
- [docs/players-contracts.md](docs/players-contracts.md) — 선수 능력치와 계약/스토브리그 모델
- [docs/design-guidelines.md](docs/design-guidelines.md) — UI 디자인 가이드라인과 토큰 사용 규칙
- [docs/development-checklist.md](docs/development-checklist.md) — 단계별 개발 체크리스트
- [docs/beta-deploy-guide.md](docs/beta-deploy-guide.md) — Render 베타 배포 가이드
- [IMPLEMENTATION_ORDER.md](IMPLEMENTATION_ORDER.md) — 기능 구현 순서 정리
- [AGENT_COLLABORATION.md](AGENT_COLLABORATION.md) — AI 에이전트 협업 운영 규칙
