# esports-manager-lite-motoo42

League of Legends e스포츠 팀 매니지먼트 시뮬레이션 게임입니다.

사용자는 LCK 팀의 감독/프런트가 되어 스토브리그, 로스터 구성, 계약, 훈련, 전략 선택, 경기 진행, 대회 일정 관리, 포스트시즌 진출 등을 관리합니다. 스포츠 매니지먼트 게임 시스템과 LoL e스포츠 구조를 결합한 프로젝트입니다.

## 프로젝트 목표

- LCK 기반 e스포츠 매니지먼트 게임 프로토타입 구현
- 실제 시즌 흐름과 유사한 대회 구조 설계
- 로스터, 계약, 선수 상태, 전략, 훈련, 밴픽 요소를 점진적으로 확장
- AI Agent와 협업하는 개발 워크플로우 정리
- 3주 이후에도 유지보수와 기능 확장이 가능한 구조 만들기

## 주요 기능

- 커리어 생성
- 스토브리그와 로스터 확정
- 1군/2군 기반 선수 관리
- 계약 타입 관리: 1년, 2년, 1+1년
- 선수 상태 관리: 폼, 피로도, 사기
- 주간 전략과 훈련 강도 설정
- 선발 5인 드래그 앤 드롭 교체
- LCK Cup 진행
- LCK Rounds 1-2 정규시즌 일정 생성 및 진행
- 대회 순위표, 일정/결과, 토너먼트 UI
- 밴픽 점수 기반 경기 시뮬레이션 초안

## 기술 스택

- React
- TypeScript
- Vite
- Vitest
- Playwright
- @dnd-kit/core

## 개발 관리 방식


```text
main
└── dev
    └── feature/*
```

- `main`: 제출 및 안정 버전
- `dev`: 개발 통합 브랜치
- `feature/*`: 기능별 작업 브랜치

## 현재 상태

지금까지 구현된 주요 내용:

- React / Vite / TypeScript 기반 프로젝트 초기 구조
- Vitest, Playwright 기반 테스트 환경
- CareerSave, SeasonState, CompetitionState 등 핵심 상태 타입
- 2026시즌을 기준으로 한 시즌 흐름 초안
- 스토브리그 이후 LCK Cup이 활성화되는 구조
- LCK 10개 팀 고정 데이터와 실제 팀명 반영
- LCK Cup 현실 기반 간소화 포맷
- LCK Rounds 1-2 정규시즌 일정 생성 및 진행 흐름
- 날짜 진행 버튼 / 경기일 플레이 버튼 전환 구조
- 대회 순위표, 일정/결과, 토너먼트 브래킷 UI
- FM 스타일의 16:9 고정형 메인 허브 UI
- 시즌 캘린더 로드맵 / 달력형 화면 기반
- 로스터 관리 화면
- 선발 5인 드래그 앤 드롭 교체
- 선수 상태 관리: 폼, 피로도, 사기
- FM식 단계형 사기 표시 UI
- 주간 전략과 훈련 강도 설정 구조
- 전략 스타일 간 상성 구조
- 밴픽 점수 기반 경기 시뮬레이션 초안
- 주요 도메인 로직 단위 테스트
- UI 스크린샷 기반 검증 흐름

이후 구현 예정:

- LCK Rounds 1-2 포스트시즌 경기 진행
- First Stand
- MSI
- Asian Games
- Worlds
- 시즌 종료와 다음 시즌 전환
- 저장/불러오기
- MongoDB 연동을 통한 데이터 저장 구조
- 선수 데이터 확장과 밸런싱
- 밴픽/챔피언/메타 시스템 고도화

## 참고 문서

- `IMPLEMENTATION_ORDER.md`
- `docs/development-checklist.md`
- `docs/overview.md`
- `docs/mvp-scope.md`
- `docs/season-calendar.md`
