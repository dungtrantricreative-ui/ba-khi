import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense, useEffect } from "react";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useLanguage, LanguageProvider } from "./lib/i18n";

const Home = lazy(() => import("./pages/Home"));
const SearchPage = lazy(() => import("./pages/Search"));
const Credits = lazy(() => import("./pages/Credits"));
const Detail = lazy(() => import("./pages/Detail"));
const Watch = lazy(() => import("./pages/Watch"));

function Router() {
  const { t } = useLanguage();
  return (
    <Suspense fallback={<div className="page-loading">{t("app.loading")}</div>}>
      <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/search" component={SearchPage} />
      <Route path="/credits" component={Credits} />
      <Route path="/title/:id">{params => <Detail id={params.id} />}</Route>
      <Route path="/watch/:id">{params => <Watch id={params.id} />}</Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

declare global {
  interface Window {
    liquidGL?: (options: Record<string, unknown>) => unknown;
  }
}

function LiquidGlassRuntime() {
  useEffect(() => {
    let cancelled = false;
    const existing = document.querySelector<HTMLScriptElement>('script[data-liquidgl="engine"]');
    const script = existing ?? document.createElement("script");
    script.src = "/liquidGL.js";
    script.defer = true;
    script.dataset.liquidgl = "engine";

    const initialise = () => {
      if (cancelled || !window.liquidGL) return;
      window.liquidGL({
        engine: "auto",
        snapshot: "body",
        target: ".liquid-lens",
        resolution: Math.min(1.5, window.devicePixelRatio || 1),
        refraction: 0.018,
        aberration: 0.16,
        bevelDepth: 0.12,
        bevelWidth: 0.18,
        frost: 1.2,
        shadow: true,
        specular: true,
        reveal: "fade",
        tilt: false,
      });
    };

    if (existing) initialise();
    else {
      script.addEventListener("load", initialise, { once: true });
      document.head.appendChild(script);
    }
    return () => { cancelled = true; };
  }, []);

  return null;
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <LiquidGlassRuntime />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
