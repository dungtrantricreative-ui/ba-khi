export type MediaType = "movie" | "tv";

export type ContinueEntry = {
  titleId: string;
  tmdbId?: number;
  mediaType: MediaType;
  title: string;
  posterUrl: string | null;
  seasonNumber?: number;
  episodeNumber?: number;
  updatedAt: number;
};

const CONTINUE_KEY = "nl:continue:v2";
const FAVORITES_KEY = "nl:favorites:v1";
const MAX_ITEMS = 20;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 90;

function read<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getContinueWatching(): ContinueEntry[] {
  const cutoff = Date.now() - MAX_AGE_MS;
  const items = read<ContinueEntry[]>(CONTINUE_KEY, []).filter(item => item.updatedAt >= cutoff).slice(0, MAX_ITEMS);
  return items.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveContinueWatching(entry: Omit<ContinueEntry, "updatedAt">) {
  const current = getContinueWatching().filter(existing => existing.titleId !== entry.titleId);
  write(CONTINUE_KEY, [{ ...entry, updatedAt: Date.now() }, ...current].slice(0, MAX_ITEMS));
}

export function removeContinueWatching(titleId: string) {
  write(CONTINUE_KEY, getContinueWatching().filter(item => item.titleId !== titleId));
}

export function isFavorite(titleId: string) {
  return read<string[]>(FAVORITES_KEY, []).includes(titleId);
}

export function toggleFavorite(titleId: string) {
  const current = read<string[]>(FAVORITES_KEY, []);
  const next = current.includes(titleId) ? current.filter(id => id !== titleId) : [titleId, ...current].slice(0, MAX_ITEMS);
  write(FAVORITES_KEY, next);
  return next.includes(titleId);
}
