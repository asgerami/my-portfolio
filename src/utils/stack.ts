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
} from "simple-icons";

/**
 * `hex` is the brand colour icons switch to on hover. Near-black marks (Next.js,
 * Rust, Three.js, Expo) would vanish on the dark theme, so `onDark` swaps in a
 * light fallback there.
 */
export type StackItem = { name: string; path: string; hex: string; onDark: string };

function item(name: string, icon: { path: string; hex: string }): StackItem {
  const hex = `#${icon.hex}`;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(icon.hex.slice(i, i + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return { name, path: icon.path, hex, onDark: luminance < 0.18 ? "#f4f4f5" : hex };
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
