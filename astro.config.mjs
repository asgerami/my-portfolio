// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Optimize bundle size
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Create vendor chunks for node_modules
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
      },
      // Enable minification
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  },
  // Performance optimizations
  build: {
    assets: "assets",
    inlineStylesheets: "auto",
  },
  // Enable compression
  compressHTML: true,
  // Optimize images
  image: {
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
});
