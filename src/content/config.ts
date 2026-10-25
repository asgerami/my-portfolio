import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  // `image()` resolves frontmatter paths (relative to the .md file) into
  // ImageMetadata, so heroes go through astro:assets and get resized,
  // format-converted and hashed at build time instead of being served raw.
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
      heroAlt: z.string().optional(),
      tags: z.array(z.string()).optional(),
      draft: z.boolean().optional(),
    }),
});

const projects = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      techStack: z.array(z.string()).optional(),
      githubUrl: z.string().optional(),
      demoUrl: z.string().optional(),
      featured: z.boolean().optional(),
      image: image().optional(),
      /** What you actually did on it, e.g. "Solo build" or "Backend + payments". */
      role: z.string().optional(),
      year: z.string().optional(),
      clientWork: z.boolean().optional(),
      /** A phone app rather than a website; groups it under "Apps" in the archive. */
      mobile: z.boolean().optional(),
      order: z.number().optional(),
    }),
});

const experience = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    position: z.string(),
    startDate: z.string(),
    endDate: z.string().optional(),
    description: z.string(),
    technologies: z.array(z.string()).optional(),
    current: z.boolean().optional(),
  }),
});

/**
 * Standalone pages (/about, /contact, /privacy). The markdown body is the one
 * source for both the HTML page and its /<page>.md twin.
 */
const pages = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    /** Display headline; falls back to `title`. */
    heading: z.string().optional(),
    description: z.string(),
    /** schema.org type of the page, e.g. AboutPage or ContactPage. */
    pageType: z.string().default("WebPage"),
    updated: z.coerce.date(),
  }),
});

export const collections = {
  blog,
  projects,
  experience,
  pages,
};
