import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "vi" | "en";

const LOCALE_KEY = "nl:locale";
const GEO_KEY = "nl:geo";

type Dict = Record<string, string>;

const VI: Dict = {
  "app.loading": "Đang mở không gian xem…",
  "nav.home": "Trang chủ",
  "nav.discover": "Khám phá",
  "nav.credits": "Credits",
  "nav.aria": "Điều hướng chính",
  "nav.openAria": "Mở điều hướng",
  "nav.closeAria": "Đóng điều hướng",
  "wordmark.aria": "Dũng Cảm, trang chủ",
  "pill.public": "Catalog công khai",
  "lang.toggleTitle": "Đổi ngôn ngữ / Switch language",
  "hero.eyebrow": "Tuyển chọn phim",
  "hero.slideEyebrow": "Đề xuất hôm nay",
  "hero.dotsAria": "Chọn phim đề xuất",
  "action.play": "Phát",
  "action.details": "Chi tiết",
  "note.demo": "Đang chạy catalog demo vì TMDB token chưa được cấu hình. Giao diện và trình phát vẫn hoạt động bình thường.",
  "note.tmdb": "Metadata đồng bộ trực tiếp từ TMDB. Nội dung phát qua hệ thống đa server iFrame với 4 nguồn dự phòng.",
  "error.catalog": "Không thể tải catalog. Hãy thử lại.",
  "search.eyebrow": "Khám phá",
  "search.h1": "Tìm đúng bộ phim cho tối nay.",
  "search.placeholder": "Nhập ít nhất 2 ký tự",
  "search.start": "Bắt đầu bằng tên phim, thể loại hoặc một ý tưởng.",
  "search.loading": "Đang tìm trong catalog…",
  "search.count": "{count} kết quả cho “{query}”",
  "search.none": "Không có kết quả phù hợp.",
  "live.placeholder": "Tìm phim…",
  "live.inputAria": "Tìm title",
  "live.panelAria": "Kết quả gợi ý",
  "live.loading": "Đang tìm…",
  "live.none": "Không có kết quả phù hợp.",
  "type.series": "Series",
  "type.movie": "Phim",
  "detail.back": "Trang chủ",
  "detail.error": "Không tìm thấy title này.",
  "runtime.minutes": "{n} phút",
  "runtime.unknown": "Thời lượng chưa có",
  "fav.add": "Danh sách của tôi",
  "fav.saved": "Đã lưu",
  "info.h": "Thông tin phát",
  "info.sourceL": "Nguồn phát",
  "info.sourceV": "Đa server iFrame tự động",
  "info.catL": "Danh mục",
  "info.catV": "Đồng bộ TMDB",
  "info.switchL": "Chuyển nguồn",
  "info.switchV": "4 server dự phòng",
  "eps.h": "Danh sách tập",
  "eps.sub": "Tập được lấy tự động từ TMDB. Chọn tập để bắt đầu xem ngay.",
  "eps.pickSeason": "Chọn mùa",
  "eps.perSeason": "{count} tập",
  "eps.loading": "Đang tải danh sách tập…",
  "eps.error": "Không thể tải danh sách tập ở lúc này.",
  "watch.preparing": "Đang chuẩn bị trình phát…",
  "watch.missing.h": "Không tìm thấy nội dung",
  "watch.missing.p": "Title này không tồn tại trong catalog TMDB. Hãy quay lại trang chủ hoặc thử phim khác.",
  "watch.backHome": "Về trang chủ",
  "rail.similar": "Phim liên quan",
  "rail.similarAria": "Đang tải phim liên quan",
  "rail.cast": "Diễn viên",
  "rail.castLoadingAria": "Đang tải diễn viên",
  "player.unavailable.h": "Không phát được nội dung này",
  "player.unavailable.p": "Title đang ở chế độ demo cục bộ nên không có TMDB ID để dựng link server. Hãy chọn một phim từ danh mục TMDB.",
  "player.backDetail": "Về trang chi tiết",
  "player.back": "Chi tiết",
  "player.episode": "Tập",
  "cinema.title": "Chế độ Rạp phim: làm tối mọi thứ xung quanh trình phát",
  "cinema.label": "Rạp phim",
  "player.building": "Đang dựng link phát…",
  "player.via": "Đang phát qua {server}. Nếu phim bị lỗi hoặc không tải được, hãy chuyển sang server khác bên dưới. Mọi quảng cáo (nếu có) đều do server nhúng bên thứ ba chèn vào, không phải từ Dũng Cảm.",
  "servers.aria": "Chọn server phát",
  "server.n": "Server {n}",
  "season.fallback": "Mùa {n}",
  "eps.errorSwitch": "Không thể tải danh sách tập. Hãy thử đổi mùa hoặc server.",
  "eps.watchAria": "Xem tập {n}",
  "continue.rail": "Tiếp tục xem",
  "continue.aria": "Tiếp tục xem",
  "continue.clear": "Xóa lịch sử",
  "credits.eyebrow": "Minh bạch nguồn",
  "credits.h1": "Credits & cách Dũng Cảm vận hành",
  "credits.intro": "Dũng Cảm là PoC xem phim công khai, không chạy quảng cáo, pop-up hoặc auto-preview. TMDB chỉ được dùng để lấy metadata cần thiết ở backend; video phát qua hệ thống đa server iFrame theo TMDB ID.",
  "credits.tmdbH2": "TMDB attribution",
  "credits.visitTmdb": "Truy cập The Movie Database",
  "credits.policyH2": "Playback policy",
  "credits.policyBody": "Trình phát hỗ trợ 4 server embed dự phòng (VidLink, VidSrc, 2Embed, AutoEmbed) được dựng URL tự động từ TMDB ID; người dùng có thể đổi server hoặc tập ngay trong trang xem mà không cần tải lại trang. Vercel Functions không được dùng làm relay video dài hạn.",
  "credits.privacyH2": "Privacy",
  "credits.privacyBody": "Danh sách yêu thích và “Xem tiếp” nằm trong LocalStorage của trình duyệt. Chúng không được gửi tới catalog API của PoC.",
  "credits.adsH2": "Về quảng cáo",
  "credits.adsBody": "Mọi quảng cáo, banner hoặc pop-up (nếu xuất hiện khi xem) đến hoàn toàn từ các server nhúng bên thứ ba (VidLink, VidSrc, 2Embed, AutoEmbed) — nơi lưu trữ và phân phối nguồn phát. Dũng Cảm không chèn, không kiếm tiền từ và không kiểm soát được nội dung quảng cáo đó. Chúng tôi không hợp tác với bất kỳ đơn vị quảng cáo nào.",
  "donate.summary": "Ủng hộ chi phí vận hành",
  "donate.optional": "Tùy chọn",
  "donate.qrAlt": "Mã VietQR donate tới tài khoản TPBank số 10005104354",
  "donate.thanksH2": "Một lời cảm ơn nhỏ",
  "donate.body": "Nếu bạn muốn đóng góp cho chi phí duy trì không gian xem chung, bạn có thể quét VietQR này. Hoàn toàn tùy chọn; trải nghiệm xem không bị khóa hay thay đổi nếu không ủng hộ.",
  "donate.bankL": "Ngân hàng",
  "donate.accountL": "Số tài khoản",
};

const EN: Dict = {
  "app.loading": "Opening the viewing space…",
  "nav.home": "Home",
  "nav.discover": "Discover",
  "nav.credits": "Credits",
  "nav.aria": "Main navigation",
  "nav.openAria": "Open navigation",
  "nav.closeAria": "Close navigation",
  "wordmark.aria": "Dũng Cảm, home",
  "pill.public": "Public catalog",
  "lang.toggleTitle": "Switch language / Đổi ngôn ngữ",
  "hero.eyebrow": "Curated for you",
  "hero.slideEyebrow": "Today's picks",
  "hero.dotsAria": "Pick a suggested title",
  "action.play": "Play",
  "action.details": "Details",
  "note.demo": "Running the demo catalog because no TMDB token is configured. The interface and player still work normally.",
  "note.tmdb": "Metadata synced directly from TMDB. Playback runs through a multi-server iFrame system with 4 fallback sources.",
  "error.catalog": "Could not load the catalog. Please try again.",
  "search.eyebrow": "Discover",
  "search.h1": "Find the right movie for tonight.",
  "search.placeholder": "Type at least 2 characters",
  "search.start": "Start with a title, a genre or an idea.",
  "search.loading": "Searching the catalog…",
  "search.count": "{count} results for “{query}”",
  "search.none": "No matching results.",
  "live.placeholder": "Search movies…",
  "live.inputAria": "Search titles",
  "live.panelAria": "Suggested results",
  "live.loading": "Searching…",
  "live.none": "No matching results.",
  "type.series": "Series",
  "type.movie": "Movie",
  "detail.back": "Home",
  "detail.error": "This title could not be found.",
  "runtime.minutes": "{n} min",
  "runtime.unknown": "Runtime unavailable",
  "fav.add": "My list",
  "fav.saved": "Saved",
  "info.h": "Playback info",
  "info.sourceL": "Playback source",
  "info.sourceV": "Automatic multi-server iFrame",
  "info.catL": "Catalog",
  "info.catV": "TMDB synced",
  "info.switchL": "Failover",
  "info.switchV": "4 backup servers",
  "eps.h": "Episodes",
  "eps.sub": "Episodes are pulled automatically from TMDB. Pick one to start watching right away.",
  "eps.pickSeason": "Select season",
  "eps.perSeason": "{count} episodes",
  "eps.loading": "Loading episodes…",
  "eps.error": "Episodes could not be loaded right now.",
  "watch.preparing": "Preparing the player…",
  "watch.missing.h": "Content not found",
  "watch.missing.p": "This title does not exist in the TMDB catalog. Head back home or try another movie.",
  "watch.backHome": "Back to home",
  "rail.similar": "Related titles",
  "rail.similarAria": "Loading related titles",
  "rail.cast": "Cast",
  "rail.castLoadingAria": "Loading cast",
  "player.unavailable.h": "This title cannot be played",
  "player.unavailable.p": "This title is running in local demo mode without a TMDB ID, so server links cannot be built. Pick a title from the TMDB catalog instead.",
  "player.backDetail": "Back to details",
  "player.back": "Details",
  "player.episode": "Episode",
  "cinema.title": "Cinema mode: dim everything around the player",
  "cinema.label": "Cinema",
  "player.building": "Building playback links…",
  "player.via": "Playing via {server}. If playback fails or will not load, switch to another server below. Any ads you see are injected by the third-party embed source — not by Dũng Cảm.",
  "servers.aria": "Choose a playback server",
  "server.n": "Server {n}",
  "season.fallback": "Season {n}",
  "eps.errorSwitch": "Episodes could not be loaded. Try changing the season or server.",
  "eps.watchAria": "Watch episode {n}",
  "continue.rail": "Continue watching",
  "continue.aria": "Continue watching",
  "continue.clear": "Clear history",
  "credits.eyebrow": "Source transparency",
  "credits.h1": "Credits & how Dũng Cảm operates",
  "credits.intro": "Dũng Cảm is a public streaming PoC with no ads, pop-ups or auto-previews. TMDB is only used for required metadata on the backend; video plays through a multi-server iFrame system keyed by TMDB ID.",
  "credits.tmdbH2": "TMDB attribution",
  "credits.visitTmdb": "Visit The Movie Database",
  "credits.policyH2": "Playback policy",
  "credits.policyBody": "The player supports 4 fallback embed servers (VidLink, VidSrc, 2Embed, AutoEmbed) with URLs built automatically from the TMDB ID; you can swap servers or episodes inside the watch page without reloading. Vercel Functions are not used as a long-term video relay.",
  "credits.privacyH2": "Privacy",
  "credits.privacyBody": "Favorites and “Continue watching” live in your browser's LocalStorage. They are never sent to this PoC's catalog API.",
  "donate.summary": "Support operating costs",
  "donate.optional": "Optional",
  "donate.qrAlt": "VietQR code donating to TPBank account 10005104354",
  "donate.thanksH2": "A small thank you",
  "donate.body": "If you would like to contribute to keeping this shared viewing space alive, you can scan this VietQR. Completely optional; the experience is never locked or altered if you don't.",
  "donate.bankL": "Bank",
  "donate.accountL": "Account number",
};

const DICTS: Record<Locale, Dict> = { vi: VI, en: EN };

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LanguageContext = createContext<LanguageContextValue>({
  locale: "vi",
  setLocale: () => undefined,
  t: key => key,
});

function initialLocale(): Locale {
  if (typeof window === "undefined") return "vi";
  const stored = window.localStorage.getItem(LOCALE_KEY);
  if (stored === "vi" || stored === "en") return stored;
  const geo = window.localStorage.getItem(GEO_KEY);
  if (geo) return geo === "VN" ? "vi" : "en";
  return navigator.language?.toLowerCase().startsWith("vi") ? "vi" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.documentElement.lang = locale === "vi" ? "vi" : "en";
  }, [locale]);

  useEffect(() => {
    if (window.localStorage.getItem(LOCALE_KEY)) return;
    let cancelled = false;
    fetch("/api/locale")
      .then(response => (response.ok ? response.json() : null))
      .then((data: { country?: string | null; locale?: string } | null) => {
        if (cancelled || !data?.country) return;
        window.localStorage.setItem(GEO_KEY, data.country);
        setLocaleState(data.locale === "vi" ? "vi" : "en");
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  const value = useMemo<LanguageContextValue>(() => ({
    locale,
    setLocale(next) {
      window.localStorage.setItem(LOCALE_KEY, next);
      setLocaleState(next);
    },
    t(key, vars) {
      let text = DICTS[locale][key] ?? DICTS.vi[key] ?? key;
      if (vars) for (const [name, replacement] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(replacement));
      return text;
    },
  }), [locale]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
  return useContext(LanguageContext);
}
