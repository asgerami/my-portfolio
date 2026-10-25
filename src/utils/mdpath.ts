/**
 * Where a page's Markdown twin lives: drop the trailing slash and add `.md`,
 * with the homepage at `/index.md`. Shared by the layout's
 * rel="alternate" link and middleware.ts, so the two can never disagree.
 * Kept free of imports so the edge middleware can use it.
 */
export function mdPathFor(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/index.md" : `${trimmed}.md`;
}
