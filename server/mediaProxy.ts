import { Readable } from "node:stream";
import type { Request, Response } from "express";

/**
 * Safe pass-through for an MP4 that your group owns or has a written license to relay.
 * Do not mount this function on Vercel: Functions are not a long-lived media relay.
 * For HLS use an authorized direct/signed playlist URL from your video provider instead.
 */
export function resolveAllowedMediaUrl(rawUrl: string, configuredOrigins = process.env.OWNED_MEDIA_ORIGINS || "") {
  const allowed = configuredOrigins.split(",").map(value => value.trim()).filter(Boolean);
  if (!rawUrl || allowed.length === 0) return null;
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && allowed.includes(url.origin) ? url : null;
  } catch {
    return null;
  }
}

export async function pipeLicensedMp4(req: Request, res: Response, assetUrl: string) {
  if (process.env.VERCEL) {
    res.status(409).json({ error: "media_relay_disabled_on_vercel", detail: "Use a provider signed URL or official embed for playback." });
    return;
  }
  const target = resolveAllowedMediaUrl(assetUrl);
  if (!target) {
    res.status(403).json({ error: "origin_not_allowlisted" });
    return;
  }

  const headers = new Headers();
  for (const name of ["range", "if-range", "if-none-match", "if-modified-since"]) {
    const value = req.header(name);
    if (value) headers.set(name, value);
  }
  const upstream = await fetch(target, { headers, signal: AbortSignal.timeout(15000) });
  if (![200, 206, 304, 416].includes(upstream.status)) {
    res.status(502).json({ error: "licensed_upstream_unavailable" });
    return;
  }
  for (const name of ["accept-ranges", "content-range", "content-length", "content-type", "etag", "last-modified", "cache-control"]) {
    const value = upstream.headers.get(name);
    if (value) res.setHeader(name, value);
  }
  res.status(upstream.status);
  if (!upstream.body || req.method === "HEAD") {
    res.end();
    return;
  }
  Readable.fromWeb(upstream.body as import("stream/web").ReadableStream).pipe(res);
}
