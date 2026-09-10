/**
 * A project earns a case-study page when its markdown body has at least one
 * section heading. Several entries carry only a one-line body, and a page built
 * from one sentence is worse than no page at all - those keep linking straight
 * out to their demo.
 */
export const hasCaseStudy = (body: string) => /^##\s/m.test(body);
