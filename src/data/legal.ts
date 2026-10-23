// Legal pages (Ochrana osobních údajů, Cookies). These texts are a template and need a legal review
// before launch. Nothing here is confirmed by the owner yet: fill the TODO fields, never guess them.
import { site } from './site';

export const controller = {
  // TODO: exact legal name of the operator (company or sole trader) from the business register.
  legalName: site.name,
  // IČO comes from the Refresh 02 design and is not verified yet (see site.ts).
  companyId: site.companyId,
  // Address taken from the Pen design (also used on /kontakt/). Confirm with the owner before launch.
  address: 'Kpt. Jaroše 496, 543 01 Vrchlabí',
  email: site.email,
  phone: site.phone,
  phoneHref: site.phoneHref,
};

// TODO: hosting provider once the deploy target is decided (Cloudflare Pages / Vercel / other).
export const hostingProvider: string | null = null;

// Shown as "Poslední aktualizace" on both legal pages. Update whenever the content changes.
export const legalUpdated = { privacy: 'říjen 2026', cookies: 'říjen 2026' };

export type CookieCategory = 'necessary' | 'analytics' | 'third-party' | 'marketing';

export interface CookieEntry {
  name: string;
  purpose: string;
  storage: string;
  validity: string;
  consent: string;
  processor: string;
  // Only active entries are listed as "in use". Planned ones show as "připravujeme".
  active: boolean;
}

// Single source of truth for what the site stores. When Google Analytics is added:
// 1. set PUBLIC_GA_ID (G-XXXXXXXXXX); lib/consent/analytics.ts loads GA only after analytics consent,
// 2. switch the analytics entry below to `active: true`.
// The consent bar itself lives in components/consent/CookieConsent.astro.
export const cookies: Record<CookieCategory, CookieEntry[]> = {
  necessary: [
    {
      name: 'Uložení vaší volby',
      purpose: 'Pamatuje si, jaké cookies jste povolili, abychom se vás neptali při každé návštěvě.',
      storage: 'localStorage ve vašem prohlížeči (pk-consent)',
      validity: '12 měsíců, potom se zeptáme znovu',
      consent: 'Není potřeba, bez něj nejde volbu uložit',
      processor: site.name,
      active: true,
    },
  ],
  analytics: [
    {
      name: '_ga, _ga_<ID> (Google Analytics 4)',
      purpose: 'Anonymní měření návštěvnosti a toho, jak se web používá. Pomáhá nám web zlepšovat.',
      storage: 'Cookies prohlížeče',
      validity: '2 roky',
      consent: 'Ano, načte se až po vašem souhlasu',
      processor: 'Google Ireland Limited',
      active: false,
    },
  ],
  'third-party': [
    {
      name: 'Mapa Google na stránce Kontakt',
      purpose: 'Vložená mapa s polohou provozovny. Google při jejím načtení může ukládat vlastní cookies a zpracovávat vaši IP adresu.',
      storage: 'Cookies a úložiště Googlu',
      validity: 'Podle zásad Googlu',
      consent: 'Ano, mapa se načte až po vašem souhlasu',
      processor: 'Google Ireland Limited',
      active: true,
    },
  ],
  marketing: [],
};
