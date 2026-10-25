/**
 * The tools worth being asked about in an interview, shared by the hero
 * marquee and the bento stack card.
 *
 * Icons come from `simple-icons` and are resolved at build time (this module
 * is only imported from Astro frontmatter), so none of the package reaches the
 * client bundle - only the path strings embedded in the HTML.
 */
import {
  siTypescript,
  siReact,
  siNextdotjs,
  siNodedotjs,
  siExpo,
  siPython,
  siFastapi,
  siGo,
  siRust,
  siPostgresql,
  siMongodb,
  siPytorch,
  siThreedotjs,
  siTailwindcss,
  siDocker,
  siRedis,
  siPrisma,
  siCloudflare,
  siGithub,
  siX,
  siTelegram,
} from "simple-icons";

/**
 * `hex` is the brand colour icons switch to on hover. Near-black marks (Next.js,
 * Rust, Three.js, Expo) would vanish on the dark theme, so `onDark` swaps in a
 * light fallback there.
 */
export type StackItem = { id: string; name: string; path: string; hex: string; onDark: string };

/** Sprite symbol id for an icon name: "Next.js" -> "i-next-js". */
export const iconId = (name: string) => `i-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

function item(name: string, icon: { path: string; hex: string }): StackItem {
  const hex = `#${icon.hex}`;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(icon.hex.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return { id: iconId(name), name, path: icon.path, hex, onDark: luminance < 0.18 ? "#f4f4f5" : hex };
}

export const STACK: StackItem[] = [
  item("TypeScript", siTypescript),
  item("React", siReact),
  item("Next.js", siNextdotjs),
  item("Node.js", siNodedotjs),
  item("React Native", siExpo),
  item("Python", siPython),
  item("FastAPI", siFastapi),
  item("Go", siGo),
  item("Rust", siRust),
  item("PostgreSQL", siPostgresql),
  item("Prisma", siPrisma),
  item("MongoDB", siMongodb),
  item("PyTorch", siPytorch),
  item("Three.js", siThreedotjs),
  item("Tailwind", siTailwindcss),
  item("Docker", siDocker),
  item("Redis", siRedis),
  item("Cloudflare", siCloudflare),
];

/** Simple Icons has no LinkedIn mark (trademark request), so it is drawn here. */
const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

export const SOCIAL_ICONS = [
  { id: iconId("GitHub"), name: "GitHub", path: siGithub.path },
  { id: iconId("X"), name: "X", path: siX.path },
  { id: iconId("LinkedIn"), name: "LinkedIn", path: LINKEDIN_PATH },
  { id: iconId("Telegram"), name: "Telegram", path: siTelegram.path },
];

/** Every symbol in /icons.svg. */
export const SPRITE = [...STACK, ...SOCIAL_ICONS].map(({ id, path }) => ({ id, path }));
