import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { cacheInfo, findCredits, findEpisodes, findOfficialTrailer, findSimilar, findTitle, homeCatalog, searchTitles } from "./catalog.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, router } from "./_core/trpc.js";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  catalog: router({
    home: publicProcedure.input(z.object({ locale: z.enum(["vi", "en"]).default("vi") })).query(({ input }) => homeCatalog(input.locale)),
    byId: publicProcedure.input(z.object({ id: z.string().min(1).max(100), locale: z.enum(["vi", "en"]).default("vi") })).query(async ({ input }) => {
      const title = await findTitle(input.id, input.locale);
      if (!title) throw new TRPCError({ code: "NOT_FOUND", message: input.locale === "vi" ? "Không tìm thấy nội dung." : "Content not found." });
      return title;
    }),
    search: publicProcedure.input(z.object({ query: z.string().max(80), locale: z.enum(["vi", "en"]).default("vi") })).query(({ input }) => searchTitles(input.query, input.locale)),
    episodes: publicProcedure.input(z.object({ id: z.string().min(1).max(100), seasonNumber: z.number().int().min(1).max(100), locale: z.enum(["vi", "en"]).default("vi") })).query(({ input }) => findEpisodes(input.id, input.seasonNumber, input.locale)),
    credits: publicProcedure.input(z.object({ id: z.string().min(1).max(100), locale: z.enum(["vi", "en"]).default("vi") })).query(({ input }) => findCredits(input.id, input.locale)),
    similar: publicProcedure.input(z.object({ id: z.string().min(1).max(100), locale: z.enum(["vi", "en"]).default("vi") })).query(({ input }) => findSimilar(input.id, input.locale)),
    trailer: publicProcedure.input(z.object({ id: z.string().min(1).max(100), locale: z.enum(["vi", "en"]).default("vi") })).query(({ input }) => findOfficialTrailer(input.id, input.locale)),
    config: publicProcedure.query(() => cacheInfo()),
  }),
});

export type AppRouter = typeof appRouter;
