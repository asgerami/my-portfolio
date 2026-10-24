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
  "Amir Aman is a software engineer in Ethiopia building web platforms, Android apps, AI tooling and backends with TypeScript, React Native, Python, Go and Rust. Selected work, client builds and writing.";

export const EMAIL = "amiraman467@gmail.com";

/** Shown in the hero, the bento and the footer clock. */
export const LOCATION = "Ethiopia";
export const TIMEZONE = "Africa/Addis_Ababa";
export const TIMEZONE_LABEL = "GMT+3";

/**
 * Drives the "Available for work" badge in the hero. Flip to false when
 * booked up and the badge reads "Booked" instead of advertising a slot.
 */
export const AVAILABLE_FOR_WORK = true;

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
  "React Native",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "PostgreSQL",
  "Model Context Protocol",
  "Machine Learning",
  "Software Engineering",
];
