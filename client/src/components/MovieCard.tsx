import { Play } from "lucide-react";
import { Link } from "wouter";
import type { CatalogTitle } from "@shared/catalog";

export function MovieCard({ title, index }: { title: CatalogTitle; index?: number }) {
  return (
    <Link href={`/title/${title.id}`} className="movie-card" aria-label={`Mở chi tiết ${title.title}`}>
      <div className="movie-card__visual">
        {title.posterUrl ? <img src={title.posterUrl} alt="" loading={index !== undefined && index < 4 ? "eager" : "lazy"} /> : <div className="movie-card__fallback" />}
        <span className="movie-card__play"><Play size={17} fill="currentColor" /></span>
      </div>
      <div className="movie-card__meta"><strong>{title.title}</strong><span>{title.releaseYear || "—"} · {title.rating?.toFixed(1) || "N/A"}</span></div>
    </Link>
  );
}
