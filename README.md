# Dũng Cảm — Netflix Minimalist PoC

Dũng Cảm là một Proof of Concept xem phim công khai với UI tối giản, không quảng cáo, không pop-up và không tự phát preview. Dự án dùng **React + TypeScript + Tailwind 4**, **hls.js**, **Express/tRPC** và có cấu hình triển khai trên **Vercel**.

**Production URL mục tiêu:** [https://phimdungcam.vercel.com](https://phimdungcam.vercel.com).

> **Giới hạn nội dung:** PoC chỉ cấp playback cho asset trong registry đã được phê duyệt. Không có scraper, extractor on-demand, CORS bypass, giả mạo Referer/Origin/User-Agent, hoặc relay video dài hạn từ nguồn bên thứ ba. Dùng direct/signed HLS URL của provider được phép, official embed, hoặc media do nhóm sở hữu/có giấy phép.

## Tính năng có trong PoC

| Nhóm | Nội dung |
|---|---|
| UX | Header responsive, hero tĩnh, rails CSS Scroll Snap, search debounce, detail, credits, reduced motion và keyboard focus |
| Access | Catalog public; playback chỉ trả source cho asset có trạng thái `approved` trong registry server-side |
| Catalog | TMDB backend cho trending, movie/TV detail, season/episode; chuẩn hóa field và cache in-memory TTL; fallback demo khi chưa có token |
| Player | Official YouTube trailer/preview từ TMDB, hoặc HTML5 video + `hls.js` cho signed HLS CDN được phép; native-HLS Safari, WebVTT và cleanup player |
| Memory | HLS buffer tối đa 30 giây/30 MB, back buffer 30 giây; LocalStorage giới hạn 30 item và dọn item quá 90 ngày |
| Vercel | Static SPA trong `dist/public`; API serverless gồm `api/trpc/[...trpc].ts`, `api/tmdb.ts` và `api/get-stream.ts`; Vercel không relay stream dài |

## Cấu trúc chính

```text
client/
  src/components/        # Header, rail, card, HLS player
  src/pages/             # Home, Search, Detail, Watch, Credits
  src/lib/localLibrary.ts# Favorites + Continue Watching (LocalStorage)
  public/captions/       # WebVTT demo
server/
  catalog.ts             # TMDB trending/title/season/episode adapter + in-memory TTL cache
  approvedAssets.ts      # Registry server-side cho direct/signed HLS hoặc official embed đã phê duyệt
  mediaProxy.ts          # MP4 Range proxy allowlist, intentionally disabled on Vercel
  routers.ts             # tRPC catalog/episodes/playback API
  api/trpc/[...trpc].ts    # Vercel serverless tRPC adapter
api/get-stream.ts          # REST lookup approved-only cho player/external integration
api/tmdb.ts                # Serverless TMDB façade: home/search/title/episodes/trailer
docs/environment.md      # Danh sách environment variables
vercel.json              # Build output và SPA rewrites
```

## Chạy local

Yêu cầu Node.js 22+ và pnpm. Khi phát triển mà không thiết lập environment variable, catalog demo sẽ hiển thị.

```bash
pnpm install
pnpm dev
```

Nếu bạn cần dùng npm, build trước khi chạy production:

```bash
npm install
npm run build
npm start
```

Mở URL do dev server hiển thị, rồi chọn **Dune: Part Two** để kiểm thử luồng HLS demo. Stream HLS công khai trong registry chỉ phục vụ kiểm thử player, không phải nguồn nội dung ứng dụng.

## Cấu hình môi trường

Danh sách biến đầy đủ và template không chứa credential có trong [`docs/environment.md`](docs/environment.md). `TMDB_READ_ACCESS_TOKEN` chỉ được đọc server-side trong `server/catalog.ts` và `api/tmdb.ts`; không xuất hiện trong bundle frontend. Backend tự đồng bộ trending, movie/TV detail, season, episode và official trailer key; frontend chỉ nhận metadata, poster/backdrop, season/episode, trailer key và trạng thái asset cần để render UI.

Nền tảng quản lý dự án không cho commit `.env`/`.env.example`. Vì thế file [`docs/environment.md`](docs/environment.md) là environment template có thể copy vào dashboard Vercel hoặc cấu hình local. Không commit token/passcode thật vào repository.

## Triển khai Vercel

1. Push repository lên GitHub/GitLab/Bitbucket và import vào Vercel.
2. Xác nhận Build Command là `pnpm build`, Output Directory là `dist/public`.
3. Trong **Settings → Environment Variables**, kiểm tra `TMDB_READ_ACCESS_TOKEN`; thêm `APPROVED_PLAYBACK_REGISTRY_JSON` khi có direct/signed HLS URL hoặc official embed được phép.
4. Deploy với project slug `phimdungcam` để nhận URL `https://phimdungcam.vercel.com` (nếu slug này còn khả dụng trong Vercel account của bạn). Route client `/search`, `/credits`, `/title/:id`, `/watch/:id` được rewrite về SPA; `/api/trpc/*`, `/api/tmdb` và `/api/get-stream` chạy qua Serverless Functions.
5. Sau deployment, kiểm tra catalog tự lấy TMDB metadata; series hiển thị season/episode; `/api/get-stream?id=<title-id>` chỉ trả source cho title/episode approved; các asset khác trả `403`.

Không lưu video, playlist HLS, segment `.ts`, subtitle lớn hay asset media trong repository/Vercel static output. Hãy dùng video provider có signed URL hoặc official embed. Nếu self-host, cấp direct HLS URL qua CDN/origin được phép.

## Playback registry và entitlement

`server/approvedAssets.ts` chứa registry tường minh theo `titleId` hoặc `titleId:s<season>:e<episode>`. Khi user gọi `playback.forTitle` hoặc `/api/get-stream`, backend chỉ trả source khi registry có entry approved tương ứng.

Trong triển khai thật, thay entry demo bằng URL trực tiếp/signed URL của provider video bạn kiểm soát. Với official embed, đặt `kind: "embed"` và URL embed được provider cho phép. Không thêm URL được người dùng gửi lên, không thêm URL từ website không có quyền và không để client quyết định status approved.

## Proxy MP4 Range (chỉ ngoài Vercel)

`server/mediaProxy.ts` có hàm `pipeLicensedMp4()` để pass-through MP4 của nhóm sở hữu/có giấy phép. Hàm này chỉ nhận URL sau khi đã qua `OWNED_MEDIA_ORIGINS` allowlist, forward HTTP Range cần thiết và không ghi temp file ra đĩa. Khi `VERCEL` tồn tại, nó chủ động trả lỗi `media_relay_disabled_on_vercel`.

Không mount endpoint proxy dạng `?url=` và không dùng proxy để vượt CORS, CAPTCHA, hotlink protection hoặc cơ chế truy cập của nền tảng khác. Với HLS, dùng signed/direct playlist URL từ video provider thay vì rewrite manifest/segments bằng Vercel Function.

## Kiểm thử

```bash
pnpm check
pnpm test
pnpm build
```

Các tests kiểm tra TMDB token, catalog/fallback, title/episode normalization và registry asset approved-only.

## TMDB attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Khi bật TMDB, giữ màn hình `/credits` trong production và dùng logo TMDB được phê duyệt nếu bạn bổ sung logo.
