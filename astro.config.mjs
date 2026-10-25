// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  // Required for canonical URLs, absolute og:image URLs and the RSS feed.
  // /sitemap.xml is built by src/pages/sitemap.xml.ts.
  site: "https://www.asgerami.com",

  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    assets: "assets",
    inlineStylesheets: "auto",
  },

  compressHTML: true,

  // Scope component styles with a short class rather than a
  // data-astro-cid-* attribute on every element: same isolation, leaner HTML.
  scopedStyleStrategy: "class",

  // Images are imported through `astro:assets` (src/assets/**), so this service
  // actually runs: it emits resized, hashed WebP variants at build time.
  // Anything left in `public/` bypasses it and ships at full size.
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
});
