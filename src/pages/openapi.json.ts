import type { APIRoute } from "astro";
import { EMAIL, NAME, SITE_URL } from "../consts";

/**
 * OpenAPI 3.1 description of the site's public, read-only machine interface:
 * the JSON index, the Markdown and text views, and the MCP endpoint.
 */
const text = (description: string, type = "text/plain") => ({
  description,
  content: { [type]: { schema: { type: "string" } } },
});

const spec = {
  openapi: "3.1.0",
  info: {
    title: `${NAME}: site API`,
    version: "1.0.0",
    summary: "Read-only access to the portfolio, writing and contact details of Amir Aman.",
    description:
      "Everything on www.asgerami.com is public. Every page also has a Markdown version at the same path with `.md` added (`/index.md` for the homepage), and any page URL returns Markdown when requested with `Accept: text/markdown`.",
    contact: { name: NAME, email: EMAIL, url: `${SITE_URL}/contact/` },
  },
  servers: [{ url: SITE_URL }],
  paths: {
    "/data/index.json": {
      get: {
        operationId: "getSiteIndex",
        summary: "The whole site as JSON: owner, projects, and every page with its Markdown",
        responses: {
          "200": {
            description: "Site index",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SiteIndex" } } },
          },
        },
      },
    },
    "/index.md": {
      get: {
        operationId: "getHomeMarkdown",
        summary: "The homepage as Markdown (every page has a twin at <path>.md)",
        responses: { "200": text("Markdown", "text/markdown") },
      },
    },
    "/llms.txt": {
      get: {
        operationId: "getLlmsTxt",
        summary: "Summary for language models (llmstxt.org)",
        responses: { "200": text("Markdown summary with links") },
      },
    },
    "/llms-full.txt": {
      get: {
        operationId: "getLlmsFullTxt",
        summary: "Every case study, role and essay as one Markdown document",
        responses: { "200": text("Full text") },
      },
    },
    "/sitemap.xml": {
      get: {
        operationId: "getSitemap",
        summary: "Every public page with its last-modified date",
        responses: { "200": text("Sitemap", "application/xml") },
      },
    },
    "/rss.xml": {
      get: {
        operationId: "getRss",
        summary: "RSS feed of the writing",
        responses: { "200": text("RSS 2.0", "application/rss+xml") },
      },
    },
    "/api/mcp": {
      post: {
        operationId: "mcp",
        summary: "Model Context Protocol server (Streamable HTTP, JSON-RPC 2.0)",
        description:
          "Tools: search_site, get_page, list_projects, list_writing, get_contact. Send `initialize`, then `tools/list` and `tools/call`.",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/JsonRpcRequest" } } },
        },
        responses: {
          "200": {
            description: "JSON-RPC response",
            content: { "application/json": { schema: { type: "object" } } },
          },
          "202": { description: "Notification accepted" },
        },
      },
    },
  },
  components: {
    schemas: {
      JsonRpcRequest: {
        type: "object",
        required: ["jsonrpc", "method"],
        properties: {
          jsonrpc: { const: "2.0" },
          id: { type: ["string", "integer"] },
          method: { type: "string", examples: ["initialize", "tools/list", "tools/call"] },
          params: { type: "object" },
        },
      },
      Page: {
        type: "object",
        properties: {
          path: { type: "string" },
          url: { type: "string", format: "uri" },
          markdownUrl: { type: "string", format: "uri" },
          type: { enum: ["home", "page", "listing", "project", "post"] },
          title: { type: "string" },
          description: { type: "string" },
          lastmod: { type: "string", format: "date" },
          markdown: { type: "string" },
        },
      },
      Project: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          kind: { enum: ["featured", "client", "personal", "app"] },
          year: { type: ["string", "null"] },
          url: { type: ["string", "null"], format: "uri" },
          live: { type: ["string", "null"], format: "uri" },
          source: { type: ["string", "null"], format: "uri" },
          stack: { type: "array", items: { type: "string" } },
        },
      },
      SiteIndex: {
        type: "object",
        properties: {
          site: { type: "object" },
          person: { type: "object" },
          generated: { type: "string", format: "date-time" },
          projects: { type: "array", items: { $ref: "#/components/schemas/Project" } },
          pages: { type: "array", items: { $ref: "#/components/schemas/Page" } },
        },
      },
    },
  },
};

export const GET: APIRoute = () =>
  new Response(JSON.stringify(spec, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
