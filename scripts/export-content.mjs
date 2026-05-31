// scripts/export-content.mjs
// Extracts readable text content from selected pages into a single Markdown file
// so it can be handed to an AI for content/biochemistry review.
//
// Run:  node scripts/export-content.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Pages to export, in reading order. Title is used as the section heading.
const TARGETS = [
  { file: 'src/pages/hypothesis.astro', title: 'The Axonal Highway Hypothesis' },
  { file: 'src/pages/science/gangliosides.astro', title: 'Gangliosides — Biochemistry' },
  { file: 'src/pages/science/transport.astro', title: 'Neuronal Transport' },
  { file: 'src/pages/science/genetics.astro', title: 'Genetics (HLA, B3GALT4, NEU1, GDNF-AS1)' },
  { file: 'src/pages/science/influenza-history.astro', title: 'Influenza History' },
  { file: 'src/pages/evidence.astro', title: 'Supporting Evidence' },
  { file: 'src/content/diseases/narcolepsy-type-1.mdx', title: 'Disease: Narcolepsy Type 1' },
  { file: 'src/content/diseases/bickerstaff-brainstem-encephalitis.mdx', title: 'Disease: Bickerstaff Brainstem Encephalitis' },
  { file: 'src/content/diseases/miller-fisher-syndrome.mdx', title: 'Disease: Miller Fisher Syndrome' },
  { file: 'src/content/diseases/guillain-barre-syndrome.mdx', title: 'Disease: Guillain-Barré Syndrome' },
  { file: 'src/content/diseases/encephalitis-lethargica.mdx', title: 'Disease: Encephalitis Lethargica' },
];

function decodeEntities(s) {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rarr;/g, '→')
    .replace(/&times;/g, '×')
    .replace(/&deg;/g, '°')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripFrontmatter(src) {
  // Remove a leading --- ... --- block (Astro / MDX frontmatter)
  if (src.startsWith('---')) {
    const end = src.indexOf('\n---', 3);
    if (end !== -1) {
      return src.slice(end + 4);
    }
  }
  return src;
}

function extractMdx(src) {
  // MDX body is already Markdown; just drop frontmatter.
  return stripFrontmatter(src).trim();
}

function extractAstro(src) {
  let s = stripFrontmatter(src);

  // Remove style / script blocks and inline SVGs (noise)
  s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/<svg[\s\S]*?<\/svg>/gi, '');
  // Remove <img .../> but keep alt text as a caption note
  s = s.replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, (_, alt) => `\n[Figure: ${alt}]\n`);
  s = s.replace(/<img[^>]*>/gi, '');

  // Convert headings to Markdown
  s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => `\n\n# ${clean(t)}\n`);
  s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${clean(t)}\n`);
  s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${clean(t)}\n`);
  s = s.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n\n**${clean(t)}**\n`);
  s = s.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, t) => `\n**${clean(t)}**\n`);

  // List items
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `- ${clean(t)}\n`);

  // Paragraphs and table cells become lines
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => `\n${clean(t)}\n`);
  s = s.replace(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi, (_, t) => `\n_${clean(t)}_\n`);
  s = s.replace(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi, (_, t) => `${clean(t)} | `);
  s = s.replace(/<\/tr>/gi, '\n');

  // Drop all remaining tags
  s = s.replace(/<[^>]+>/g, '');

  s = decodeEntities(s);

  // Collapse excessive whitespace
  s = s.replace(/[ \t]+/g, ' ');
  s = s.replace(/ *\n */g, '\n');
  s = s.replace(/\n{3,}/g, '\n\n');

  return s.trim();
}

function clean(t) {
  return decodeEntities(t.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

let out = `# Narcolepsy Hypothesis — Content Export\n\n`;
out += `> Auto-generated text extract for AI content review.\n`;
out += `> Topic focus: biochemistry and the role of gangliosides in neuroregeneration.\n`;
out += `> Generated: ${new Date().toISOString()}\n\n`;
out += `---\n\n`;

for (const { file, title } of TARGETS) {
  const abs = join(root, file);
  if (!existsSync(abs)) {
    out += `\n\n# ${title}\n\n_(File not found: ${file})_\n`;
    continue;
  }
  const src = readFileSync(abs, 'utf8');
  const body = file.endsWith('.mdx') ? extractMdx(src) : extractAstro(src);
  out += `\n\n${'='.repeat(80)}\n# ${title}\n_Source: ${file}_\n${'='.repeat(80)}\n\n`;
  out += body + '\n';
}

const outDir = join(root, 'content-export');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, 'narcolepsy-content.md');
writeFileSync(outFile, out, 'utf8');

console.log(`Wrote ${outFile} (${(out.length / 1024).toFixed(1)} KB, ${TARGETS.length} sections)`);
