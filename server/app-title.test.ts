import { describe, expect, it } from "vitest";

describe("application branding environment", () => {
  it("uses the configured Bá Khí application title", () => {
    expect(process.env.VITE_APP_TITLE).toBe("Bá Khí");
  });
});
