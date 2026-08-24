import { ArrowLeft, Heart, Play, Star } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Skeleton } from "@/components/Skeletons";
import { useLanguage } from "@/lib/i18n";
import { isFavorite, toggleFavorite } from "@/lib/localLibrary";
import { trpc } from "@/lib/trpc";

export default function Detail({ id }: { id: string }) {
  const { locale, t } = useLanguage();
  const title = trpc.catalog.byId.useQuery({ id, locale });
  const [favorite, setFavorite] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState<number | null>(null);
  useEffect(() => { setFavorite(isFavorite(id)); }, [id]);
  useEffect(() => {
    if (title.data?.mediaType === "tv") setSeasonNumber(title.data.seasons[0]?.seasonNumber ?? null);
  }, [title.data?.id, title.data?.mediaType, title.data?.seasons]);

  const episodeInput = useMemo(() => ({ id, seasonNumber: seasonNumber || 1, locale }), [id, seasonNumber, locale]);
  const episodes = trpc.catalog.episodes.useQuery(episodeInput, { enabled: title.data?.mediaType === "tv" && Boolean(seasonNumber) });
  if (title.isLoading) return <div className="app-shell"><Header /><main className="detail-page"><section className="detail-hero hero--skeleton"><div className="detail-hero__content grid-skeleton"><Skeleton className="skeleton-pill" /><Skeleton className="skeleton-title" /><Skeleton className="skeleton-line" /><div className="skeleton-actions"><Skeleton className="skeleton-button" /><Skeleton className="skeleton-button skeleton-button--ghost" /></div></div></section></main></div>;
  if (title.isError || !title.data) return <div className="page-loading">{t("detail.error")}</div>;
  const item = title.data;

  return <div className="app-shell"><Header /><main className="detail-page">
    <Link href="/" className="back-link"><ArrowLeft size={17} /> {t("detail.back")}</Link>
    <section className="detail-hero" style={{ "--detail-image": `url(${item.backdropUrl || ""})` } as React.CSSProperties}>
      <div className="detail-hero__content"><div className="eyebrow">{item.mediaType === "movie" ? t("type.movie") : t("type.series")}</div><h1>{item.title}</h1><div className="hero__facts"><b><Star size={14} fill="currentColor" /> {item.rating?.toFixed(1) || "N/A"}</b><span>{item.releaseYear || "—"}</span><span>{item.runtimeMinutes ? t("runtime.minutes", { n: item.runtimeMinutes }) : t("runtime.unknown")}</span></div><p>{item.overview}</p><div className="genre-list">{item.genres.map(genre => <span key={genre}>{genre}</span>)}</div><div className="hero__actions"><Link href={`/watch/${item.id}`} className="button button--primary"><Play size={18} fill="currentColor" /> {t("action.play")}</Link><button className="button button--glass" type="button" aria-pressed={favorite} onClick={() => setFavorite(toggleFavorite(item.id))}><Heart size={18} fill={favorite ? "currentColor" : "none"} /> {favorite ? t("fav.saved") : t("fav.add")}</button></div></div>
    </section>
    <section className="detail-section"><h2>{t("info.h")}</h2><div className="info-grid"><div><span>{t("info.sourceL")}</span><strong>{t("info.sourceV")}</strong></div><div><span>{t("info.catL")}</span><strong>{t("info.catV")}</strong></div><div><span>{t("info.switchL")}</span><strong>{t("info.switchV")}</strong></div></div></section>
    {item.mediaType === "tv" && <section className="detail-section episode-section"><div className="episode-heading"><div><h2>{t("eps.h")}</h2><p>{t("eps.sub")}</p></div><label>{t("eps.pickSeason")}<select value={seasonNumber || ""} onChange={event => setSeasonNumber(Number(event.target.value))}>{item.seasons.map(season => <option key={season.seasonNumber} value={season.seasonNumber}>{season.name} · {t("eps.perSeason", { count: season.episodeCount })}</option>)}</select></label></div>{episodes.isLoading && <p className="muted-copy">{t("eps.loading")}</p>}{episodes.isError && <p className="muted-copy">{t("eps.error")}</p>}<div className="episode-list">{episodes.data?.map(episode => <article key={episode.id} className="episode-card"><div className="episode-card__index">{episode.episodeNumber}</div><div><h3>{episode.name}</h3><p>{episode.overview}</p><small>{episode.runtimeMinutes ? t("runtime.minutes", { n: episode.runtimeMinutes }) : t("runtime.unknown")}</small></div><Link className="episode-card__play" href={`/watch/${item.id}?season=${episode.seasonNumber}&episode=${episode.episodeNumber}`}><Play size={16} fill="currentColor" /> {t("action.play")}</Link></article>)}</div></section>}
  </main></div>;
}
