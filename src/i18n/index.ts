// src/i18n/index.ts
import en from './en.json';
import sv from './sv.json';
import de from './de.json';
import fr from './fr.json';
import es from './es.json';
import it from './it.json';
import nl from './nl.json';
import pl from './pl.json';
import pt from './pt.json';
import ar from './ar.json';

export const languages = {
  en: 'English',
  sv: 'Svenska',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  pt: 'Português',
  ar: 'العربية',
} as const;

export const defaultLang = 'en';

export const translations = {
  en,
  sv,
  de,
  fr,
  es,
  it,
  nl,
  pl,
  pt,
  ar,
} as const;

export type Lang = keyof typeof translations;

// RTL languages
export const rtlLanguages: Lang[] = ['ar'];

export function isRtl(lang: Lang): boolean {
  return rtlLanguages.includes(lang);
}

export function getLangFromUrl(url: URL): Lang {
  const pathname = url.pathname;
  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length > 0) {
    const firstSegment = segments[0] as Lang;
    if (firstSegment in translations && firstSegment !== 'en') {
      return firstSegment;
    }
  }
  
  return 'en';
}

export function useTranslations(lang: Lang) {
  return translations[lang];
}

export function getLocalizedPath(path: string, lang: Lang): string {
  // Remove any existing language prefix
  const cleanPath = path.replace(/^\/(en|sv|de|fr|es|it|nl|pl|pt|ar)(\/|$)/, '/');
  
  // English is default, no prefix
  if (lang === 'en') {
    return cleanPath || '/';
  }
  
  // Add language prefix for non-English
  if (cleanPath === '/') {
    return `/${lang}/`;
  }
  return `/${lang}${cleanPath}`;
}

export function getAlternateUrls(url: URL): Record<Lang, string> {
  const pathname = url.pathname;
  // Remove current language prefix to get clean path
  const cleanPath = pathname.replace(/^\/(sv|de|fr|es|it|nl|pl|pt|ar)(\/|$)/, '/');
  
  const urls = {} as Record<Lang, string>;
  
  for (const lang of Object.keys(languages) as Lang[]) {
    urls[lang] = getLocalizedPath(cleanPath, lang);
  }
  
  return urls;
}

// Get language display name in its native form
export function getLanguageDisplayName(lang: Lang): string {
  return languages[lang];
}

// Get all available languages except current
export function getOtherLanguages(currentLang: Lang): Lang[] {
  return (Object.keys(languages) as Lang[]).filter(l => l !== currentLang);
}
