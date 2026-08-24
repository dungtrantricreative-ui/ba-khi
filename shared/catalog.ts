export type MediaType = "movie" | "tv";

export interface CatalogTitle {
  id: string;
  tmdbId?: number;
  mediaType: MediaType;
  title: string;
  overview: string;
  releaseYear: number | null;
  rating: number | null;
  runtimeMinutes?: number | null;
  genres: string[];
  posterUrl: string | null;
  backdropUrl: string | null;
}

export interface OfficialTrailer {
  key: string;
  name: string;
  type: "Trailer" | "Teaser";
  site: "YouTube";
}

export interface SeasonSummary {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  posterUrl: string | null;
}

export interface Episode {
  id: string;
  tmdbEpisodeId?: number;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview: string;
  airDate: string | null;
  runtimeMinutes: number | null;
  stillUrl: string | null;
}

export interface TitleDetails extends CatalogTitle {
  seasons: SeasonSummary[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profileUrl: string | null;
}
