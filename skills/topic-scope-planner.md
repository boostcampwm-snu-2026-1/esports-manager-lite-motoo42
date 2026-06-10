---
name: topic-scope-planner
description: Project-local skill for managing product scope. Use when deciding MVP boundaries, deferring features, comparing implementation order, or preventing the LoL esports manager game from becoming too broad.
---

# Topic Scope Planner

Use this skill when project scope or implementation priority is unclear.

## Current Topic

League of Legends e스포츠 팀 매니지먼트 시뮬레이션 게임

The topic is already selected. This skill now focuses on scope control.

## Inputs

1. Read `../README.md`.
2. Read `../docs/development-checklist.md`.
3. Read `../IMPLEMENTATION_ORDER.md`.
4. Read `../docs/overview.md` when project scope context is needed.
5. Read `../docs/mvp-scope.md` when MVP boundaries are involved.
6. Read `../docs/open-questions.md` when unresolved product choices matter.

## Workflow

1. Restate the current goal: 75%, 1-season MVP, v1, or long-term version.
2. Identify what is already implemented.
3. Separate the requested feature into:
   - required now
   - useful soon
   - future expansion
4. Check whether it affects season flow, storage, UI, or simulation balance.
5. Recommend the smallest implementation that preserves future expansion.
6. Convert the scope into checklist items or GitHub issue candidates.

## Scope Rules

- Prefer a complete season loop over deep single-feature polish.
- Prefer playable feedback over hidden complexity.
- Keep advanced champion/bandraft logic extensible but not blocking.
- Treat MongoDB as a storage milestone, not a reason to pause all game logic.
- Keep UI decisions aligned with the FM-style 16:9 frame.

## Quality Check

- The next task is small enough to implement and test.
- The user-facing value is clear.
- Deferred items are named.
- The implementation order does not break existing flows.
