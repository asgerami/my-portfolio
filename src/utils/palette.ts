/**
 * Entries for the ⌘K command palette, served as /search.json and loaded the
 * first time the palette opens, so they are not repeated in every page's HTML.
 */
import { getCollection } from "astro:content";
import { EMAIL, SOCIALS } from "../consts";
import { hasCaseStudy } from "./projects";

/** Either a link or one of the palette's built-in actions. */
type Target = { href: string; external?: boolean } | { action: "copy-email" | "toggle-theme" };

export type PaletteItem = {
  label: string;
  hint?: string;
  /** Lower-cased text the filter matches against. */
  search: string;
} & Target;

export type PaletteGroup = { title: string; items: PaletteItem[] };

type Draft = { label: string; hint?: string; keywords?: string } & Target;

export async function paletteGroups(): Promise<PaletteGroup[]> {
  const projects = (await getCollection("projects"))
    .filter((p) => !p.data.clientWork)
    .sort((a, b) => (a.data.order ?? 99) - (b.data.order ?? 99) || a.data.title.localeCompare(b.data.title));
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  const groups: { title: string; items: Draft[] }[] = [
    {
      title: "Navigate",
      items: [
        { label: "Home", href: "/", keywords: "index start" },
        { label: "Selected work", href: "/#work", keywords: "projects portfolio" },
        { label: "All projects", href: "/projects", keywords: "archive client freelance apps work" },
        { label: "Experience", href: "/experience", keywords: "career cv resume jobs" },
        { label: "Writing", href: "/blog", keywords: "blog posts essays articles" },
        { label: "About", href: "/about", keywords: "bio background who" },
        { label: "Contact", href: "/contact", keywords: "email hire reach" },
        { label: "Privacy", href: "/privacy", keywords: "policy data cookies" },
      ],
    },
    {
      title: "Actions",
      items: [
        { label: "Copy email address", action: "copy-email", hint: EMAIL, keywords: "contact mail hire" },
        { label: "Toggle theme", action: "toggle-theme", hint: "Light / Dark", keywords: "dark light mode" },
        { label: "Send an email", href: `mailto:${EMAIL}`, keywords: "contact hire" },
      ],
    },
    {
      title: "Projects",
      items: projects.map((p) => {
        const caseStudy = hasCaseStudy(p.body) ? `/projects/${p.slug}/` : null;
        const href = caseStudy ?? p.data.demoUrl ?? p.data.githubUrl ?? "/projects";
        return {
          label: p.data.title,
          href,
          external: !caseStudy && href.startsWith("http"),
          hint: p.data.year,
          keywords: [...(p.data.techStack ?? []), p.data.description].join(" "),
        };
      }),
    },
    {
      title: "Writing",
      items: posts.map((post) => ({
        label: post.data.title,
        href: `/blog/${post.slug}`,
        hint: String(post.data.pubDate.getFullYear()),
        keywords: [...(post.data.tags ?? []), post.data.description].join(" "),
      })),
    },
    {
      title: "Elsewhere",
      items: [
        { label: "GitHub", href: SOCIALS.github, external: true, hint: "@asgerami" },
        { label: "X / Twitter", href: SOCIALS.x, external: true, hint: "@asgerami" },
        { label: "LinkedIn", href: SOCIALS.linkedin, external: true },
        { label: "Telegram", href: SOCIALS.telegram, external: true },
        { label: "RSS feed", href: "/rss.xml", keywords: "subscribe feed" },
      ],
    },
  ];

  return groups.map((g) => ({
    title: g.title,
    items: g.items.map(({ keywords, ...item }) => ({
      ...item,
      search: `${item.label} ${keywords ?? ""} ${g.title}`.toLowerCase(),
    })),
  }));
}
