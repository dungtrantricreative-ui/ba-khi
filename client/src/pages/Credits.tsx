import { ExternalLink, Heart, ShieldCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/i18n";

export default function Credits() {
  const { t } = useLanguage();
  return <div className="app-shell"><Header /><main className="credits-page"><div className="eyebrow"><ShieldCheck size={15} /> {t("credits.eyebrow")}</div><h1>{t("credits.h1")}</h1><p>{t("credits.intro")}</p><section><h2>{t("credits.tmdbH2")}</h2><p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p><a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">{t("credits.visitTmdb")} <ExternalLink size={15} /></a></section><section><h2>{t("credits.policyH2")}</h2><p>{t("credits.policyBody")}</p></section><section><h2>{t("credits.adsH2")}</h2><p>{t("credits.adsBody")}</p></section><section><h2>{t("credits.privacyH2")}</h2><p>{t("credits.privacyBody")}</p></section><details id="donate" className="donate-card"><summary><span><Heart size={17} fill="currentColor" /> {t("donate.summary")}</span><small>{t("donate.optional")}</small></summary><div className="donate-card__body"><img src="https://img.vietqr.io/image/TPB-10005104354-compact.png" alt={t("donate.qrAlt")} loading="lazy" /><div><h2>{t("donate.thanksH2")}</h2><p>{t("donate.body")}</p><p className="donate-account"><span>{t("donate.bankL")}</span><strong>TPBank</strong><span>{t("donate.accountL")}</span><strong>10005104354</strong></p></div></div></details></main></div>;
}
