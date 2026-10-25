import type { APIRoute, GetStaticPaths } from "astro";
import { allDocs, docFor, markdownResponse } from "../../utils/markdown";

/** One twin per case-study page. */
export const getStaticPaths: GetStaticPaths = async () =>
  (await allDocs())
    .filter((d) => d.type === "project")
    .map((d) => ({ params: { slug: d.path.split("/")[2] } }));

export const GET: APIRoute = async ({ params }) =>
  markdownResponse(await docFor(`/projects/${params.slug}/`));
