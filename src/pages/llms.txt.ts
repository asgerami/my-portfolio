import type { APIRoute } from "astro";
import { llmsSummary } from "../utils/llms";

/** https://llmstxt.org summary for AI assistants and LLM crawlers. */
export const GET: APIRoute = async () =>
  new Response(await llmsSummary(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
