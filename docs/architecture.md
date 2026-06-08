# Architecture Notes

이 문서는 발표용 설명서가 아니라, 새 기능을 추가할 때 파일 위치와 책임을 결정하기 위한 작업 기준이다.

## 서버 레이어 기준

서버 API는 `Controller -> Service -> Repository -> DB` 흐름을 따른다.

```text
HTTP request
  -> route
  -> controller
  -> service
  -> repository
  -> db
```

각 레이어의 책임:

- `routes`: URL과 HTTP method를 controller에 연결한다.
- `controllers`: request 파싱, params/query/body 추출, HTTP status 결정만 담당한다.
- `services`: 저장 생성/수정/삭제 같은 유스케이스와 비즈니스 규칙을 담당한다.
- `repositories`: MongoDB collection, index, query, insert/update/delete만 담당한다.
- `db`: MongoDB client와 database connection만 담당한다.
- `validators`: 외부 입력의 최소 유효성 검증과 id 파싱을 담당한다.
- `errors`: HTTP status를 가진 공통 에러 타입을 둔다.

새 API를 추가할 때는 controller에서 MongoDB를 직접 import하지 않는다. DB 접근이 필요하면 repository 함수를 만들고, service가 그 repository를 호출한다.

## 서버 파일 추가 기준

새 저장 API가 필요할 때:

1. route 파일에 URL을 추가한다.
2. controller에서 요청 값을 파싱한다.
3. service에 실제 유스케이스 함수를 만든다.
4. MongoDB query가 필요하면 repository에 추가한다.
5. 입력 검증이 여러 controller에서 재사용되면 validator로 분리한다.

예시:

```text
server/routes/careerSavesRoutes.ts
server/controllers/careerSavesController.ts
server/services/careerSavesService.ts
server/repositories/careerSavesRepository.ts
server/db/mongo.ts
```

`server/index.ts`에는 새 API 로직을 넣지 않는다. 이 파일은 서버 실행과 종료만 담당한다.

## 도메인 로직과 DB 로직 분리

게임 규칙은 `src/domain`에 둔다.

예시:

- 시즌 진행
- 대회 포맷
- 경기 시뮬레이션
- 선수 능력치 계산
- 스토브리그 계약 판단

DB 저장 형태, MongoDB query, ObjectId 처리, index 생성은 `server` 레이어에 둔다.

같은 기능에서 둘 다 필요하면:

- 순수 게임 규칙은 `src/domain`
- API 유스케이스 조립은 `server/services`
- DB 읽기/쓰기는 `server/repositories`

## 프론트 앱 레이어 기준

`src/app/App.tsx`는 provider/router 조립만 담당한다.

현재 기준:

- `App.tsx`는 provider와 global shell 조립만 담당한다.
- route 렌더링은 별도 route renderer로 분리한다.
- 자동 저장, 진행 오버레이, URL 동기화, 대회 선택 같은 흐름은 custom hook으로 분리한다.
- 특정 대회 모달처럼 도메인 의존성이 강한 UI는 하위 컴포넌트로 내린다.

적용된 분리:

```text
src/app/App.tsx
src/app/AppContent.tsx
src/app/AppRouteRenderer.tsx
src/app/autoSaveCheckpoint.ts
src/app/progressOverlay.ts
src/app/hooks/useAppNavigation.ts
src/app/hooks/useAsianGamesDecision.ts
src/app/hooks/useAutoSaveController.tsx
src/app/hooks/useCareerProgressController.ts
src/app/hooks/useRouteSynchronization.ts
src/app/modals/AsianGamesDecisionModal.tsx
```

`AppContent`는 `AppShell`에 필요한 global flow 조립만 담당한다. 새 전역 흐름을 추가할 때는 먼저 custom hook이나 하위 component로 둘 수 있는지 확인한다.

## Reducer 분리 기준

`GameProvider`는 유지하되, reducer 내부 action handler는 기능별 파일로 분리한다. 새 action을 추가할 때는 먼저 action type을 `gameActions.ts`에 추가하고, 해당 기능 handler에 처리 로직을 넣는다.

현재 구조:

```text
src/app/state/gameState.ts
src/app/state/gameReducer.ts
src/app/state/gameActions.ts
src/app/state/gameActionCreators.ts
src/app/state/careerHandlers.ts
src/app/state/routeHandlers.ts
src/app/state/rosterHandlers.ts
src/app/state/offseasonHandlers.ts
src/app/state/weeklyPlanHandlers.ts
src/app/state/seasonProgressHandlers.ts
```

`src/app/gameReducer.ts`는 compatibility entry다. 새 코드는 `src/app/state`를 우선 import하고, 기존 import가 남아 있어도 깨지지 않게 유지한다.

handler 배치 기준:

- 커리어 생성/불러오기: `careerHandlers.ts`
- URL route와 대회 선택: `routeHandlers.ts`
- 로스터 빌더와 시즌 중 선발 변경: `rosterHandlers.ts`
- 전략/훈련 변경: `weeklyPlanHandlers.ts`
- 시즌 요약, 스토브리그, 다음 시즌 진입: `offseasonHandlers.ts`
- 날짜 진행, 연습 경기, Asian Games 선택: `seasonProgressHandlers.ts`

action type 이름과 payload shape는 저장 데이터나 테스트와 맞물릴 수 있으므로 함부로 바꾸지 않는다. dispatch 호출을 새로 작성할 때는 가능하면 `gameActions` helper를 사용한다.

## Context와 리렌더링 기준

`GameProvider`는 React 내장 `useSyncExternalStore` 기반 store를 제공한다. reducer/action shape는 유지하되, 컴포넌트는 selector로 필요한 state 조각만 구독한다.

사용 기준:

- state 일부만 읽으면 `useGameSelector((state) => state.someField)`를 사용한다.
- 전체 state가 꼭 필요할 때만 compatibility hook인 `useGameState()`를 사용한다.
- dispatch만 필요하면 `useGameDispatch()`를 사용한다.
- 기존 호출 호환이 필요하면 `useGame()`을 사용할 수 있지만, 새 컴포넌트에서는 분리 hook을 우선한다.
- 상태관리 라이브러리 추가는 당장 하지 않는다.

selector는 primitive 값이나 기존 object reference를 그대로 반환하도록 작성한다. 매 호출마다 새 object/array를 만드는 selector는 불필요한 리렌더링을 만들 수 있으므로 page 내부에서 여러 selector로 나누거나 memoized feature component로 넘긴다.

## 선수 도메인 기준

스토브리그, 성장, 은퇴, 신인 생성이 커질 예정이므로 선수 관련 규칙은 `src/domain/players`로 모은다.

현재 기준:

```text
src/domain/players/playerStatus.ts
src/domain/players/playerContracts.ts
src/domain/players/playerMarketValue.ts
src/domain/players/playerLifecycle.ts
```

기존 `src/domain/player-status`와 `src/domain/roster` export는 compatibility를 유지한다. 새 선수 규칙은 `src/domain/players`에 먼저 추가하고, 기존 경로가 필요하면 re-export나 얇은 wrapper로 연결한다.

선수 카드 UI나 화면 필터는 `features`에 두고, 능력치/성장/계약가치/시장가치/시즌 롤오버 계산은 `domain/players`에 둔다. 실제 방출, 은퇴, AI 로스터 재구성처럼 팀 상태를 크게 바꾸는 규칙은 스토브리그 고도화 작업에서 별도 테스트와 함께 붙인다.
