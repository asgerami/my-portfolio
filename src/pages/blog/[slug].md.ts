import type { APIRoute, GetStaticPaths } from "astro";
import { allDocs, docFor, markdownResponse } from "../../utils/markdown";

export const getStaticPaths: GetStaticPaths = async () =>
  (await allDocs())
    .filter((d) => d.type === "post")
    .map((d) => ({ params: { slug: d.path.split("/")[2] } }));

export const GET: APIRoute = async ({ params }) =>
  markdownResponse(await docFor(`/blog/${params.slug}/`));
