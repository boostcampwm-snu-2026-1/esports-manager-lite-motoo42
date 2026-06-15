# 디자인 토큰 규약 (라이트/다크 안전 가이드)

이 문서는 **새 UI 작업에서 라이트모드 버그가 반복 발생하지 않도록** 하는 최소 규약입니다.
(`docs/design-guidelines.md`의 색/테마 부분을 구체화한 실무 규칙입니다.)

## 왜 필요한가

앱은 **다크모드 우선**으로 만들어졌고, 라이트모드는 `:root[data-theme="light"]`에서 토큰 값을 바꾸는 방식입니다.
문제는 컴포넌트 CSS가 `--color-*` 토큰 대신 **다크 hex(`#0d1424`, `#111827`, `#141b2d` …)를 하드코딩**한 곳이 많다는 것.
하드코딩하면 라이트모드를 위해 **셀렉터마다 손으로 `[data-theme="light"]` 오버라이드를 추가**해야 하고,
하나라도 빠뜨리면 → **라이트모드에서 다크 박스 누수 / 흰 글씨 안 보임** = 우리가 계속 잡아온 그 버그.

## 핵심 규칙 (1줄)

> **컴포넌트 CSS에서 표면·보더·글씨·상태색은 hex 직접 쓰지 말고 토큰을 쓴다.**
> 토큰을 쓰면 라이트/다크가 자동으로 맞고, 라이트 오버라이드를 따로 쓸 일이 없다.

## 토큰 어휘

`src/shared/styles/global.css`의 `:root`(다크) / `:root[data-theme="light"]`(라이트)에 정의됨.

| 용도 | 토큰 |
|---|---|
| 페이지/스테이지 배경 | `--color-stage-bg`, `--surface-base` |
| 카드/패널 (살짝 떠 보이는 면) | `--color-card-bg`, `--surface-raised` |
| 모달/입력칸 (가장 위 면) | `--surface-overlay`, `--color-input-bg` |
| 우묵한 inset/well | `--surface-sunken` |
| 글씨 | `--text`(본문), `--muted`(보조) |
| 보더 | `--color-border`, `--color-border-subtle`, `--color-border-strong` |
| 버튼 | `--color-button-bg`, `--color-button-hover-bg`, `--color-primary-button-*` |
| 상태칩(저장/성공/위험/정보/경고/중립) | `--status-{success,danger,info,warning,neutral}-{bg,border,text}` |
| 모서리 | `--radius-sm` / `-md` / `-lg` / `-pill` |

예시:
```css
/* ❌ 라이트에서 깨짐 — 다크 hex 하드코딩 */
.my-card { background: #0d1424; border: 1px solid #253048; color: #ffffff; }

/* ✅ 라이트/다크 자동 */
.my-card {
  background: var(--surface-raised);
  border: 1px solid var(--color-border);
  color: var(--text);
}
```

## 자동 가드레일

`tests/unit/css-token-guardrail.test.ts` — 다크 표면 hex 사용 횟수를 **기준선(현재 195)** 으로 고정.
- 새 컴포넌트가 다크 hex를 추가하면 카운트가 올라 **테스트 실패** → 토큰으로 바꾸라는 신호.
- 기존 코드를 토큰으로 이관(P2)하면 카운트가 줄어듦 → 그때 테스트의 `BASELINE` 숫자를 **낮춰서** 다시 고정(래칫).
- 즉 **숫자는 줄어들 수만 있고, 절대 올라가면 안 됨.**

## 머지 전 체크리스트

- [ ] 표면/보더/글씨/상태색을 **토큰**으로 썼는가? (다크 hex 하드코딩 없음)
- [ ] **라이트·다크 둘 다** 켜서 눈으로 확인했는가? (글씨 안 보임/다크 박스 누수 없음)
- [ ] `npm run test` 의 `css token guardrail` 통과하는가?

## 예외

- **라이브 매치 화면(`.live-match-*`)** 은 의도적으로 다크 전용(실제 LCK 중계 톤). `--live-*` 토큰만 쓰고 라이트 오버라이드 없음 — 이건 버그가 아니라 설계.

## 후속(P2)

기존 ~195개 다크 hex 하드코딩을 화면 단위로 토큰 이관하고, 거대한 `:root[data-theme="light"]` 오버라이드 블록을 점진 폐기하면 이 버그 클래스 자체가 사라진다. 빅뱅 대신 화면 만질 때마다.
