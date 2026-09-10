/**
 * Single source of truth for identity, metadata and social links.
 *
 * Anything that appears in the <head>, in structured data, in the RSS feed or
 * in the footer reads from here, so there is one place to change a handle, a
 * headline or the canonical origin.
 */

/** Canonical origin. Must match `site` in astro.config.mjs (no trailing slash). */
export const SITE_URL = "https://asgerami.com";

export const NAME = "Amir Aman";
export const SHORT_NAME = "Amir";
export const ROLE = "Software Engineer";

/** Used as the homepage <title> and the og:site_name. */
export const SITE_TITLE = `${NAME} | ${ROLE}`;

/**
 * Default meta description. Every page should pass its own; this is the
 * homepage's and the last-resort fallback.
 */
export const SITE_DESCRIPTION =
  "Amir Aman is a full-stack software engineer in Ethiopia building production web apps with TypeScript, Next.js, Node.js and Go. Selected work, client builds and writing.";

export const EMAIL = "amiraman467@gmail.com";

/**
 * Point this at a hosted PDF (e.g. "/amir-aman-cv.pdf" placed in `public/`)
 * and the CV button appears in the hero and the contact section. Left null,
 * nothing renders — no dead link.
 */
export const RESUME_URL: string | null = null;

export const SOCIALS = {
  github: "https://github.com/asgerami",
  linkedin: "https://www.linkedin.com/in/amiramaan/",
  x: "https://x.com/asgerami",
  telegram: "https://t.me/abbatti",
} as const;

/** Handle without the @, for twitter:creator. */
export const X_HANDLE = "@asgerami";

/** Fed to schema.org `knowsAbout` and used nowhere else. */
export const KNOWS_ABOUT = [
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Go",
  "PostgreSQL",
  "Software Engineering",
];
