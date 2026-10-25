/**
 * MCP server for www.asgerami.com (Streamable HTTP transport, stateless).
 *
 * POST a JSON-RPC 2.0 message: `initialize`, then `tools/list` and
 * `tools/call`. Each POST is answered with a single JSON response (the
 * transport allows that instead of an SSE stream), notifications get 202.
 *
 * The data is the site's own public index at /data/index.json, built from
 * the same content as the pages, so the tools can never say something the
 * site does not. Self-contained on purpose: Vercel bundles each file in api/
 * as its own function.
 */

const SITE = "https://www.asgerami.com";
const SERVER = { name: "asgerami.com", title: "Amir Aman's portfolio", version: "1.0.0" };
const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

type Page = {
  path: string;
  url: string;
  markdownUrl: string;
  type: "home" | "page" | "listing" | "project" | "post";
  title: string;
  description: string;
  lastmod: string;
  markdown: string;
};
type Project = {
  title: string;
  description: string;
  kind: string;
  year: string | null;
  url: string | null;
  live: string | null;
  source: string | null;
  stack: string[];
};
type SiteIndex = {
  site: { name: string; url: string; description: string };
  person: {
    name: string;
    role: string;
    email: string;
    company: { name: string; url: string; description: string };
    profiles: Record<string, string>;
  };
  projects: Project[];
  pages: Page[];
};

// ---------------------------------------------------------------- data

let cached: { at: number; origin: string; index: SiteIndex } | null = null;

async function loadIndex(origin: string): Promise<SiteIndex> {
  if (cached && cached.origin === origin && Date.now() - cached.at < 5 * 60_000) return cached.index;
  const res = await fetch(new URL("/data/index.json", origin));
  if (!res.ok) throw new Error(`site index unavailable (${res.status})`);
  const index = (await res.json()) as SiteIndex;
  cached = { at: Date.now(), origin, index };
  return index;
}

/** "/about", "about", "about.md", a full URL: all mean "/about/". */
function normalisePath(input: string): string {
  let path = input.trim();
  try {
    path = new URL(path).pathname;
  } catch {
    // not a URL
  }
  path = path.replace(/\.md$/, "").replace(/^\/*/, "/").replace(/\/+$/, "");
  if (path === "" || path === "/index") return "/";
  return `${path}/`;
}

function snippet(text: string, terms: string[], width = 160): string {
  const lower = text.toLowerCase();
  const hit = terms.map((t) => lower.indexOf(t)).filter((i) => i >= 0).sort((a, b) => a - b)[0] ?? 0;
  const start = Math.max(0, hit - width / 2);
  const clean = text.slice(start, start + width).replace(/\s+/g, " ").trim();
  return `${start > 0 ? "…" : ""}${clean}${start + width < text.length ? "…" : ""}`;
}

// --------------------------------------------------------------- tools

const TOOLS = [
  {
    name: "search_site",
    title: "Search the site",
    description:
      "Search Amir Aman's portfolio: projects, case studies, experience, essays and the about, contact and privacy pages. Returns the best-matching pages with links.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keywords, e.g. 'chess engine', 'MCP', 'Telegram'" },
        limit: { type: "integer", minimum: 1, maximum: 20, default: 5 },
      },
      required: ["query"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_page",
    title: "Read a page",
    description:
      "Return one page of the site as Markdown. Accepts a path ('/about', '/projects/driftwatch') or a full URL.",
    inputSchema: {
      type: "object",
      properties: { path: { type: "string", description: "Path or URL of the page" } },
      required: ["path"],
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "list_projects",
    title: "List projects",
    description:
      "List the projects Amir Aman has shipped, newest first, optionally filtered by kind: featured, client, personal or app.",
    inputSchema: {
      type: "object",
      properties: { kind: { type: "string", enum: ["featured", "client", "personal", "app"] } },
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "list_writing",
    title: "List essays",
    description: "List Amir Aman's essays and notes, newest first, with links.",
    inputSchema: { type: "object", properties: {} },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "get_contact",
    title: "Get contact details",
    description:
      "How to reach Amir Aman (email, Telegram, LinkedIn, GitHub, X) for freelance work, roles or questions. Pass a subject and message to get a ready-to-send mailto link.",
    inputSchema: {
      type: "object",
      properties: {
        subject: { type: "string", description: "Email subject, optional" },
        message: { type: "string", description: "Email body, optional" },
      },
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
] as const;

const PROFILE_LABELS: Record<string, string> = {
  github: "GitHub",
  x: "X",
  linkedin: "LinkedIn",
  telegram: "Telegram",
};

type ToolResult = { content: { type: "text"; text: string }[]; isError?: boolean };
const text = (t: string, isError = false): ToolResult => ({
  content: [{ type: "text", text: t }],
  ...(isError && { isError }),
});

async function callTool(name: string, args: Record<string, unknown>, origin: string): Promise<ToolResult> {
  const index = await loadIndex(origin);

  switch (name) {
    case "search_site": {
      const query = String(args.query ?? "").trim().toLowerCase();
      if (!query) return text("Provide a non-empty `query`.", true);
      const limit = Math.min(20, Math.max(1, Number(args.limit) || 5));
      const terms = query.split(/\s+/).filter(Boolean);
      const scored = index.pages
        .map((page) => {
          const title = page.title.toLowerCase();
          const description = page.description.toLowerCase();
          const body = page.markdown.toLowerCase();
          let score = 0;
          for (const t of terms) {
            if (title.includes(t)) score += 6;
            if (description.includes(t)) score += 3;
            score += Math.min(5, body.split(t).length - 1);
          }
          if (title.includes(query)) score += 6;
          // Overview pages mention everything; rank the page that is about it higher
          if (page.type === "home" || page.type === "listing") score *= 0.5;
          return { page, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      if (!scored.length) {
        return text(`No pages match "${query}". Try list_projects or list_writing, or see ${SITE}/sitemap.xml.`);
      }
      return text(
        scored
          .map(
            ({ page }, i) =>
              `${i + 1}. ${page.title} (${page.type})\n   ${page.url}\n   ${snippet(page.markdown, terms)}`,
          )
          .join("\n\n"),
      );
    }

    case "get_page": {
      const path = normalisePath(String(args.path ?? ""));
      const page = index.pages.find((p) => p.path === path);
      if (!page) {
        const known = index.pages.map((p) => p.path).join(", ");
        return text(`No page at ${path}. Known pages: ${known}`, true);
      }
      return text(page.markdown);
    }

    case "list_projects": {
      const kind = args.kind ? String(args.kind) : null;
      const projects = index.projects.filter((p) => !kind || p.kind === kind);
      if (!projects.length) return text(`No projects of kind "${kind}".`, true);
      return text(
        projects
          .map((p) =>
            [
              `- ${p.title} (${p.year ?? "n.d."}, ${p.kind}): ${p.description}`,
              p.url && `  Page: ${p.url}`,
              p.live && p.live !== p.url && `  Live: ${p.live}`,
              p.source && `  Source: ${p.source}`,
              p.stack.length && `  Stack: ${p.stack.join(", ")}`,
            ]
              .filter(Boolean)
              .join("\n"),
          )
          .join("\n"),
      );
    }

    case "list_writing": {
      const posts = index.pages.filter((p) => p.type === "post");
      return text(posts.map((p) => `- ${p.title}\n  ${p.url}\n  ${p.description}`).join("\n"));
    }

    case "get_contact": {
      const { person } = index;
      const subject = args.subject ? String(args.subject) : "";
      const message = args.message ? String(args.message) : "";
      const query = new URLSearchParams({ ...(subject && { subject }), ...(message && { body: message }) })
        .toString()
        .replace(/\+/g, "%20");
      const mailto = `mailto:${person.email}${query ? `?${query}` : ""}`;
      return text(
        [
          `${person.name}, ${person.role}, founder of ${person.company.name} (${person.company.url}).`,
          `Based in Ethiopia (GMT+3); usually replies to email within a day or two.`,
          ``,
          `Email: ${person.email}`,
          ...Object.entries(person.profiles).map(([k, v]) => `${PROFILE_LABELS[k] ?? k}: ${v}`),
          `Contact page: ${SITE}/contact/`,
          ``,
          `Ready-to-send email link: ${mailto}`,
        ].join("\n"),
      );
    }

    default:
      throw new RpcError(-32602, `Unknown tool: ${name}`);
  }
}

// ------------------------------------------------------------ JSON-RPC

class RpcError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
  }
}

type RpcMessage = { jsonrpc?: string; id?: string | number | null; method?: string; params?: any };

async function handle(message: RpcMessage, origin: string): Promise<object | null> {
  const isRequest = message.id !== undefined && message.id !== null;
  try {
    if (message.jsonrpc !== "2.0" || typeof message.method !== "string") {
      throw new RpcError(-32600, "Invalid Request");
    }
    let result: unknown;
    switch (message.method) {
      case "initialize": {
        const requested = message.params?.protocolVersion;
        result = {
          protocolVersion: PROTOCOL_VERSIONS.includes(requested) ? requested : PROTOCOL_VERSIONS[0],
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER,
          instructions:
            "Read-only access to Amir Aman's portfolio. Use search_site to find pages, get_page to read one as Markdown, list_projects and list_writing for overviews, and get_contact for contact details.",
        };
        break;
      }
      case "ping":
        result = {};
        break;
      case "tools/list":
        result = { tools: TOOLS };
        break;
      case "tools/call": {
        const name = message.params?.name;
        if (typeof name !== "string") throw new RpcError(-32602, "tools/call needs params.name");
        result = await callTool(name, message.params?.arguments ?? {}, origin);
        break;
      }
      default:
        if (message.method.startsWith("notifications/")) return null;
        throw new RpcError(-32601, `Method not found: ${message.method}`);
    }
    return isRequest ? { jsonrpc: "2.0", id: message.id, result } : null;
  } catch (err) {
    if (!isRequest && !(err instanceof RpcError && err.code === -32600)) return null;
    const error =
      err instanceof RpcError
        ? { code: err.code, message: err.message }
        : { code: -32603, message: err instanceof Error ? err.message : "Internal error" };
    return { jsonrpc: "2.0", id: message.id ?? null, error };
  }
}

// ---------------------------------------------------------------- HTTP

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version",
  "Access-Control-Expose-Headers": "Mcp-Session-Id",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS },
  });

export async function POST(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin || SITE;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, 400);
  }

  if (Array.isArray(payload)) {
    if (!payload.length) return json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } }, 400);
    const replies = (await Promise.all(payload.map((m) => handle(m, origin)))).filter(Boolean);
    return replies.length ? json(replies) : new Response(null, { status: 202, headers: CORS });
  }

  const reply = await handle(payload as RpcMessage, origin);
  return reply ? json(reply) : new Response(null, { status: 202, headers: CORS });
}

/** No server-initiated stream: this server only answers POSTs. */
export function GET(): Response {
  return new Response(
    JSON.stringify({
      name: SERVER.name,
      transport: "streamable-http",
      usage: "POST JSON-RPC 2.0 messages (initialize, tools/list, tools/call) to this URL.",
    }),
    {
      status: 405,
      headers: { "Content-Type": "application/json", Allow: "POST, OPTIONS", ...CORS },
    },
  );
}

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: CORS });
}
