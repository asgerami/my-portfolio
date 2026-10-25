/**
 * Every public page of the site as a Markdown document.
 *
 * This registry is the one source for the `.md` twin of each page
 * (`/index.md`, `/blog/<slug>.md`, ...), `/sitemap.xml`, `/data/index.json`
 * and, through that index, the MCP server at /api/mcp. A page added here
 * shows up in all of them at once.
 *
 * Twin URLs follow one rule, mdPathFor in ./mdpath.ts, which middleware.ts
 * also uses to answer `Accept: text/markdown` requests.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import type { ImageMetadata } from "astro";
import {
  COMPANY,
  EMAIL,
  INTRO,
  LOCATION,
  NAME,
  NOW,
  ROLE,
  SITE_URL,
  SOCIALS,
  TIMEZONE_LABEL,
} from "../consts";
import { hasCaseStudy, toArchive, KIND_LABELS } from "./projects";

export { mdPathFor } from "./mdpath";

export type Doc = {
  /** Canonical HTML path, with trailing slash (directory build format). */
  path: string;
  title: string;
  description: string;
  type: "home" | "page" | "listing" | "project" | "post";
  markdown: string;
  lastmod: Date;
};

const abs = (path: string) => new URL(path, SITE_URL).href;
const day = (d: Date) => d.toISOString().slice(0, 10);
const BUILT = new Date();

function monthYear(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * Images in content bodies are written as paths to source files
 * (`../../assets/blog/x.webp`), which do not exist on the deployed site.
 * Point them at the built, hashed asset instead.
 */
const assetImages = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/**/*.{webp,png,jpg,jpeg}",
  { eager: true },
);
function resolveImages(body: string) {
  return body.replace(/!\[([^\]]*)\]\((?:\.\.\/)+assets\/([^)\s]+)\)/g, (match, alt, rest) => {
    const image = assetImages[`/src/assets/${rest}`];
    return image ? `![${alt}](${abs(image.default.src)})` : match;
  });
}

function doc(d: Omit<Doc, "markdown"> & { body: string }): Doc {
  const { body, ...rest } = d;
  const header = `# ${d.title}\n\n> ${d.description}\n\nCanonical: ${abs(d.path)}\n`;
  return { ...rest, markdown: `${header}\n${resolveImages(body.trim())}\n` };
}

function projectHref(p: CollectionEntry<"projects">) {
  return hasCaseStudy(p.body)
    ? `/projects/${p.slug}/`
    : (p.data.demoUrl ?? p.data.githubUrl ?? "/projects/");
}

function projectFacts(p: CollectionEntry<"projects">) {
  return [
    p.data.year && `Year: ${p.data.year}`,
    p.data.role && `Role: ${p.data.role}`,
    p.data.clientWork && "Type: client work",
    p.data.mobile && "Platform: Android",
    p.data.demoUrl && `Live: ${p.data.demoUrl}`,
    p.data.githubUrl && `Source: ${p.data.githubUrl}`,
    p.data.techStack?.length && `Stack: ${p.data.techStack.join(", ")}`,
  ].filter(Boolean) as string[];
}

const contactBlock = `- Email: [${EMAIL}](mailto:${EMAIL})
- GitHub: ${SOCIALS.github}
- X: ${SOCIALS.x}
- LinkedIn: ${SOCIALS.linkedin}
- Telegram: ${SOCIALS.telegram}
- Contact page: ${abs("/contact/")}`;

let cache: Promise<Doc[]> | null = null;

/** All documents, built once per build. */
export function allDocs(): Promise<Doc[]> {
  cache ??= build();
  return cache;
}

export async function docFor(path: string): Promise<Doc | undefined> {
  return (await allDocs()).find((d) => d.path === path);
}

async function build(): Promise<Doc[]> {
  const projects = await getCollection("projects");
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
  const experience = (await getCollection("experience")).sort(
    (a, b) => new Date(b.data.startDate).getTime() - new Date(a.data.startDate).getTime(),
  );
  const pages = await getCollection("pages");

  const featured = projects
    .filter((p) => p.data.featured && !p.data.clientWork)
    .sort((a, b) => (a.data.order ?? Infinity) - (b.data.order ?? Infinity));
  const archive = toArchive(projects);
  const latestPost = posts[0]?.data.updatedDate ?? posts[0]?.data.pubDate ?? BUILT;

  const experienceList = experience
    .map(
      (e) =>
        `- **${e.data.position}**, ${e.data.company} (${monthYear(e.data.startDate)} to ${
          e.data.endDate ? monthYear(e.data.endDate) : "present"
        })`,
    )
    .join("\n");

  const postList = posts
    .map((p) => `- [${p.data.title}](${abs(`/blog/${p.slug}/`)}) (${day(p.data.pubDate)}): ${p.data.description}`)
    .join("\n");

  const docs: Doc[] = [];

  // Home --------------------------------------------------------------
  docs.push(
    doc({
      path: "/",
      title: `${NAME}, ${ROLE.toLowerCase()}`,
      description: "Software engineer shipping real products and odd experiments.",
      type: "home",
      lastmod: BUILT,
      body: `I'm ${NAME}${INTRO}

Based in ${LOCATION} (${TIMEZONE_LABEL}). Founder of [${COMPANY.name}](${COMPANY.url}). More about me: ${abs("/about/")}

## Now

${NOW.map((n) => `- **${n.tag}:** ${n.text}`).join("\n")}

## Selected work

${featured
  .map((p) => `### [${p.data.title}](${abs(projectHref(p))})\n\n${p.data.description}\n\n${projectFacts(p).map((f) => `- ${f}`).join("\n")}`)
  .join("\n\n")}

## More projects

${archive
  .filter((e) => e.kind !== "featured")
  .slice(0, 5)
  .map((e) => `- [${e.project.data.title}](${e.href ? abs(e.href) : abs("/projects/")}) (${e.project.data.year ?? "n.d."}, ${KIND_LABELS[e.kind]}): ${e.project.data.description}`)
  .join("\n")}

All projects: ${abs("/projects/")}

## Experience

${experienceList}

Full timeline: ${abs("/experience/")}

## Writing

${postList}

## Contact

${contactBlock}`,
    }),
  );

  // Standalone pages --------------------------------------------------
  for (const page of pages) {
    docs.push(
      doc({
        path: `/${page.slug}/`,
        title: page.data.heading ?? page.data.title,
        description: page.data.description,
        type: "page",
        lastmod: page.data.updated,
        body: `Updated: ${day(page.data.updated)}\n\n${page.body}`,
      }),
    );
  }

  // Projects ----------------------------------------------------------
  docs.push(
    doc({
      path: "/projects/",
      title: "Projects",
      description: `Every project ${NAME} has shipped: products of my own, client sites, Android apps and experiments.`,
      type: "listing",
      lastmod: BUILT,
      body: (["featured", "client", "personal", "app"] as const)
        .map((kind) => {
          const rows = archive.filter((e) => e.kind === kind);
          if (!rows.length) return "";
          return `## ${kind === "app" ? "Apps" : KIND_LABELS[kind]}\n\n${rows
            .map(
              (e) =>
                `- [${e.project.data.title}](${e.href ? abs(e.href) : abs("/projects/")}) (${
                  e.project.data.year ?? "n.d."
                }): ${e.project.data.description}${
                  e.project.data.techStack?.length ? ` Stack: ${e.project.data.techStack.join(", ")}.` : ""
                }`,
            )
            .join("\n")}`;
        })
        .filter(Boolean)
        .join("\n\n"),
    }),
  );

  for (const p of projects.filter((p) => hasCaseStudy(p.body))) {
    docs.push(
      doc({
        path: `/projects/${p.slug}/`,
        title: p.data.title,
        description: p.data.description,
        type: "project",
        lastmod: BUILT,
        body: `${projectFacts(p).map((f) => `- ${f}`).join("\n")}\n\n${p.body}`,
      }),
    );
  }

  // Experience --------------------------------------------------------
  docs.push(
    doc({
      path: "/experience/",
      title: "Experience",
      description: `${NAME}'s career so far: independent software engineering, full-stack work at iConnect, a Smart City internship in Adama, and mentoring Ethiopia's FIRST Global robotics team.`,
      type: "listing",
      lastmod: BUILT,
      body: experience
        .map(
          (e) =>
            `## ${e.data.position}, ${e.data.company}\n\n${monthYear(e.data.startDate)} to ${
              e.data.endDate ? monthYear(e.data.endDate) : "present"
            }${e.data.current ? " (current role)" : ""}\n\n${e.data.description}${
              e.data.technologies?.length ? `\n\nTechnologies: ${e.data.technologies.join(", ")}` : ""
            }`,
        )
        .join("\n\n"),
    }),
  );

  // Writing -----------------------------------------------------------
  docs.push(
    doc({
      path: "/blog/",
      title: "Writing",
      description: `Essays and notes from ${NAME} on software engineering, Go, the AI industry, and Ethiopia's infrastructure.`,
      type: "listing",
      lastmod: latestPost,
      body: `${postList}\n\nRSS: ${abs("/rss.xml")}`,
    }),
  );

  for (const p of posts) {
    const tags = p.data.tags?.length ? `\nTags: ${p.data.tags.join(", ")}` : "";
    docs.push(
      doc({
        path: `/blog/${p.slug}/`,
        title: p.data.title,
        description: p.data.description,
        type: "post",
        lastmod: p.data.updatedDate ?? p.data.pubDate,
        body: `By ${NAME}. Published ${day(p.data.pubDate)}${
          p.data.updatedDate ? `, updated ${day(p.data.updatedDate)}` : ""
        }.${tags}\n\n${p.body}`,
      }),
    );
  }

  return docs;
}

/** A twin endpoint's response: the page as text/markdown. */
export function markdownResponse(d: Doc | undefined) {
  if (!d) return new Response("Not found", { status: 404 });
  return new Response(d.markdown, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
