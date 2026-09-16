import { Globe2, Menu, Search as Magnifier, Settings as SettingsIcon, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { LiveSearch } from "./LiveSearch";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { t } = useLanguage();
  const navClass = (href: string) => (href === "/" ? location === "/" : location.startsWith(href));
  const linkClass = (href: string) => (navClass(href) ? "nav-link--active" : "");

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="wordmark" aria-label={t("wordmark.aria")}>SIMPAPA</Link>
        <nav className={`main-nav ${isOpen ? "main-nav--open" : ""}`} aria-label={t("nav.aria")}>
          <Link href="/" className={linkClass("/")}>{t("nav.home")}</Link>
          <Link href="/search" className={linkClass("/search")}>{t("nav.discover")}</Link>
          <Link href="/credits" className={linkClass("/credits")}>{t("nav.credits")}</Link>
        </nav>
        <div className="header-actions">
          <LiveSearch />
          <button
            type="button"
            className="search-magnifier"
            aria-label={t("live.inputAria")}
            title={t("live.inputAria")}
            onClick={() => navigate("/search")}
          >
            <Magnifier size={17} />
          </button>
          <Link className="settings-link" href="/settings" aria-label={t("settings.openAria")} title={t("settings.openAria")}><SettingsIcon size={17} /><span>{t("nav.settings")}</span></Link>
          <span className="access-pill" title={t("pill.public")}><Globe2 size={14} /> Public</span>
          <button className="icon-button mobile-only" type="button" onClick={() => setIsOpen(open => !open)} aria-label={isOpen ? t("nav.closeAria") : t("nav.openAria")}>{isOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
    </header>
  );
}
