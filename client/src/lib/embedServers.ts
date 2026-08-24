import type { MediaType } from "@shared/catalog";

export interface EmbedServer {
  id: string;
  name: string;
  buildUrl(mediaType: MediaType, tmdbId: number, season?: number, episode?: number): string;
}

/** Danh sách server dự phòng. Thứ tự trong mảng = thứ tự nút bấm (Server 1 → Server 4). */
export const EMBED_SERVERS: EmbedServer[] = [
  {
    id: "vidlink",
    name: "VidLink",
    buildUrl: (mediaType, tmdbId, season, episode) =>
      mediaType === "movie"
        ? `https://vidlink.pro/movie/${tmdbId}`
        : `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    buildUrl: (mediaType, tmdbId, season, episode) =>
      mediaType === "movie"
        ? `https://vidsrc.to/embed/movie/${tmdbId}`
        : `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
  },
  {
    id: "2embed",
    name: "2Embed",
    buildUrl: (mediaType, tmdbId, season, episode) =>
      mediaType === "movie"
        ? `https://www.2embed.cc/embed/${tmdbId}`
        : `https://www.2embed.cc/embedtv/${tmdbId}&s=${season}&e=${episode}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    buildUrl: (mediaType, tmdbId, season, episode) =>
      mediaType === "movie"
        ? `https://player.autoembed.co/embed/movie/${tmdbId}`
        : `https://player.autoembed.co/embed/tv/${tmdbId}/${season}/${episode}`,
  },
];

/** Parse internal title id (`tmdb-movie-27205` / `tmdb-tv-1396`) thành TMDB ID + loại phim. */
export function parseTitleId(titleId: string): { mediaType: MediaType; tmdbId: number } | null {
  const match = /^tmdb-(movie|tv)-(\d+)$/.exec(titleId);
  return match ? { mediaType: match[1] as MediaType, tmdbId: Number(match[2]) } : null;
}
