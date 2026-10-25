import type { APIRoute } from "astro";
import { paletteGroups } from "../utils/palette";

/** Command palette entries, fetched the first time the palette opens. */
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await paletteGroups()), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
