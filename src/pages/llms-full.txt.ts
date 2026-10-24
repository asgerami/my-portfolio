import type { APIRoute } from "astro";
import { llmsFull } from "../utils/llms";

/** Every case study, role and essay as one markdown document (llmstxt.org). */
export const GET: APIRoute = async () =>
  new Response(await llmsFull(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
