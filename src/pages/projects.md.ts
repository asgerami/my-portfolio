import type { APIRoute } from "astro";
import { docFor, markdownResponse } from "../utils/markdown";

export const GET: APIRoute = async () => markdownResponse(await docFor("/projects/"));
