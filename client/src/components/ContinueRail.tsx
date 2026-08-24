import { useEffect, useState } from "react";
import { History } from "lucide-react";
import type { CatalogTitle } from "@shared/catalog";
import { useLanguage } from "@/lib/i18n";
import type { ContinueEntry } from "@/lib/localLibrary";
import { getContinueWatching, removeContinueWatching } from "@/lib/localLibrary";
import { MovieCard } from "./MovieCard";

export function ContinueRail() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState<ContinueEntry[]>([]);

  useEffect(() => { setEntries(getContinueWatching()); }, []);

  if (entries.length === 0) return null;
  const items: CatalogTitle[] = entries.map(entry => ({
    id: entry.titleId,
    tmdbId: entry.tmdbId,
    mediaType: entry.mediaType,
    title: entry.title,
    overview: "",
    releaseYear: null,
    rating: null,
    genres: [],
    posterUrl: entry.posterUrl,
    backdropUrl: entry.posterUrl,
  }));

  return (
    <section className="rail" aria-label={t("continue.aria")}>
      <div className="rail__heading">
        <h2><History size={19} /> {t("continue.rail")}</h2>
        <button type="button" className="continue-clear" onClick={() => { entries.forEach(entry => removeContinueWatching(entry.titleId)); setEntries([]); }}>{t("continue.clear")}</button>
      </div>
      <div className="rail__track" tabIndex={0}>
        {items.map((title, index) => <MovieCard title={title} index={index} key={title.id} />)}
      </div>
    </section>
  );
}
