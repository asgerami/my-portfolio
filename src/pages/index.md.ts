import type { APIRoute } from "astro";
import { docFor, markdownResponse } from "../utils/markdown";

/** The homepage as Markdown. */
export const GET: APIRoute = async () => markdownResponse(await docFor("/"));
