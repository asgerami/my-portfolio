/** Minutes to read a markdown body at ~220 words per minute, never under 1. */
export const readingMinutes = (body: string) =>
  Math.max(1, Math.round(body.trim().split(/\s+/).length / 220));
