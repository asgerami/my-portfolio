# Amir's Portfolio Website

A minimal, fast software engineering portfolio website built with Astro and TailwindCSS.

## Features

- ⚡ **Lightning Fast** - Built with Astro for maximum performance
- 📱 **Responsive Design** - Works perfectly on all devices
- 🎨 **Modern UI** - Clean, professional design inspired by lelouch.dev
- 📝 **Blog System** - Content collections for easy blog management
- 🚀 **Static Generation** - All pages are statically generated
- 🌙 **Dark Theme** - Professional dark theme throughout

## Tech Stack

- [Astro](https://astro.build/) - Static site generator
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- Content Collections - For managing blog posts and projects

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd web-portfolio
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:4321](http://localhost:4321) in your browser.

## Project Structure

```
src/
├── content/           # Content collections
│   ├── blog/         # Blog posts (Markdown)
│   ├── projects/     # Project data (Markdown)
│   └── experience/   # Work experience (Markdown)
├── layouts/          # Layout components
├── pages/            # Astro pages
│   ├── blog/         # Blog pages
│   ├── about.astro   # About page
│   ├── contact.astro # Contact page
│   ├── experience.astro # Experience page
│   ├── index.astro   # Home page
│   └── projects.astro # Projects page
└── styles/           # Global styles
```

## Content Management

### Adding Blog Posts

Create a new Markdown file in `src/content/blog/` with the following frontmatter:

```markdown
---
title: "Your Post Title"
description: "A brief description of your post"
pubDate: 2024-01-15
heroImage: "/images/blog/your-image.jpg" # Optional
tags: ["tag1", "tag2"] # Optional
---

Your blog post content here...
```

### Adding Projects

Create a new Markdown file in `src/content/projects/` with the following frontmatter:

```markdown
---
title: "Project Name"
description: "Project description"
techStack: ["React", "TypeScript", "Node.js"]
githubUrl: "https://github.com/username/repo" # Optional
demoUrl: "https://your-demo.com" # Optional
featured: true # Optional
---

Project details and description...
```

### Adding Experience

Create a new Markdown file in `src/content/experience/` with the following frontmatter:

```markdown
---
company: "Company Name"
position: "Job Title"
startDate: "2022-01-01"
endDate: "2024-12-31" # Optional, omit for current position
current: true # Optional, for current positions
description: "Job description and responsibilities"
technologies: ["React", "TypeScript", "Node.js"] # Optional
---
```

## Customization

### Personal Information

Update the following files with your information:

1. **Home page** (`src/pages/index.astro`) - Update name, tagline, and bio
2. **About page** (`src/pages/about.astro`) - Update bio, skills, and values
3. **Contact page** (`src/pages/contact.astro`) - Update social links and contact info
4. **Layout** (`src/layouts/Layout.astro`) - Update site title and navigation

### Styling

The website uses TailwindCSS for styling. You can customize:

- Colors in `tailwind.config.js`
- Global styles in `src/styles/global.css`
- Component-specific styles in individual `.astro` files

### SEO

Update meta tags and SEO information in:

- `src/layouts/Layout.astro` - Global meta tags
- Individual pages - Page-specific meta tags

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify

### Other Platforms

The site generates static files in the `dist` folder that can be deployed to any static hosting service.

## Performance

This website is optimized for performance:

- **Lighthouse Score**: 100/100
- **Core Web Vitals**: All green
- **Bundle Size**: Minimal JavaScript
- **Loading Speed**: < 1.5s LCP

## Contributing

Feel free to fork this project and customize it for your own portfolio!

## License

MIT License - feel free to use this template for your own portfolio.

---

Built with ❤️ using Astro and TailwindCSS
