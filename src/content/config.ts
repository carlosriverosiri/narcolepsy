// src/content/config.ts
import { defineCollection, z } from 'astro:content';

// Supported languages
const supportedLangs = ['en', 'sv', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt', 'ar'] as const;

// Scientific articles / pages collection
const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date().optional(),
    updatedDate: z.date().optional(),
    section: z.enum(['hypothesis', 'science', 'evidence', 'background']),
    lang: z.enum(supportedLangs),
    author: z.string().optional(),
    draft: z.boolean().optional().default(false),
    references: z.array(z.string()).optional(),
  }),
});

// References / bibliography collection
const references = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.string(),
    authors: z.string(),
    year: z.number(),
    title: z.string(),
    journal: z.string().optional(),
    volume: z.string().optional(),
    pages: z.string().optional(),
    doi: z.string().optional(),
    pmid: z.string().optional(),
    url: z.string().optional(),
  }),
});

export const collections = {
  articles,
  references,
};
