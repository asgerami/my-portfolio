import type { APIRoute } from "astro";
import { SPRITE } from "../utils/stack";

/**
 * One SVG sprite for every brand and social mark. Pages reference symbols
 * with <use href="/icons.svg#i-react">, so the path data is downloaded and
 * cached once instead of being repeated inline in every page's HTML.
 */
export const GET: APIRoute = () =>
  new Response(
    `<svg xmlns="http://www.w3.org/2000/svg">${SPRITE.map(
      ({ id, path }) => `<symbol id="${id}" viewBox="0 0 24 24"><path d="${path}"/></symbol>`,
    ).join("")}</svg>`,
    { headers: { "Content-Type": "image/svg+xml" } },
  );
