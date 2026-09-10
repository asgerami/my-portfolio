// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  // Required for canonical URLs, absolute og:image URLs, the sitemap and the
  // RSS feed. Without it none of those can be generated.
  site: "https://asgerami.com",

  integrations: [sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    assets: "assets",
    inlineStylesheets: "auto",
  },

  compressHTML: true,

  // Images are imported through `astro:assets` (src/assets/**), so this service
  // actually runs: it emits resized, hashed WebP variants at build time.
  // Anything left in `public/` bypasses it and ships at full size.
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
});
