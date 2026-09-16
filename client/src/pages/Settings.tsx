import { Check, Globe2, Languages } from "lucide-react";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { useLanguage, type Locale } from "@/lib/i18n";

export default function Settings() {
  const { locale, setLocale, t } = useLanguage();
  const options: Array<{ value: Locale; label: string; description: string }> = [
    { value: "vi", label: t("settings.vietnamese"), description: "VI" },
    { value: "en", label: t("settings.english"), description: "EN" },
  ];

  return (
    <div className="app-shell">
      <Header />
      <main className="settings-page">
        <Link href="/" className="back-link">← {t("settings.backHome")}</Link>
        <section className="settings-hero">
          <p className="eyebrow"><Globe2 size={15} /> {t("settings.eyebrow")}</p>
          <h1>{t("settings.h1")}</h1>
          <p>{t("settings.intro")}</p>
        </section>
        <section className="settings-card" aria-labelledby="language-heading">
          <div className="settings-card__heading">
            <span className="settings-card__icon"><Languages size={19} /></span>
            <div>
              <h2 id="language-heading">{t("settings.languageH2")}</h2>
              <p>{t("settings.languageBody")}</p>
            </div>
          </div>
          <div className="settings-options" role="radiogroup" aria-label={t("settings.languageH2")}>
            {options.map(option => {
              const selected = option.value === locale;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={selected ? "settings-option settings-option--selected" : "settings-option"}
                  onClick={() => setLocale(option.value)}
                >
                  <span><strong>{option.label}</strong><small>{option.description}</small></span>
                  {selected && <Check size={18} aria-label={t("settings.selected")} />}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
