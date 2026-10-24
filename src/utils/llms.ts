/**
 * Plain-markdown descriptions of the site for AI assistants and LLM crawlers,
 * served as /llms.txt (summary with links) and /llms-full.txt (every case
 * study and essay in full), following https://llmstxt.org.
 *
 * Both are built from the same content collections as the pages, so they
 * never drift from what the site actually says.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import {
  ALMA_MATER,
  COMPANY,
  EMAIL,
  LOCATION,
  NAME,
  ROLE,
  SITE_URL,
  SOCIALS,
  TIMEZONE_LABEL,
} from "../consts";
import { hasCaseStudy } from "./projects";

const abs = (path: string) => new URL(path, SITE_URL).href;

function monthYear(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function projectUrl(p: CollectionEntry<"projects">) {
  return hasCaseStudy(p.body)
    ? abs(`/projects/${p.slug}/`)
    : (p.data.demoUrl ?? p.data.githubUrl ?? abs("/projects"));
}

function projectLine(p: CollectionEntry<"projects">) {
  const meta = [
    p.data.year,
    p.data.role,
    p.data.clientWork ? "client work" : null,
    p.data.mobile ? "Android app" : null,
    p.data.techStack?.join(", "),
  ]
    .filter(Boolean)
    .join("; ");
  return `- [${p.data.title}](${projectUrl(p)}): ${p.data.description}${meta ? ` (${meta})` : ""}`;
}

async function load() {
  const projects = (await getCollection("projects")).sort(
    (a, b) =>
      Number(!!b.data.featured) - Number(!!a.data.featured) ||
      (a.data.order ?? Infinity) - (b.data.order ?? Infinity) ||
      Number(b.data.year ?? 0) - Number(a.data.year ?? 0) ||
      a.data.title.localeCompare(b.data.title),
  );
  const experience = (await getCollection("experience")).sort(
    (a, b) => new Date(b.data.startDate).getTime() - new Date(a.data.startDate).getTime(),
  );
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );
  return { projects, experience, posts };
}

function header() {
  return `# ${NAME}

> ${NAME} is a ${ROLE.toLowerCase()} based in ${LOCATION} (${TIMEZONE_LABEL}) and the founder of ${COMPANY.name} (${COMPANY.url}). The work spans production web platforms (TypeScript, Next.js, Node.js), Android apps (React Native), backends in Python, Go and Node.js, AI and developer tooling such as MCP servers, and machine-learning experiments. This file summarises that work for AI assistants; every link points at the canonical page.

- Name: ${NAME}
- Role: ${ROLE}; founder of ${COMPANY.name}; independent freelance engineer
- Location: ${LOCATION} (${TIMEZONE_LABEL})
- Education: studied software engineering at ${ALMA_MATER}
- Website: ${SITE_URL}/
- Email: ${EMAIL}
- GitHub: ${SOCIALS.github}
- X (Twitter): ${SOCIALS.x}
- LinkedIn: ${SOCIALS.linkedin}
- Telegram: ${SOCIALS.telegram}
`;
}

export async function llmsSummary() {
  const { projects, experience, posts } = await load();
  const featured = projects.filter((p) => p.data.featured && !p.data.clientWork);
  const others = projects.filter((p) => !featured.includes(p));

  return `${header()}
## Current focus

- ${COMPANY.name}: ${COMPANY.description}

## Selected projects

${featured.map(projectLine).join("\n")}

## Other projects

${others.map(projectLine).join("\n")}

## Experience

${experience
  .map(
    (e) =>
      `- ${e.data.position}, ${e.data.company} (${monthYear(e.data.startDate)} to ${
        e.data.endDate ? monthYear(e.data.endDate) : "present"
      }): ${e.data.description}`,
  )
  .join("\n")}

## Writing

${posts
  .map(
    (p) =>
      `- [${p.data.title}](${abs(`/blog/${p.slug}/`)}): ${p.data.description} (${p.data.pubDate
        .toISOString()
        .slice(0, 10)})`,
  )
  .join("\n")}

## Optional

- [Full text of every case study and essay](${abs("/llms-full.txt")})
- [All projects](${abs("/projects")})
- [Experience timeline](${abs("/experience")})
- [RSS feed](${abs("/rss.xml")})
- [Sitemap](${abs("/sitemap-index.xml")})
`;
}

export async function llmsFull() {
  const { projects, experience, posts } = await load();

  const projectSections = projects.map((p) => {
    const meta = [
      `URL: ${projectUrl(p)}`,
      p.data.demoUrl && `Live: ${p.data.demoUrl}`,
      p.data.githubUrl && `Source: ${p.data.githubUrl}`,
      p.data.year && `Year: ${p.data.year}`,
      p.data.role && `Role: ${p.data.role}`,
      p.data.techStack && `Stack: ${p.data.techStack.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n");
    return `### ${p.data.title}\n\n${meta}\n\n${p.data.description}\n\n${p.body.trim()}`;
  });

  const experienceSections = experience.map(
    (e) =>
      `### ${e.data.position}, ${e.data.company}\n\n${monthYear(e.data.startDate)} to ${
        e.data.endDate ? monthYear(e.data.endDate) : "present"
      }\n\n${e.data.description}${
        e.data.technologies?.length ? `\n\nTechnologies: ${e.data.technologies.join(", ")}` : ""
      }`,
  );

  const postSections = posts.map(
    (p) =>
      `### ${p.data.title}\n\nURL: ${abs(`/blog/${p.slug}/`)}\nPublished: ${p.data.pubDate
        .toISOString()
        .slice(0, 10)}\n\n${p.data.description}\n\n${p.body.trim()}`,
  );

  return `${header()}
## Projects

${projectSections.join("\n\n---\n\n")}

## Experience

${experienceSections.join("\n\n")}

## Writing

${postSections.join("\n\n---\n\n")}
`;
}
