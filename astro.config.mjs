// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// All supported languages
const locales = ['en', 'sv', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'ar'];

export default defineConfig({
  site: 'https://narcolepsy-hypothesis.com',

  integrations: [
    react(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en-US',
          sv: 'sv-SE',
          de: 'de-DE',
          fr: 'fr-FR',
          es: 'es-ES',
          it: 'it-IT',
          nl: 'nl-NL',
          pl: 'pl-PL',
          pt: 'pt-PT',
          ar: 'ar-SA',
        },
      },
    }),
  ],

  // i18n configuration - English as default (no prefix)
  i18n: {
    defaultLocale: 'en',
    locales: locales,
    routing: {
      prefixDefaultLocale: false, // English at root, others with prefix
    },
  },

  // Performance optimizations
  compressHTML: true,

  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
  },

  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },
});
