import { ArrowLeft, Clapperboard, Info, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import type { TitleDetails } from "@shared/catalog";
import { trpc } from "@/lib/trpc";
import { EMBED_SERVERS, parseTitleId } from "@/lib/embedServers";
import { saveContinueWatching } from "@/lib/localLibrary";
import { useLanguage } from "@/lib/i18n";

function readQueryNumber(name: string) {
  const value = Number(new URLSearchParams(window.location.search).get(name));
  return Number.isInteger(value) && value > 0 ? value : null;
}

export function MultiServerPlayer({ title }: { title: TitleDetails }) {
  const { locale, t } = useLanguage();
  const parsed = useMemo(() => parseTitleId(title.id), [title.id]);
  const isSeries = parsed?.mediaType === "tv";

  const [serverIndex, setServerIndex] = useState(0);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState<number | null>(() => (isSeries ? readQueryNumber("season") ?? null : null));
  const [episodeNumber, setEpisodeNumber] = useState<number | null>(() => (isSeries ? readQueryNumber("episode") ?? null : null));

  useEffect(() => {
    if (!isSeries) return;
    setSeasonNumber(current => current ?? title.seasons[0]?.seasonNumber ?? 1);
    setEpisodeNumber(current => current ?? 1);
  }, [isSeries, title.seasons]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (isSeries && seasonNumber && episodeNumber) {
      params.set("season", String(seasonNumber));
      params.set("episode", String(episodeNumber));
    } else {
      params.delete("season");
      params.delete("episode");
    }
    const query = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  }, [isSeries, seasonNumber, episodeNumber]);

  const episodes = trpc.catalog.episodes.useQuery(
    { id: title.id, seasonNumber: seasonNumber || 1, locale },
    { enabled: Boolean(isSeries && seasonNumber), staleTime: 1000 * 60 * 30 },
  );

  const embedUrl = useMemo(() => {
    if (!parsed) return null;
    if (parsed.mediaType === "tv" && (!seasonNumber || !episodeNumber)) return null;
    return EMBED_SERVERS[serverIndex].buildUrl(parsed.mediaType, parsed.tmdbId, seasonNumber ?? undefined, episodeNumber ?? undefined);
  }, [parsed, serverIndex, seasonNumber, episodeNumber]);

  useEffect(() => {
    if (!parsed || !embedUrl) return;
    saveContinueWatching({
      titleId: title.id,
      tmdbId: parsed.tmdbId,
      mediaType: parsed.mediaType,
      title: title.title,
      posterUrl: title.posterUrl,
      seasonNumber: seasonNumber ?? undefined,
      episodeNumber: episodeNumber ?? undefined,
    });
  }, [parsed, embedUrl, title.id, title.title, title.posterUrl, seasonNumber, episodeNumber]);

  if (!parsed) {
    return (
      <section className="player-unavailable glass">
        <Info size={29} />
        <h1>{t("player.unavailable.h")}</h1>
        <p>{t("player.unavailable.p")}</p>
        <Link className="button button--glass" href={`/title/${title.id}`}>{t("player.backDetail")}</Link>
      </section>
    );
  }

  const activeServer = EMBED_SERVERS[serverIndex];
  const currentEpisode = episodes.data?.find(episode => episode.episodeNumber === episodeNumber);

  return (
    <div className={cinemaMode ? "multi-server-player cinema-on" : "multi-server-player"}>
      {cinemaMode && <div className="cinema-overlay" aria-hidden="true" onClick={() => setCinemaMode(false)} />}
      <section className="player-shell glass-strong">
        <div className="player-topbar">
          <Link href={`/title/${title.id}`} className="player-back"><ArrowLeft size={17} /> {t("player.back")}</Link>
          <span>{title.title}{currentEpisode ? ` · ${t("player.episode")} ${currentEpisode.episodeNumber}: ${currentEpisode.name}` : ""}</span>
          <span className="player-secure">{activeServer.name}</span>
          <button
            type="button"
            className={cinemaMode ? "cinema-button cinema-button--on" : "cinema-button"}
            aria-pressed={cinemaMode}
            title={t("cinema.title")}
            onClick={() => setCinemaMode(on => !on)}
          >
            <Clapperboard size={15} /> {t("cinema.label")}
          </button>
        </div>
        <div className="video-frame">
          {embedUrl
            ? <iframe key={`${activeServer.id}:${embedUrl}`} className="official-embed" src={embedUrl} title={`Player ${title.title}`} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen referrerPolicy="origin" />
            : <div className="player-overlay"><Loader2 className="animate-spin" size={25} /><span>{t("player.building")}</span></div>}
        </div>
        <p className="player-note">{t("player.via", { server: activeServer.name })}</p>
      </section>

      <div className="server-tabs" role="tablist" aria-label={t("servers.aria")}>
        {EMBED_SERVERS.map((server, index) => (
          <button
            key={server.id}
            type="button"
            role="tab"
            aria-selected={index === serverIndex}
            className={index === serverIndex ? "server-tab glass server-tab--active" : "server-tab glass"}
            onClick={() => setServerIndex(index)}
          >
            {t("server.n", { n: index + 1 })}<small>{server.name}</small>
          </button>
        ))}
      </div>

      {isSeries && (
        <section className="watch-episodes glass">
          <div className="season-row">
            <strong>{t("eps.h")}</strong>
            <label>
              {t("eps.pickSeason")}
              <select
                value={seasonNumber ?? ""}
                onChange={event => { setSeasonNumber(Number(event.target.value)); setEpisodeNumber(1); }}
              >
                {(title.seasons.length > 0 ? title.seasons : [{ seasonNumber: 1, name: t("season.fallback", { n: 1 }), episodeCount: 0, posterUrl: null }]).map(season => (
                  <option key={season.seasonNumber} value={season.seasonNumber}>{season.name}</option>
                ))}
              </select>
            </label>
          </div>
          {episodes.isLoading && <p className="muted-copy"><Loader2 className="animate-spin" size={14} /> {t("eps.loading")}</p>}
          {episodes.isError && <p className="muted-copy">{t("eps.errorSwitch")}</p>}
          <div className="ep-chip-row">
            {(episodes.data ?? Array.from({ length: title.seasons.find(season => season.seasonNumber === seasonNumber)?.episodeCount || 0 }, (_, index) => index + 1)).map(entry => {
              const number = typeof entry === "number" ? entry : entry.episodeNumber;
              return (
                <button
                  key={number}
                  type="button"
                  aria-label={t("eps.watchAria", { n: number })}
                  className={number === episodeNumber ? "ep-chip ep-chip--active" : "ep-chip"}
                  onClick={() => setEpisodeNumber(number)}
                >
                  {number}
                </button>
              );
            })}
          </div>
          {currentEpisode && <p className="ep-chip-meta">{t("player.episode")} {currentEpisode.episodeNumber}: {currentEpisode.name}{currentEpisode.airDate ? ` · ${currentEpisode.airDate}` : ""}</p>}
        </section>
      )}
    </div>
  );
}
