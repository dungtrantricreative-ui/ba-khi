import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { CastList } from "@/components/CastList";
import { Header } from "@/components/Header";
import { MovieRail } from "@/components/MovieRail";
import { MultiServerPlayer } from "@/components/MultiServerPlayer";
import { CardsSkeleton } from "@/components/Skeletons";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";

export default function Watch({ id }: { id: string }) {
  const { locale, t } = useLanguage();
  const title = trpc.catalog.byId.useQuery({ id, locale }, { retry: false });
  const credits = trpc.catalog.credits.useQuery({ id, locale }, { enabled: title.isSuccess, staleTime: 1000 * 60 * 30 });
  const similar = trpc.catalog.similar.useQuery({ id, locale }, { enabled: title.isSuccess, staleTime: 1000 * 60 * 30 });

  if (title.isLoading) return <div className="page-loading">{t("watch.preparing")}</div>;
  if (title.isError || !title.data) {
    return (
      <div className="app-shell"><Header /><main className="watch-page">
        <section className="player-unavailable glass">
          <AlertCircle size={29} />
          <h1>{t("watch.missing.h")}</h1>
          <p>{t("watch.missing.p")}</p>
          <Link className="button button--glass" href="/">{t("watch.backHome")}</Link>
        </section>
      </main></div>
    );
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="watch-page">
        <MultiServerPlayer title={title.data} />
        {credits.isLoading && (
          <section className="rail" aria-label={t("rail.castLoadingAria")}><CardsSkeleton count={6} /></section>
        )}
        {credits.data && credits.data.length > 0 && <CastList cast={credits.data} />}
        {similar.isLoading && (
          <section className="rail" aria-label={t("rail.similarAria")}><CardsSkeleton count={6} /></section>
        )}
        {similar.data && similar.data.length > 0 && <MovieRail label={t("rail.similar")} items={similar.data} />}
      </main>
    </div>
  );
}
