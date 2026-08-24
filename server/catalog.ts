import type { CastMember, CatalogTitle, Episode, OfficialTrailer, SeasonSummary, TitleDetails } from "../shared/catalog";

export type Locale = "vi" | "en";

const HERO_ASSET = "/manus-storage/novaflix-hero-user_4c631c9a.jpg";
const TMDB_API = "https://api.themoviedb.org/3";
const CACHE_TTL_MS = Number(process.env.TMDB_CACHE_TTL_MS || 1000 * 60 * 60 * 4);
const BUNDLED_TMDB_READ_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZmMyYzhkNTgwZjNiNDk1ODJhYzlmYWQ2MGQwYjUxZiIsIm5iZiI6MTc4NzU0MzM4Ni41OTgsInN1YiI6IjZhOGJiZjVhZGE2YmYxNTM5YWMwZWJkYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.uTk9LAYIiwJsoGj1bIboQ0IIklWw_R9SdG-lm-AB2zI";

type CachedValue<T> = { expiresAt: number; value: T };
type RawTmdb = Record<string, any>;
const memoryCache = new Map<string, CachedValue<unknown>>();

const LABELS: Record<Locale, Record<string, string>> = {
  vi: { trending: "Đang được quan tâm", movies: "Phim nổi bật", series: "Series phổ biến", popular: "Được chọn cho nhóm", drama: "Chính kịch tinh tế", continue: "Khám phá tiếp", demo: "Catalog demo", fallback: "Catalog demo", korea: "Phim Hàn", thai: "Phim Thái", china: "Phim Trung", anime: "Anime" },
  en: { trending: "Trending now", movies: "Featured movies", series: "Popular series", popular: "Picked for you", drama: "Refined drama", continue: "Keep exploring", demo: "Demo catalog", fallback: "Demo catalog", korea: "Korean picks", thai: "Thai picks", china: "Chinese picks", anime: "Anime" },
};

const COPY: Record<Locale, Record<string, string>> = {
  vi: { untitled: "Không rõ tiêu đề", noOverview: "TMDB chưa có tóm tắt bằng ngôn ngữ đã chọn.", unknownEpisodeName: "Tập", noEpisodeOverview: "TMDB chưa có tóm tắt cho tập này.", seasonFallback: "Mùa", unknownPerson: "Không rõ" },
  en: { untitled: "Untitled", noOverview: "No synopsis available in the selected language yet.", unknownEpisodeName: "Episode", noEpisodeOverview: "No synopsis available for this episode yet.", seasonFallback: "Season", unknownPerson: "Unknown" },
};

const demoTitles: CatalogTitle[] = [
  { id: "demo-dunes", mediaType: "movie", title: "Dune: Part Two", releaseYear: 2024, rating: 8.2, overview: "Một hành trình quy mô lớn trên hành tinh cát, được đưa vào PoC như metadata minh họa khi TMDB chưa được cấu hình.", genres: ["Khoa học viễn tưởng", "Phiêu lưu"], posterUrl: HERO_ASSET, backdropUrl: HERO_ASSET, runtimeMinutes: 166 },
  { id: "demo-wild-robot", mediaType: "movie", title: "The Wild Robot", releaseYear: 2024, rating: 8.3, overview: "Một robot học cách sống trong thế giới tự nhiên. Đây là item demo trong catalog cục bộ.", genres: ["Hoạt hình", "Gia đình"], posterUrl: HERO_ASSET, backdropUrl: HERO_ASSET, runtimeMinutes: 102 },
  { id: "demo-civil-war", mediaType: "movie", title: "Civil War", releaseYear: 2024, rating: 7.0, overview: "Một chuyến đi căng thẳng qua nước Mỹ giả tưởng; chỉ hiển thị metadata mẫu cho UI.", genres: ["Chính kịch", "Giật gân"], posterUrl: HERO_ASSET, backdropUrl: HERO_ASSET, runtimeMinutes: 109 },
  { id: "demo-perfect-days", mediaType: "movie", title: "Perfect Days", releaseYear: 2023, rating: 7.9, overview: "Một câu chuyện lặng về nhịp điệu đời thường, dùng để trình bày Rail và Detail page.", genres: ["Chính kịch"], posterUrl: HERO_ASSET, backdropUrl: HERO_ASSET, runtimeMinutes: 124 },
  { id: "demo-substance", mediaType: "movie", title: "The Substance", releaseYear: 2024, rating: 7.3, overview: "Một tựa phim demo khác để kiểm tra layout poster, focus state và tìm kiếm.", genres: ["Kinh dị", "Chính kịch"], posterUrl: HERO_ASSET, backdropUrl: HERO_ASSET, runtimeMinutes: 141 },
  { id: "demo-anatomy", mediaType: "movie", title: "Anatomy of a Fall", releaseYear: 2023, rating: 7.6, overview: "Một title minh họa thuộc nhóm phim được bình chọn cao trong catalog PoC.", genres: ["Bí ẩn", "Chính kịch"], posterUrl: HERO_ASSET, backdropUrl: HERO_ASSET, runtimeMinutes: 152 },
];

function pruneCache() {
  const now = Date.now();
  for (const [key, entry] of Array.from(memoryCache.entries())) if (entry.expiresAt <= now) memoryCache.delete(key);
}

async function cached<T>(key: string, loader: () => Promise<T>) {
  pruneCache();
  const existing = memoryCache.get(key) as CachedValue<T> | undefined;
  if (existing) return existing.value;
  const value = await loader();
  memoryCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

function token() { return process.env.TMDB_READ_ACCESS_TOKEN || BUNDLED_TMDB_READ_TOKEN; }
function image(path: string | null | undefined, size: "w500" | "original") { return path ? `https://image.tmdb.org/t/p/${size}${path}` : null; }
function tmdbLanguage(locale: Locale) { return locale === "vi" ? "vi-VN" : "en-US"; }
function canonicalMediaType(raw: RawTmdb, fallback: "movie" | "tv" = "movie") {
  if (raw.media_type === "tv") return "tv";
  if (raw.media_type === "movie") return "movie";
  if (raw.name && !raw.title) return "tv";
  return fallback;
}

export function normalizeTmdbTitle(raw: RawTmdb, mediaType: "movie" | "tv", locale: Locale = "vi"): CatalogTitle {
  const name = mediaType === "movie" ? raw.title : raw.name;
  const date = mediaType === "movie" ? raw.release_date : raw.first_air_date;
  const id = `tmdb-${mediaType}-${raw.id}`;
  return {
    id,
    tmdbId: raw.id,
    mediaType,
    title: name || COPY[locale].untitled,
    overview: raw.overview || COPY[locale].noOverview,
    releaseYear: date ? Number(String(date).slice(0, 4)) : null,
    rating: typeof raw.vote_average === "number" ? Math.round(raw.vote_average * 10) / 10 : null,
    runtimeMinutes: raw.runtime || (Array.isArray(raw.episode_run_time) ? raw.episode_run_time[0] : null) || null,
    genres: Array.isArray(raw.genres) ? raw.genres.map((genre: { name: string }) => genre.name) : [],
    posterUrl: image(raw.poster_path, "w500"),
    backdropUrl: image(raw.backdrop_path, "original"),
  };
}

function normalizeSeason(raw: RawTmdb, locale: Locale): SeasonSummary {
  return { seasonNumber: raw.season_number, name: raw.name || `${COPY[locale].seasonFallback} ${raw.season_number}`, episodeCount: raw.episode_count || 0, posterUrl: image(raw.poster_path, "w500") };
}

export function normalizeEpisode(raw: RawTmdb, titleId: string, seasonNumber: number, locale: Locale = "vi"): Episode {
  return {
    id: `${titleId}:s${seasonNumber}:e${raw.episode_number}`,
    tmdbEpisodeId: raw.id,
    seasonNumber,
    episodeNumber: raw.episode_number,
    name: raw.name || `${COPY[locale].unknownEpisodeName} ${raw.episode_number}`,
    overview: raw.overview || COPY[locale].noEpisodeOverview,
    airDate: raw.air_date || null,
    runtimeMinutes: raw.runtime || null,
    stillUrl: image(raw.still_path, "original"),
  };
}

async function tmdb(path: string, params: Record<string, string> = {}, locale: Locale = "vi") {
  const accessToken = token();
  if (!accessToken) throw new Error("TMDB_NOT_CONFIGURED");
  const url = new URL(`${TMDB_API}${path}`);
  url.searchParams.set("language", tmdbLanguage(locale));
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const response = await fetch(url, { headers: { accept: "application/json", authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`TMDB_${response.status}`);
  return response.json() as Promise<RawTmdb>;
}

function mapList(raw: RawTmdb, fallback: "movie" | "tv", locale: Locale) {
  return (raw.results || []).filter((item: RawTmdb) => item.media_type !== "person").slice(0, 16).map((item: RawTmdb) => normalizeTmdbTitle(item, canonicalMediaType(item, fallback), locale));
}

function demoCatalog(locale: Locale, source: "demo" | "fallback" = "demo") {
  return { source, hero: demoTitles[0], rails: [
    { id: "popular", label: LABELS[locale].popular, items: demoTitles.slice(0, 6) },
    { id: "drama", label: LABELS[locale].drama, items: demoTitles.slice(3).concat(demoTitles.slice(0, 3)) },
    { id: "continue", label: LABELS[locale].continue, items: demoTitles.slice().reverse() },
  ] };
}

async function originItems(locale: Locale, movieParams: Record<string, string>, tvParams: Record<string, string>) {
  const [movies, series] = await Promise.all([
    tmdb("/discover/movie", { include_adult: "false", sort_by: "popularity.desc", ...movieParams }, locale),
    tmdb("/discover/tv", { include_adult: "false", sort_by: "popularity.desc", ...tvParams }, locale),
  ]);
  return [...mapList(movies, "movie", locale).slice(0, 8), ...mapList(series, "tv", locale).slice(0, 8)];
}

export async function homeCatalog(locale: Locale = "vi") {
  try {
    return await cached(`home:${locale}`, async () => {
      const [trending, movies, series, korean, thai, chinese, anime] = await Promise.all([
        tmdb("/trending/all/day", {}, locale),
        tmdb("/movie/popular", {}, locale),
        tmdb("/tv/popular", {}, locale),
        originItems(locale, { with_original_language: "ko" }, { with_origin_country: "KR" }),
        originItems(locale, { with_original_language: "th" }, { with_origin_country: "TH" }),
        originItems(locale, { with_original_language: "zh" }, { with_origin_country: "CN" }),
        originItems(locale, { with_original_language: "ja", with_genres: "16" }, { with_origin_country: "JP", with_genres: "16" }),
      ]);
      const trendingItems = mapList(trending, "movie", locale);
      const movieItems = mapList(movies, "movie", locale);
      const seriesItems = mapList(series, "tv", locale);
      return { source: "tmdb" as const, hero: trendingItems[0] || movieItems[0] || demoTitles[0], rails: [
        { id: "trending", label: LABELS[locale].trending, items: trendingItems },
        { id: "movies", label: LABELS[locale].movies, items: movieItems },
        { id: "series", label: LABELS[locale].series, items: seriesItems },
        { id: "korea", label: LABELS[locale].korea, items: korean },
        { id: "thailand", label: LABELS[locale].thai, items: thai },
        { id: "china", label: LABELS[locale].china, items: chinese },
        { id: "anime", label: LABELS[locale].anime, items: anime },
      ] };
    });
  } catch { return demoCatalog(locale, "fallback"); }
}

export async function findTitle(id: string, locale: Locale = "vi"): Promise<TitleDetails | null> {
  const demo = demoTitles.find(title => title.id === id);
  if (demo) return { ...demo, seasons: [] };
  const match = /^tmdb-(movie|tv)-(\d+)$/.exec(id);
  if (!match || !token()) return null;
  const [, rawMediaType, tmdbId] = match;
  const mediaType = rawMediaType as "movie" | "tv";
  try {
    return await cached(`title:${id}:${locale}`, async () => {
      const raw = await tmdb(`/${mediaType}/${tmdbId}`, {}, locale);
      const normalized = normalizeTmdbTitle(raw, mediaType, locale);
      return { ...normalized, seasons: mediaType === "tv" ? (raw.seasons || []).filter((season: RawTmdb) => season.season_number > 0).map((season: RawTmdb) => normalizeSeason(season, locale)) : [] };
    });
  } catch { return null; }
}

export async function findEpisodes(id: string, seasonNumber: number, locale: Locale = "vi"): Promise<Episode[]> {
  const match = /^tmdb-tv-(\d+)$/.exec(id);
  if (!match || !token() || seasonNumber < 1 || seasonNumber > 100) return [];
  try {
    return await cached(`episodes:${id}:s${seasonNumber}:${locale}`, async () => {
      const raw = await tmdb(`/tv/${match[1]}/season/${seasonNumber}`, {}, locale);
      return (raw.episodes || []).map((episode: RawTmdb) => normalizeEpisode(episode, id, seasonNumber, locale));
    });
  } catch { return []; }
}

export async function searchTitles(query: string, locale: Locale = "vi") {
  const normalized = query.trim();
  if (normalized.length < 2) return [];
  if (!token()) {
    const needle = normalized.toLocaleLowerCase("vi");
    return demoTitles.filter(title => `${title.title} ${title.overview} ${title.genres.join(" ")}`.toLocaleLowerCase("vi").includes(needle));
  }
  try { return await cached(`search:${locale}:${normalized.toLocaleLowerCase(locale === "vi" ? "vi" : "en")}`, async () => mapList(await tmdb("/search/multi", { query: normalized, include_adult: "false" }, locale), "movie", locale)); } catch { return []; }
}

export async function findCredits(id: string, locale: Locale = "vi"): Promise<CastMember[]> {
  const match = /^tmdb-(movie|tv)-(\d+)$/.exec(id);
  if (!match || !token()) return [];
  try {
    return await cached(`credits:${id}:${locale}`, async () => {
      const raw = await tmdb(`/${match[1]}/${match[2]}/credits`, {}, locale);
      return ((raw.cast || []) as RawTmdb[]).slice(0, 14).map((person: RawTmdb) => ({
        id: person.id,
        name: person.name || COPY[locale].unknownPerson,
        character: person.character || person.roles?.[0]?.character || "",
        profileUrl: image(person.profile_path, "w500"),
      }));
    });
  } catch { return []; }
}

export async function findSimilar(id: string, locale: Locale = "vi"): Promise<CatalogTitle[]> {
  const match = /^tmdb-(movie|tv)-(\d+)$/.exec(id);
  if (!match || !token()) return [];
  try {
    return await cached(`similar:${id}:${locale}`, async () => {
      const raw = await tmdb(`/${match[1]}/${match[2]}/similar`, {}, locale);
      return (raw.results || []).slice(0, 16).map((item: RawTmdb) => normalizeTmdbTitle(item, match[1] as "movie" | "tv", locale));
    });
  } catch { return []; }
}

/** Returns only an official YouTube trailer/teaser key obtained from TMDB. */
export async function findOfficialTrailer(id: string, locale: Locale = "vi"): Promise<OfficialTrailer | null> {
  const match = /^tmdb-(movie|tv)-(\d+)$/.exec(id);
  if (!match || !token()) return null;
  const [, mediaType, tmdbId] = match;
  try {
    return await cached(`trailer:${id}:${locale}`, async () => {
      const selectOfficial = (raw: RawTmdb) => {
        const candidates = (raw.results || []).filter((video: RawTmdb) => video.site === "YouTube" && ["Trailer", "Teaser"].includes(video.type) && /^[A-Za-z0-9_-]{11}$/.test(video.key || ""));
        return candidates.find((video: RawTmdb) => video.official && video.type === "Trailer") || candidates.find((video: RawTmdb) => video.type === "Trailer") || candidates.find((video: RawTmdb) => video.official) || candidates[0];
      };
      let selected = selectOfficial(await tmdb(`/${mediaType}/${tmdbId}/videos`, {}, locale));
      if (!selected) selected = selectOfficial(await tmdb(`/${mediaType}/${tmdbId}/videos`, { language: "en-US" }));
      return selected ? { key: selected.key, name: selected.name || "Official trailer", type: selected.type === "Teaser" ? "Teaser" : "Trailer", site: "YouTube" } : null;
    });
  } catch { return null; }
}

export function cacheInfo() { pruneCache(); return { enabled: Boolean(token()), entries: memoryCache.size, ttlMs: CACHE_TTL_MS }; }
