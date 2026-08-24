import { AlertCircle, Info, Play, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { MovieRail } from "@/components/MovieRail";
import { ContinueRail } from "@/components/ContinueRail";
import { HomeSkeleton } from "@/components/Skeletons";
import type { CatalogTitle } from "@shared/catalog";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { locale, t } = useLanguage();
  const catalog = trpc.catalog.home.useQuery({ locale });

  if (catalog.isLoading) return <div className="app-shell"><Header /><HomeSkeleton /></div>;
  if (catalog.isError || !catalog.data) return <div className="app-shell"><Header /><main className="page-loading"><AlertCircle /> {t("error.catalog")}</main></div>;

  const { hero, rails, source } = catalog.data;
  return (
    <div className="app-shell">
      <Header />
      <main>
        <HeroCarousel hero={hero} trending={rails.find(rail => rail.id === "trending")?.items ?? []} />
        {source === "demo" && <div className="catalog-note glass"><Info size={16} /> {t("note.demo")}</div>}
        <div className="rail-stack">
          <ContinueRail />
          {rails.map(rail => <MovieRail key={rail.id} label={rail.label} items={rail.items} />)}
        </div>
      </main>
    </div>
  );
}

function HeroCarousel({ hero, trending }: { hero: CatalogTitle; trending: CatalogTitle[] }) {
  const { t } = useLanguage();
  const slides = useMemo(() => {
    const seen = new Set<string>();
    return [hero, ...trending].filter(item => (seen.has(item.id) ? false : (seen.add(item.id), true))).slice(0, 6);
  }, [hero, trending]);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setSlideIndex(index => (index + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [slides.length, slideIndex]);

  const active = Math.min(slideIndex, slides.length - 1);

  return (
    <section className="hero hero--stack">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={index === active ? "hero-slide hero-slide--on" : "hero-slide"}
          style={{ "--hero-image": `url(${slide.backdropUrl || ""})` } as React.CSSProperties}
          aria-hidden={index !== active}
        >
          <div className="hero__inner">
            <div className="eyebrow"><Sparkles size={15} /> {t("hero.slideEyebrow")}</div>
            <h1>{slide.title}</h1>
            <div className="hero__facts"><b>{slide.rating?.toFixed(1) || "N/A"}</b><span>{slide.releaseYear || "—"}</span><span>{slide.genres.slice(0, 2).join(" · ")}</span></div>
            <p>{slide.overview}</p>
            <div className="hero__actions">
              <Link href={`/watch/${slide.id}`} className="button button--primary"><Play size={18} fill="currentColor" /> {t("action.play")}</Link>
              <Link href={`/title/${slide.id}`} className="button button--glass"><Info size={18} /> {t("action.details")}</Link>
            </div>
          </div>
        </div>
      ))}
      {slides.length > 1 && (
        <div className="hero-dots" role="tablist" aria-label={t("hero.dotsAria")}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={slide.title}
              title={slide.title}
              className={index === active ? "hero-dot hero-dot--on" : "hero-dot"}
              onClick={() => setSlideIndex(index)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
