import type { APIRoute } from "astro";
import { SITE_URL } from "../consts";
import { allDocs } from "../utils/markdown";

/**
 * Every public page with its <lastmod>, at the conventional /sitemap.xml.
 * Pages come from the same registry as the Markdown twins; the app privacy
 * policies, which have no twin, are listed by hand.
 */
const APP_POLICIES = ["/hours-pay/privacy/", "/examen-cdl/privacy/", "/quadrille/privacy.html"];

export const GET: APIRoute = async () => {
  const built = new Date();
  const entries = [
    ...(await allDocs()).map((d) => ({ path: d.path, lastmod: d.lastmod })),
    ...APP_POLICIES.map((path) => ({ path, lastmod: built })),
  ];
  const urls = entries
    .map(
      ({ path, lastmod }) =>
        `  <url>\n    <loc>${new URL(path, SITE_URL).href}</loc>\n    <lastmod>${lastmod
          .toISOString()
          .slice(0, 10)}</lastmod>\n  </url>`,
    )
    .join("\n");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
