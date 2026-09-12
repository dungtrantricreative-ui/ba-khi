import { describe, expect, it } from "vitest";

describe("application branding environment", () => {
  it("uses the configured Simpapa application title", () => {
    expect(process.env.VITE_APP_TITLE).toBe("Simpapa");
  });
});
