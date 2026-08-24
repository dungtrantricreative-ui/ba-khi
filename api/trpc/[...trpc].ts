import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers.js";
import { createContext } from "../../server/_core/context.js";

// Vercel serverless entrypoint. It serves short-lived API requests only;
// playback is always an authorized direct/signed URL or official embed.
const app = express();
app.use(express.json({ limit: "256kb" }));
const trpc = createExpressMiddleware({ router: appRouter, createContext });
app.use("/api/trpc", trpc);
app.use("/", trpc);

export default app;
