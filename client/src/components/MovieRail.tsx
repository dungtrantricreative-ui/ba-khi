import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CatalogTitle } from "@shared/catalog";
import { MovieCard } from "./MovieCard";

export function MovieRail({ label, items }: { label: string; items: CatalogTitle[] }) {
  const track = useRef<HTMLDivElement>(null);
  function scroll(direction: number) {
    track.current?.scrollBy({ left: direction * Math.max(track.current.clientWidth * 0.82, 340), behavior: "smooth" });
  }
  return (
    <section className="rail" aria-label={label}>
      <div className="rail__heading"><h2>{label}</h2><div className="rail__controls"><button type="button" onClick={() => scroll(-1)} aria-label={`Cuộn ${label} sang trái`}><ChevronLeft size={18} /></button><button type="button" onClick={() => scroll(1)} aria-label={`Cuộn ${label} sang phải`}><ChevronRight size={18} /></button></div></div>
      <div className="rail__track" ref={track} tabIndex={0}>
        {items.map((title, index) => <MovieCard title={title} index={index} key={title.id} />)}
      </div>
    </section>
  );
}
