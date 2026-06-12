import { beforeEach, describe, expect, it } from "vitest";
import {
  defaultAppSettings,
  loadAppSettings,
  normalizeAppSettings,
  saveAppSettings,
  setFirstEntryGuidesEnabled,
} from "../../src/domain/settings/appSettings";

describe("app settings", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("normalizes unknown values to supported defaults", () => {
    expect(normalizeAppSettings(null)).toEqual(defaultAppSettings);
    expect(
      normalizeAppSettings({
        schemaVersion: 99,
        guides: {
          showFirstEntryGuides: false,
          ignored: true,
        },
      }),
    ).toEqual({
      schemaVersion: 1,
      guides: {
        showFirstEntryGuides: false,
      },
    });
  });

  it("persists the first-entry guide setting globally", () => {
    const disabled = setFirstEntryGuidesEnabled(defaultAppSettings, false);

    saveAppSettings(disabled);

    expect(loadAppSettings().guides.showFirstEntryGuides).toBe(false);
  });
});
