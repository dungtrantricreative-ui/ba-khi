import express, { type Request, type Response } from "express";

const app = express();

const handler = async (req: Request, res: Response) => {
  const raw = req.headers["x-vercel-ip-country"];
  const header = Array.isArray(raw) ? raw[0] : raw;
  const country = typeof header === "string" && /^[A-Za-z]{2}$/.test(header)
    ? header.toUpperCase()
    : typeof req.query.country === "string" && /^[A-Za-z]{2}$/.test(req.query.country)
      ? req.query.country.toUpperCase()
      : null;
  return res.status(200).setHeader("cache-control", "no-store").json({ country, locale: country === "VN" ? "vi" : "en" });
};

app.get("/", handler);
app.get("/api/locale", handler);
app.get("/api/locale/", handler);

export default app;
