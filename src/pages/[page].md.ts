import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { docFor, markdownResponse } from "../utils/markdown";

/** /about.md, /contact.md, /privacy.md */
export const getStaticPaths: GetStaticPaths = async () =>
  (await getCollection("pages")).map((p) => ({ params: { page: p.slug } }));

export const GET: APIRoute = async ({ params }) =>
  markdownResponse(await docFor(`/${params.page}/`));
