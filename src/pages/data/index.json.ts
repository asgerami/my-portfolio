import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { COMPANY, EMAIL, NAME, ROLE, SITE_DESCRIPTION, SITE_URL, SOCIALS } from "../../consts";
import { mdPathFor } from "../../utils/mdpath";
import { allDocs } from "../../utils/markdown";
import { KIND_LABELS, toArchive } from "../../utils/projects";

/**
 * The whole site as one JSON document: who runs it and every page with its
 * Markdown. Public, read-only, described in /openapi.json, and the data
 * source of the MCP server at /api/mcp.
 */
export const GET: APIRoute = async () => {
  const pages = (await allDocs()).map((d) => ({
    path: d.path,
    url: new URL(d.path, SITE_URL).href,
    markdownUrl: new URL(mdPathFor(d.path), SITE_URL).href,
    type: d.type,
    title: d.title,
    description: d.description,
    lastmod: d.lastmod.toISOString().slice(0, 10),
    markdown: d.markdown,
  }));
  const projects = toArchive(await getCollection("projects")).map((e) => ({
    title: e.project.data.title,
    description: e.project.data.description,
    kind: KIND_LABELS[e.kind].toLowerCase(),
    year: e.project.data.year ?? null,
    url: e.href ? new URL(e.href, SITE_URL).href : null,
    live: e.project.data.demoUrl ?? null,
    source: e.project.data.githubUrl ?? null,
    stack: e.project.data.techStack ?? [],
  }));
  const body = {
    site: { name: `${NAME} | ${ROLE}`, url: `${SITE_URL}/`, description: SITE_DESCRIPTION },
    person: { name: NAME, role: ROLE, email: EMAIL, company: COMPANY, profiles: SOCIALS },
    generated: new Date().toISOString(),
    projects,
    pages,
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
