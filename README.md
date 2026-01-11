# Narcolepsy Blog

A personal blog about living with narcolepsy, built with Astro and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. **Install dependencies:**
   ```bash
   cd Narcolepsy
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The site will be available at `http://localhost:4321`

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview the production build:**
   ```bash
   npm run preview
   ```

## 🌐 Multilingual Support (i18n)

The site supports two languages:
- **Swedish (sv)** - Default language at `/`
- **English (en)** - Available at `/en/`

### How to Switch Languages

**Via URL:**
- Swedish: `http://localhost:4321/`
- English: `http://localhost:4321/en/`

**Via Language Switcher:**
Click the flag icon in the header to toggle between Swedish and English.

### Translation Files

Translations are stored in JSON files:
- `src/i18n/sv.json` - Swedish translations
- `src/i18n/en.json` - English translations

## 📁 Project Structure

```
Narcolepsy/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Header.astro      # Navigation with language switcher
│   │   └── Footer.astro      # Footer with social links
│   ├── content/
│   │   └── blog/             # Blog posts (MDX)
│   │       ├── *.mdx         # Swedish posts
│   │       └── *.mdx         # English posts
│   ├── i18n/
│   │   ├── index.ts          # i18n utilities
│   │   ├── sv.json           # Swedish translations
│   │   └── en.json           # English translations
│   ├── layouts/
│   │   └── BaseLayout.astro  # Main layout
│   ├── pages/
│   │   ├── index.astro       # Swedish homepage
│   │   ├── om-mig.astro      # Swedish about page
│   │   ├── kontakt.astro     # Swedish contact page
│   │   ├── blogg/            # Swedish blog pages
│   │   ├── rss.xml.ts        # Swedish RSS feed
│   │   └── en/               # English pages
│   │       ├── index.astro
│   │       ├── about.astro
│   │       ├── contact.astro
│   │       ├── blog/
│   │       └── rss.xml.ts
│   └── styles/
│       └── global.css        # Global styles
├── astro.config.mjs          # Astro configuration
├── tailwind.config.mjs       # Tailwind configuration
├── package.json
└── tsconfig.json
```

## ✨ Features

- **Astro 5** - Fast, modern static site generator
- **Tailwind CSS 4** - Utility-first CSS framework
- **MDX** - Write blog posts with Markdown + JSX
- **i18n** - Multilingual support (Swedish/English)
- **RSS Feeds** - Auto-generated for each language
- **Sitemap** - Auto-generated with language alternates
- **Partytown** - Performance optimization for third-party scripts
- **Alpine.js** - Lightweight interactivity for menus
- **Responsive Design** - Mobile-first approach
- **Back-to-top Button** - Smooth scroll navigation
- **SEO Optimized** - Meta tags, Open Graph, Twitter cards

## 📝 Adding Blog Posts

Create a new `.mdx` file in `src/content/blog/`:

```mdx
---
title: "Your Post Title"
description: "A brief description of your post"
pubDate: 2026-01-15
category: "Tips & Advice"
lang: "sv"  # or "en" for English
author: "Your Name"
---

# Your content here

Write your blog post using Markdown and MDX.
```

## 🎨 Customization

### Colors

The project uses a blue theme matching the SHARP project. Customize colors in:
- `tailwind.config.mjs` - Theme colors
- `src/styles/global.css` - CSS custom properties

### Typography

The site uses Inter font from Google Fonts, configured in `BaseLayout.astro`.

## 📊 RSS Feeds

- Swedish: `/rss.xml`
- English: `/en/rss.xml`

## 🌍 Deployment

The site is configured for static output and can be deployed to:
- Netlify (includes form handling)
- Vercel
- GitHub Pages
- Any static hosting

## 📄 License

MIT License - Feel free to use this as a starting point for your own blog!

