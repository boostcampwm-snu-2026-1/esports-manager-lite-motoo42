import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const cssPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../src/shared/styles/global.css",
);
const css = readFileSync(cssPath, "utf8");

// Dark surface / base hexes. Light mode breaks when a component hardcodes one of
// these instead of using the --surface-* / --color-* / --status-* tokens: the
// token block swaps values per theme automatically, but a hardcoded hex needs a
// hand-written :root[data-theme="light"] override that is easy to forget — that
// omission is the source of the recurring light-mode bugs. See docs/design-tokens.md.
const DARK_SURFACE_HEXES = [
  "#090d17",
  "#0b1020",
  "#0b1220",
  "#0c1220",
  "#0d1424",
  "#0e1421",
  "#0f1626",
  "#101625",
  "#101827",
  "#111827",
  "#121929",
  "#141b2d",
  "#171436",
  "#172033",
  "#182033",
  "#22163d",
  "#2b1c52",
];

function countOccurrences(hex: string): number {
  const matches = css.match(new RegExp(`${hex}\\b`, "gi"));

  return matches ? matches.length : 0;
}

describe("css token guardrail", () => {
  it("exposes the surface / status / radius token scales for theming", () => {
    for (const token of [
      "--surface-base",
      "--surface-raised",
      "--surface-sunken",
      "--status-success-bg",
      "--status-danger-bg",
      "--radius-md",
    ]) {
      expect(css).toContain(`${token}:`);
    }
  });

  it("does not add new hardcoded dark surface hexes (ratchet — only decrease)", () => {
    const total = DARK_SURFACE_HEXES.reduce(
      (sum, hex) => sum + countOccurrences(hex),
      0,
    );

    // Baseline frozen 2026-06-16. New UI must use --surface-* / --status-* /
    // --color-* tokens so light mode works without a hand-written override. This
    // number may only go DOWN as components migrate to tokens (P2); if it goes
    // up, a component hardcoded a dark surface — replace the hex with a token.
    const BASELINE = 195;

    expect(total).toBeLessThanOrEqual(BASELINE);
  });
});
