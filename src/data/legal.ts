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

// The site is hosted on Zerops (deploys from codex/zerops-deploy). Add the company name once confirmed.
export const hostingProvider: string | null = 'Zerops';

// Shown as "Poslední aktualizace" on both legal pages. Update whenever the content changes.
export const legalUpdated = { privacy: 'říjen 2026', cookies: 'říjen 2026' };

// Retention of user-level data in Google Analytics (Admin > Data collection > Data retention).
// TODO: keep in sync with the property setting. GA4 default is 2 months; 14 months is the other option.
export const gaRetention = '2 měsíce';

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

// Single source of truth for what the site stores. GA4 (site.gaId) loads only after analytics
// consent, see lib/consent/analytics.ts.
// The consent bar itself lives in components/consent/CookieConsent.astro.
export const cookies: Record<CookieCategory, CookieEntry[]> = {
  necessary: [
    {
      name: 'Uložení vaší volby',
      purpose: 'Pamatuje si, jaké cookies jste povolili, abychom se vás neptali při každé návštěvě.',
      storage: 'localStorage ve vašem prohlížeči (pk-consent): jen vaše volba, čas a náhodný identifikátor záznamu',
      validity: '12 měsíců, potom se zeptáme znovu',
      consent: 'Není potřeba, bez něj nejde volbu uložit',
      processor: site.name,
      active: true,
    },
  ],
  analytics: [
    {
      name: '_ga (Google Analytics 4)',
      purpose: 'Rozliší návštěvníky pomocí náhodného identifikátoru, abychom viděli, kolik lidí web navštívilo a jestli se vracejí.',
      storage: 'Cookie prohlížeče',
      validity: '2 roky, po odvolání souhlasu ji smažeme',
      consent: 'Ano, Google Analytics se načte až po vašem souhlasu',
      processor: 'Google Ireland Limited',
      active: true,
    },
    {
      name: `_ga_${site.gaId.replace(/^G-/, '')} (Google Analytics 4)`,
      purpose: 'Udržuje stav návštěvy (relace), aby se zobrazené stránky a události počítaly k jedné návštěvě.',
      storage: 'Cookie prohlížeče',
      validity: '2 roky, po odvolání souhlasu ji smažeme',
      consent: 'Ano, Google Analytics se načte až po vašem souhlasu',
      processor: 'Google Ireland Limited',
      active: true,
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
