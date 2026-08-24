import { describe, expect, it } from "vitest";
import { homeCatalog, normalizeEpisode, normalizeTmdbTitle, searchTitles } from "./catalog";

describe("catalog fallback", () => {
  it("returns a usable catalog in both demo and TMDB-enabled modes", async () => {
    const catalog = await homeCatalog();
    expect(["demo", "tmdb"]).toContain(catalog.source);
    expect(catalog.hero.id).toBeTruthy();
    expect(catalog.rails[0]?.items.length).toBeGreaterThan(0);
  });

  it("searches the active catalog provider", async () => {
    const results = await searchTitles("dune");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(result => result.title.toLocaleLowerCase().includes("dune"))).toBe(true);
  });

  it("normalizes TMDB output down to the public catalog shape", () => {
    const normalized = normalizeTmdbTitle({
      id: 321,
      title: "Phim mẫu",
      overview: "Tóm tắt mẫu",
      release_date: "2025-04-10",
      vote_average: 7.666,
      runtime: 99,
      poster_path: "/poster.jpg",
      backdrop_path: "/backdrop.jpg",
      genres: [{ id: 18, name: "Chính kịch" }],
      unexpected_private_field: "must-not-reach-client",
    }, "movie");

    expect(normalized).toEqual({
      id: "tmdb-movie-321",
      tmdbId: 321,
      mediaType: "movie",
      title: "Phim mẫu",
      overview: "Tóm tắt mẫu",
      releaseYear: 2025,
      rating: 7.7,
      runtimeMinutes: 99,
      genres: ["Chính kịch"],
      posterUrl: "https://image.tmdb.org/t/p/w500/poster.jpg",
      backdropUrl: "https://image.tmdb.org/t/p/original/backdrop.jpg",
    });
  });

  it("normalizes TV episode output without exposing source-provider fields", () => {
    const episode = normalizeEpisode({
      id: 222,
      episode_number: 4,
      name: "Tập mẫu",
      overview: "Tóm tắt tập mẫu",
      air_date: "2026-03-01",
      runtime: 48,
      still_path: "/still.jpg",
      provider_secret: "must-not-reach-client",
    }, "tmdb-tv-123", 2);

    expect(episode).toEqual({
      id: "tmdb-tv-123:s2:e4",
      tmdbEpisodeId: 222,
      seasonNumber: 2,
      episodeNumber: 4,
      name: "Tập mẫu",
      overview: "Tóm tắt tập mẫu",
      airDate: "2026-03-01",
      runtimeMinutes: 48,
      stillUrl: "https://image.tmdb.org/t/p/original/still.jpg",
    });
  });
});
