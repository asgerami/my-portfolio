/**
 * Vercel Routing Middleware: content negotiation for agents.
 *
 * Every page has a static Markdown twin (built by src/utils/markdown.ts). A
 * request that prefers `text/markdown` gets that twin from the page's own URL,
 * so `GET /` with `Accept: text/markdown` returns /index.md. A Markdown request
 * for a page that does not exist gets a 404 with a short Markdown body saying
 * where to look instead. Everything else, including every browser request,
 * passes straight through to the static site untouched.
 */
import { mdPathFor } from "./src/utils/mdpath";

export const config = {
  // Page URLs only: skip files with an extension, built assets and functions.
  matcher: ["/((?!api/|assets/|_vercel/|.*\\.[A-Za-z0-9]+$).*)"],
};

/** Continue to the static file, as `next()` from @vercel/functions does. */
const next = () => new Response(null, { headers: { "x-middleware-next": "1" } });

/** q-value of a media type in an Accept header (0 when absent). */
function quality(accept: string, type: string): number {
  for (const part of accept.split(",")) {
    const [media, ...params] = part.trim().split(";");
    if (media.trim().toLowerCase() !== type) continue;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    return q ? Number(q.slice(2)) || 0 : 1;
  }
  return 0;
}

export function wantsMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const markdown = quality(accept, "text/markdown");
  return markdown > 0 && markdown >= quality(accept, "text/html");
}

const MARKDOWN_HEADERS = {
  "Content-Type": "text/markdown; charset=utf-8",
  Vary: "Accept",
  "Access-Control-Allow-Origin": "*",
};

export function notFoundMarkdown(origin: string, pathname: string): string {
  const at = (path: string) => new URL(path, origin).href;
  return `# Page not found

There is no page at \`${pathname}\` on this site.

## Where to look next

- [Home](${at("/index.md")}): who I am and what I'm working on
- [Projects](${at("/projects.md")}): everything I have shipped
- [Writing](${at("/blog.md")}): essays and notes
- [About](${at("/about.md")}) and [Contact](${at("/contact.md")})
- [llms.txt](${at("/llms.txt")}): a summary of the whole site, with links
- [Sitemap](${at("/sitemap.xml")}): every page that exists
- MCP server at ${at("/api/mcp")}: the \`search_site\` tool finds pages by keyword
`;
}

export default async function middleware(request: Request): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") return next();
  if (!wantsMarkdown(request.headers.get("accept"))) return next();

  const url = new URL(request.url);
  const twin = await fetch(new URL(mdPathFor(url.pathname), url), {
    headers: { accept: "text/markdown" },
  });
  if (twin.ok) {
    return new Response(request.method === "HEAD" ? null : twin.body, {
      status: 200,
      headers: {
        ...MARKDOWN_HEADERS,
        "Cache-Control": "public, max-age=0, must-revalidate",
        Link: `<${new URL(url.pathname, url).href}>; rel="canonical"`,
      },
    });
  }

  // No twin. A real page without one (an app's privacy policy) still gets
  // its HTML; only a page that does not exist at all answers 404.
  const page = await fetch(url, { method: "HEAD", headers: { accept: "text/html" } });
  if (page.ok) return next();

  return new Response(request.method === "HEAD" ? null : notFoundMarkdown(url.origin, url.pathname), {
    status: 404,
    headers: { ...MARKDOWN_HEADERS, "Cache-Control": "no-store" },
  });
}
