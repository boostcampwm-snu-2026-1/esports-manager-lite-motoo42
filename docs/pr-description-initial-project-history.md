# PR Description Draft

Copy the title and body below into the GitHub pull request.

## PR Title

```text
feat: implement LCK season flow and 2026 roster systems
```

## PR Body

```md
## Summary

This PR turns the initial League of Legends esports manager prototype into a playable 2026-season MVP and prepares the project for the final-project goal: running three LCK seasons from 2026 through 2028.

The main scope includes season progression, tournament engines, MongoDB-backed career saves, offseason flow, 2026 LCK roster data, player rating balancing, and updated project handoff/planning documents.

## What Changed

### Season and Career Flow

- Added URL-based app routing and subpage routing for competitions and calendar views.
- Expanded the career loop from roster setup into date-based season progression.
- Implemented season state transitions across LCK Cup, First Stand, LCK Rounds 1-2, MSI, later LCK rounds, Asian Games, Worlds, season summary, offseason, and next-season entry.
- Added `SeasonProfile`-based season branching:
  - 2026 is an Asian Games season.
  - 2027 and 2028 are regular seasons.
- Added next-season rollover basics:
  - player age/status rollover
  - wins/losses reset
  - ELO retention
  - next-season LCK Cup activation

### Competition Engines and Dashboards

- Implemented actual progression engines and UI integration for:
  - LCK Cup
  - LCK Rounds 1-2
  - First Stand
  - MSI
  - LCK Rounds 3-4 for the 2026 Asian Games season
  - LCK Rounds 3-5 for regular seasons
  - Asian Games
  - Worlds
- Added LCK Rounds 1-2 postseason, Rounds 3-4 postseason, and regular-season Rounds 3-5 postseason flows.
- Added MSI-based Worlds bonus seed logic and Worlds 20-team entrant pool generation.
- Implemented Worlds Play-In, Group Stage, Knockout, and champion storage.
- Added competition dashboard tabs and URL subpages for overview, standings/groups, schedule, tournament/bracket views.
- Improved bracket and tournament UI for MSI and Asian Games.

### Save System

- Added Express API server and MongoDB native driver integration.
- Added career save/load support through `careerSaves`.
- Added save list loading from the career setup screen.
- Added manual save, new save, load save, first autosave, and key checkpoint autosaves.
- Added revision-based save conflict detection and 409 feedback.
- Kept local secrets out of tracked docs; actual MongoDB URI belongs in ignored local env files only.

### Offseason and Season End

- Added season summary screen showing competition results, final team record/ELO, Worlds champion, and contract-expiration context.
- Added `/offseason` route and 28-day/4-week offseason market flow.
- Added week 1 renewal/release handling.
- Added weeks 2-4 FA offer flow with AI competition.
- Added future-ready offer structure for later AI-AI and AI-user transfer negotiation expansion.
- Added offseason logs and roster validation before next-season entry.

### 2026 LCK Player Data and Rating Work

- Added 2026 LCK 10-team roster seed data for main and academy players.
- Split roster generation into:
  - `lck2026RosterSeeds`
  - `lck2026RatingOverrides`
  - `lck2026Players`
- Updated new career creation and roster builder to use the expanded 2026 LCK player pool.
- Added roster builder filters for team, position, roster tier, and search.
- Tuned memo-based player ratings from user scouting notes.
- Saved a separate stats-based rating candidate table for reference only.
- Kept the active game data on the memo-based rating table.
- Finalized academy balancing:
  - Academy TOP6 by current ability: Sharvel, Cloud, Guti, Haetae, Garden, Wayne.
  - Gen.G and Hanjin BRION CL are intentionally lower-rated academy squads.
  - T1, Dplus KIA, and Nongshim RedForce academy strength is partially reflected.
- Added rating review documents:
  - `docs/lck-2026-rating-review.md`
  - `docs/lck-2026-stat-rating-comparison.md`

### Documentation and Agent Handoff

- Updated project planning docs as the continuation guide for future Codex/agent work.
- Updated `docs/development-checklist.md` as the single official checklist.
- Updated `IMPLEMENTATION_ORDER.md` as the current sprint guide.
- Formalized the final-project priority goal: LCK 3-season operation.
- Preserved longer-term goals for a more advanced personal version and 20-season stability, but moved them behind the 3-season final-project goal.

## Current Project Status

- 1-season MVP is effectively complete.
- Final-project goal, LCK 3-season operation, is estimated around 70-78%.
- 2026 season flow is mostly closed.
- 2027 and 2028 still need full long-run connection and validation.

## Verification

Latest local verification passed:

```text
npm.cmd test
34 files passed
130 tests passed
```

```text
npm.cmd run build
passed
```

Known non-blocking warnings:

- Vite reports a chunk-size warning above 500kB after minification.
- React Router future-flag warnings appear during some integration tests.

These warnings do not currently block tests or production build.

## Notes for Review

- This is a large integration PR from a long-running feature branch.
- The PR may require conflict resolution against `main` before merge.
- The actual MongoDB connection secret is not included in tracked files.
- `.env.example` should remain placeholder-only.
- The active player ratings are memo-based, not stats-table-based.
- The stats-based rating table is kept only as a comparison/reference document.

## Next Steps After This PR

- Connect and validate the full 2027 season flow.
- Repeat and stabilize the 2028 season flow.
- Add a 3-season auto-simulation test or debug runner.
- Add season history and 3-season summary UI.
- Improve save migration/schema stability for long-term career runs.
- Continue offseason system development:
  - AI roster strength reflection
  - player preferences
  - richer bidding/negotiation
  - future transfer logic
```

## Optional Shorter PR Body

Use this if the full body feels too long for the first draft.

```md
## Summary

- Expanded the project into a playable 2026-season MVP.
- Added LCK season progression, international tournament engines, Worlds flow, season summary, offseason, and next-season rollover basics.
- Added MongoDB-backed career save/load and autosave support.
- Added 2026 LCK main/academy roster data and finalized memo-based player rating balance.
- Updated handoff and planning docs for the final-project goal: LCK 3-season operation.

## Verification

- `npm.cmd test`: 34 files passed, 130 tests passed
- `npm.cmd run build`: passed

## Notes

- Vite chunk-size warning and React Router future-flag warnings are currently non-blocking.
- This is a large integration PR and may need conflict resolution against `main`.
- Actual MongoDB secrets are not included in tracked files.

## Next Steps

- 2027 full-season connection
- 2028 repeat stability
- 3-season auto-simulation/debug runner
- season history and 3-season summary UI
- save migration/stability work
```
