# asgerami.com

Personal portfolio and blog, built with [Astro](https://astro.build) and
[Tailwind CSS](https://tailwindcss.com). Static, no client framework.

## Structure

```
src/
  consts.ts            identity, socials, email, canonical origin, CV link
  content/
    blog/              posts (markdown + frontmatter)
    projects/          projects; a body with a "## " heading gets a case-study page
    experience/        timeline entries
  assets/              images that go through astro:assets (resized, WebP, hashed)
  components/          ProjectCard, TechStack, PerformanceMonitor
  layouts/Layout.astro <head>, nav, footer, structured data
  pages/               routes, plus rss.xml.js and 404.astro
public/                only what must ship byte-for-byte: favicon, logo, og.png, robots.txt
```

## Conventions worth knowing

- **Images belong in `src/assets/`, not `public/`.** Anything under `public/`
  is served exactly as authored and skips the build-time image pipeline
  entirely. Reference them from frontmatter and render with `<Image>` so each
  one gets resized WebP variants and intrinsic width/height.
- **`src/consts.ts` is the single source of truth** for the email, social
  links, canonical origin and default meta description. Set `RESUME_URL` there
  and the CV buttons appear on the homepage and the experience page; leave it
  `null` and they stay hidden rather than becoming a dead link.
- **Projects with a real write-up get a page.** Add `## ` sections to a
  project's markdown body and `/projects/<slug>/` is generated automatically,
  with its card linking inward instead of straight out to the demo.
- **No service worker.** The previous one was cache-first with no revalidation
  and a fixed cache name, which pinned returning visitors to a stale build.
  `performance.js` now unregisters any lingering copy; that teardown can be
  deleted once no stale registration remains in the wild.

## Development

Requires Node 18+.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview
```

## Deployment

Static output, deployed on Vercel. `site` in `astro.config.mjs` must match the
production origin: canonical URLs, `og:image`, the sitemap and the RSS feed are
all built from it.
