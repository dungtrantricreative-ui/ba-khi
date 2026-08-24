import { describe, expect, it } from "vitest";

import { findOfficialTrailer } from "./catalog";

describe("TMDB Read Access Token", () => {
  it("authorizes the lightweight configuration endpoint", async () => {
    const token = process.env.TMDB_READ_ACCESS_TOKEN;
    expect(token).toBeTruthy();

    const response = await fetch("https://api.themoviedb.org/3/configuration", {
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(8000),
    });

    expect(response.status).toBe(200);
    const body = await response.json() as { images?: { secure_base_url?: string } };
    expect(body.images?.secure_base_url).toMatch(/^https:\/\//);
  });

  it("returns only a valid official YouTube preview shape through the server adapter", async () => {
    const trailer = await findOfficialTrailer("tmdb-tv-95350");
    expect(trailer).toEqual(expect.objectContaining({
      site: "YouTube",
      key: expect.stringMatching(/^[A-Za-z0-9_-]{11}$/),
    }));
  });
});
