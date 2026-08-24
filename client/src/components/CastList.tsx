import type { CastMember } from "@shared/catalog";
import { useLanguage } from "@/lib/i18n";

export function CastList({ cast }: { cast: CastMember[] }) {
  const { t } = useLanguage();
  if (!cast.length) return null;
  return (
    <section className="rail" aria-label={t("rail.cast")}>
      <div className="rail__heading"><h2>{t("rail.cast")}</h2></div>
      <div className="cast-row">
        {cast.map(person => (
          <article key={person.id} className="cast-card glass">
            {person.profileUrl
              ? <img className="cast-card__photo" src={person.profileUrl} alt="" loading="lazy" />
              : <span className="cast-card__photo cast-card__fallback">{person.name.charAt(0)}</span>}
            <strong>{person.name}</strong>
            {person.character && <span>{person.character}</span>}
          </article>
        ))}
      </div>
    </section>
  );
}
