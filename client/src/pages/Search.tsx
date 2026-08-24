import { Search as SearchIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { MovieCard } from "@/components/MovieCard";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import type { CatalogTitle } from "@shared/catalog";

export default function SearchPage() {
  const { locale, t } = useLanguage();
  const initial = useMemo(() => new URLSearchParams(window.location.search).get("q") || "", []);
  const [query, setQuery] = useState(initial);
  const [debounced, setDebounced] = useState(initial);
  useEffect(() => { const timer = window.setTimeout(() => setDebounced(query.trim()), 280); return () => window.clearTimeout(timer); }, [query]);
  const results = trpc.catalog.search.useQuery({ query: debounced, locale }, { enabled: debounced.length >= 2 });
  return <div className="app-shell"><Header /><main className="search-page"><div className="search-lead"><p className="eyebrow">{t("search.eyebrow")}</p><h1>{t("search.h1")}</h1><label className="search-field"><SearchIcon size={20} /><input value={query} onChange={event => setQuery(event.target.value)} autoFocus placeholder={t("search.placeholder")} /></label></div>{debounced.length < 2 ? <p className="empty-copy">{t("search.start")}</p> : results.isLoading ? <p className="empty-copy">{t("search.loading")}</p> : <section className="search-results"><p>{t("search.count", { count: results.data?.length || 0, query: debounced })}</p><div className="movie-grid">{(results.data as CatalogTitle[] | undefined)?.map((title: CatalogTitle, index: number) => <MovieCard title={title} index={index} key={title.id} />)}</div>{results.data?.length === 0 && <p className="empty-copy">{t("search.none")}</p>}</section>}</main></div>;
}
