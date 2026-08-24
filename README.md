# DŨNG CẢM — Xem Phim Phải Dũng Cảm

Nền tảng xem phim trực tuyến giao diện **Liquid Glass** trên nền Netflix dark, phát qua hệ thống **đa server iFrame** (4 nguồn dự phòng) theo TMDB ID.

## Tính năng

- 🎬 **Multi-Server Player**: VidLink · VidSrc · 2Embed · AutoEmbed — tự dựng URL theo TMDB ID, đổi server/tập không reload
- 🛡️ **Smart Shield**: lớp khiên chặn pop-up — lần chạm đầu hấp thụ trigger quảng cáo ẩn của iframe, lần 2 phát thật
- 🔒 **Sandbox chặt chẽ**: `allow-scripts allow-same-origin allow-forms allow-presentation` — loại bỏ `allow-popups` và `allow-top-navigation` để chặn triệt để pop-up & chuyển hướng trang
- 🔄 **Auto-failover**: server lỗi → tự chuyển server kế tiếp + toast thông báo; tab server cảnh báo vàng
- 🌐 **Song ngữ VI/EN theo IP**: VN → tiếng Việt, quốc gia khác → English (header `x-vercel-ip-country`), kèm nút đổi tay; metadata TMDB đổi theo ngôn ngữ
- 🎞️ **Hero carousel**: banner tự cuộn 6 phim đề xuất mỗi 7 giây, chấm điều hướng
- 🗂️ **Rails**: Đang được quan tâm → Phim nổi bật → Series phổ biến → Phim Hàn → Phim Thái → Phim Trung → Anime
- ▶️ **Tiếp tục xem** (localStorage v2), **Instant Search** (debounce 250ms), **Cinema Mode**, **Skeleton shimmer**, **Cast & Similar** từ TMDB
- 💳 Donate VietQR TPBank (tạo động từ img.vietqr.io)

## Công nghệ

React 19 · TypeScript · Tailwind v4 · tRPC · Express · TMDB API · Vercel Functions · Vite 7

## Chạy local

```bash
pnpm install
pnpm dev      # dev server
pnpm build    # production build
pnpm check    # typecheck
```

## Deploy

Vercel Git Integration: connect repo này → mỗi `git push` tự động deploy production.

> ⚠️ Repo **private** vì chứa TMDB read token nhúng trong `server/catalog.ts` (`BUNDLED_TMDB_READ_TOKEN`). Không chuyển sang public nếu chưa chuyển token sang environment variable.

## Cấu trúc chính

```
client/src/components/MultiServerPlayer.tsx   # player + shield + failover
client/src/lib/embedServers.ts                # 4 server + parseTitleId
client/src/lib/i18n.tsx                       # provider VI/EN + geo detect
server/catalog.ts                             # TMDB facade + cache + rails
api/tmdb.ts, api/trpc/[...trpc].ts            # Vercel functions (ESM .js imports)
api/locale.ts                                 # geo → locale theo IP
```
