import { describe, expect, it } from "vitest";

describe("application branding environment", () => {
  it("uses the configured Dũng Cảm application title", () => {
    expect(process.env.VITE_APP_TITLE).toBe("Dũng Cảm");
  });
});
