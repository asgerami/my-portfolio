import type { CollectionEntry } from "astro:content";

/**
 * A project earns a case-study page when its markdown body has at least one
 * section heading. Several entries carry only a one-line body, and a page built
 * from one sentence is worse than no page at all - those keep linking straight
 * out to their demo.
 */
export const hasCaseStudy = (body: string) => /^##\s/m.test(body);

export type ArchiveKind = "featured" | "client" | "app" | "personal";

export const KIND_LABELS: Record<ArchiveKind, string> = {
  featured: "Featured",
  client: "Client",
  app: "App",
  personal: "Personal",
};

export type ArchiveEntry = {
  project: CollectionEntry<"projects">;
  kind: ArchiveKind;
  href: string | null;
  external: boolean;
};

/**
 * Projects as archive rows, each pointing at its best link. Newest year first;
 * within a year, featured projects lead in their homepage order.
 */
export function toArchive(projects: CollectionEntry<"projects">[]): ArchiveEntry[] {
  const rank = (p: CollectionEntry<"projects">) =>
    p.data.featured && !p.data.clientWork ? (p.data.order ?? 0) : Infinity;
  return [...projects]
    .sort(
      (a, b) =>
        Number(b.data.year ?? 0) - Number(a.data.year ?? 0) ||
        rank(a) - rank(b) ||
        a.data.title.localeCompare(b.data.title),
    )
    .map((p) => {
      const kind: ArchiveKind =
        p.data.featured && !p.data.clientWork
          ? "featured"
          : p.data.clientWork
            ? "client"
            : p.data.mobile
              ? "app"
              : "personal";
      const caseStudy = hasCaseStudy(p.body) ? `/projects/${p.slug}/` : null;
      const href = caseStudy ?? p.data.demoUrl ?? p.data.githubUrl ?? null;
      return { project: p, kind, href, external: !caseStudy && !!href };
    });
}
