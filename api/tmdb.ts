import express, { type Request, type Response } from "express";
import { findCredits, findEpisodes, findOfficialTrailer, findSimilar, findTitle, homeCatalog, searchTitles, type Locale } from "../server/catalog.js";

const app = express();
const titleId = (value: unknown) => typeof value === "string" && /^[a-z0-9_-]{1,100}$/i.test(value) ? value : null;
const positiveInteger = (value: unknown) => {
  const parsed = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};
const locale = (value: unknown): Locale => (Array.isArray(value) ? value[0] : value) === "en" ? "en" : "vi";

const handler = async (req: Request, res: Response) => {
  const lang = locale(req.query.lang);
  const resource = typeof req.query.resource === "string" ? req.query.resource : "home";
  if (resource === "home") return res.status(200).json(await homeCatalog(lang));
  if (resource === "search") {
    const query = typeof req.query.query === "string" ? req.query.query.slice(0, 80) : "";
    return res.status(200).json(await searchTitles(query, lang));
  }

  const id = titleId(req.query.id);
  if (!id) return res.status(400).json({ error: "invalid_title_id" });
  if (resource === "title") {
    const title = await findTitle(id, lang);
    return title ? res.status(200).json(title) : res.status(404).json({ error: "title_not_found" });
  }
  if (resource === "episodes") {
    const seasonNumber = positiveInteger(req.query.season);
    if (!seasonNumber) return res.status(400).json({ error: "invalid_season" });
    return res.status(200).json(await findEpisodes(id, seasonNumber, lang));
  }
  if (resource === "credits") return res.status(200).json(await findCredits(id, lang));
  if (resource === "similar") return res.status(200).json(await findSimilar(id, lang));
  if (resource === "trailer") {
    const trailer = await findOfficialTrailer(id, lang);
    return trailer ? res.status(200).json(trailer) : res.status(404).json({ error: "official_trailer_not_found" });
  }
  return res.status(400).json({ error: "unsupported_resource" });
};

app.get("/", handler);
app.get("/api/tmdb", handler);
app.get("/api/tmdb/", handler);

export default app;
