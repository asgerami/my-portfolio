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

export const collections = {
  blog,
  projects,
  experience,
};
