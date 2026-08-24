import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import type { CatalogTitle } from "@shared/catalog";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";

export function LiveSearch() {
  const { locale, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const results = trpc.catalog.search.useQuery({ query: debounced, locale }, { enabled: debounced.length >= 2 });
  const items = (results.data as CatalogTitle[] | undefined) ?? [];

  function go(id: string) {
    setOpen(false);
    setQuery("");
    setLocation(`/title/${id}`);
  }

  return (
    <div className="live-search" ref={boxRef}>
      <form
        className="header-search"
        role="search"
        onSubmit={event => {
          event.preventDefault();
          if (debounced.length >= 2) { setOpen(false); setLocation(`/search?q=${encodeURIComponent(debounced)}`); }
        }}
      >
        <Search size={16} aria-hidden="true" />
        <input
          aria-label={t("live.inputAria")}
          value={query}
          placeholder={t("live.placeholder")}
          autoComplete="off"
          onChange={event => { setQuery(event.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={event => event.key === "Escape" && setOpen(false)}
        />
      </form>
      {open && query.trim().length >= 2 && (
        <div className="live-search__panel glass-strong" role="listbox" aria-label={t("live.panelAria")}>
          {results.isLoading && <p className="live-search__hint">{t("live.loading")}</p>}
          {!results.isLoading && items.length === 0 && <p className="live-search__hint">{t("live.none")}</p>}
          {items.slice(0, 7).map(title => (
            <button key={title.id} type="button" className="live-search__item" onClick={() => go(title.id)}>
              {title.posterUrl ? <img src={title.posterUrl} alt="" loading="lazy" /> : <span className="live-search__thumb-fallback" />}
              <span className="live-search__meta"><strong>{title.title}</strong><small>{title.releaseYear || "—"} · {title.mediaType === "tv" ? t("type.series") : t("type.movie")}</small></span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
