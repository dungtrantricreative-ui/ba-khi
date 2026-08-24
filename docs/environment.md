# Environment variables

The managed project environment does not permit committing `.env` or `.env.example` files. Configure these variables in the Vercel dashboard (Project → Settings → Environment Variables) or locally in an untracked shell environment.

| Variable | Required | Purpose |
|---|---:|---|
| `TMDB_READ_ACCESS_TOKEN` | Optional | Server-side TMDB Read Access Token. Without it, the app uses its local demo catalog. |
| `TMDB_CACHE_TTL_MS` | Optional | In-memory TMDB cache TTL; default is 14,400,000 ms (4 hours). |
| `APPROVED_PLAYBACK_REGISTRY_JSON` | Optional | JSON server-side mapping title/episode id to approved direct/signed HLS, MP4, or official embed source. Never set this from client input. |
| `OWNED_MEDIA_ORIGINS` | Optional | Comma-separated HTTPS origin allowlist used only by the off-Vercel licensed-MP4 relay module. |

The Vercel dashboard variable names map one-for-one to the values in `server/catalog.ts`, `server/approvedAssets.ts` and `server/mediaProxy.ts`. No passcode or session secret is required in public mode.

Use title keys such as `tmdb-movie-123` and episode keys such as `tmdb-tv-456:s1:e2`. Example value for a provider you own or are licensed to distribute through:

```json
{
  "tmdb-movie-123": {
    "kind": "hls",
    "url": "https://cdn.example.com/films/123/master.m3u8?signature=...",
    "captionsUrl": "https://cdn.example.com/films/123/vi.vtt?signature=...",
    "providerLabel": "Dũng Cảm licensed CDN"
  },
  "tmdb-tv-456:s1:e2": {
    "kind": "embed",
    "url": "https://video-provider.example.com/embed/approved-episode-2",
    "providerLabel": "Official provider embed"
  }
}
```

The Vercel function returns only entries from this registry through `GET /api/get-stream?id=<title-id>&season=<n>&episode=<n>` or the matching tRPC `playback.forTitle` endpoint. It does not accept arbitrary URLs, fetch third-party sites, rewrite manifests/segments, or bypass CORS/403 restrictions.

## Serverless TMDB façade

The React client normally uses tRPC. For a serverless-friendly REST integration, `GET /api/tmdb` returns only the normalized UI fields and never returns `TMDB_READ_ACCESS_TOKEN` or raw provider payloads.

| Request | Response |
|---|---|
| `/api/tmdb?resource=home` | Trending movie/TV rails and hero metadata. |
| `/api/tmdb?resource=search&query=...` | Normalized search titles. |
| `/api/tmdb?resource=title&id=tmdb-movie-123` | One normalized movie/TV title. |
| `/api/tmdb?resource=episodes&id=tmdb-tv-456&season=1` | Normalized season episodes. |
| `/api/tmdb?resource=trailer&id=tmdb-movie-123` | An official YouTube Trailer/Teaser key, if TMDB provides one. |

At `/watch/:id`, Dũng Cảm chooses a signed/direct HLS or official provider embed from the approved registry first. If no such asset exists, it falls back only to the official YouTube preview returned by TMDB; it does not present that preview as a full movie or episode.
