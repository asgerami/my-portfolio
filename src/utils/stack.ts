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
} from "simple-icons";

export type StackItem = { name: string; path: string };

export const STACK: StackItem[] = [
  { name: "TypeScript", path: siTypescript.path },
  { name: "React", path: siReact.path },
  { name: "Next.js", path: siNextdotjs.path },
  { name: "Node.js", path: siNodedotjs.path },
  { name: "React Native", path: siExpo.path },
  { name: "Python", path: siPython.path },
  { name: "FastAPI", path: siFastapi.path },
  { name: "Go", path: siGo.path },
  { name: "Rust", path: siRust.path },
  { name: "PostgreSQL", path: siPostgresql.path },
  { name: "MongoDB", path: siMongodb.path },
  { name: "PyTorch", path: siPytorch.path },
  { name: "Three.js", path: siThreedotjs.path },
  { name: "Tailwind", path: siTailwindcss.path },
  { name: "Docker", path: siDocker.path },
  { name: "Redis", path: siRedis.path },
];
