// Google Analytics 4 via gtag.js with strict prior consent: nothing from Google loads or is sent
// until the visitor allows analytics. Consent Mode v2 still starts from "denied" so the tag never
// runs with more than the visitor chose; marketing (ad_*) follows its own switch, never analytics.
// The property ID lives in data/site.ts (gaId); the cookies are listed in data/legal.ts.
import { site } from '../../data/site';
import type { Consent } from './consent';

const measurementId = /^G-[A-Z0-9]+$/i.test(site.gaId) ? site.gaId : '';
let loaded = false;
// Last applied choice; also covers browsers where localStorage is blocked and the choice lives only in this page.
let allowed = false;
let contactClicksBound = false;

type GtagWindow = Window & { dataLayer: unknown[]; gtag: (...args: unknown[]) => void } & Record<string, unknown>;
const w = () => window as unknown as GtagWindow;

const consentState = (consent: Consent | null) => {
  const ads = consent?.marketing === true ? 'granted' : 'denied';
  return {
    analytics_storage: consent?.analytics === true ? 'granted' : 'denied',
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
  };
};

function load(consent: Consent) {
  const win = w();
  loaded = true;
  win.dataLayer = win.dataLayer || [];
  // gtag.js expects the arguments object itself, not an array.
  win.gtag = function gtag() { win.dataLayer.push(arguments); };
  win.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  win.gtag('consent', 'update', consentState(consent));
  win.gtag('js', new Date());
  // page_view is sent by config. The site has no client-side router, so every page is a full load.
  win.gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: consent.marketing,
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);
}

function clearGaCookies() {
  const domain = location.hostname.replace(/^www\./, '');
  document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(name => name === '_ga' || name.startsWith('_ga_')).forEach(name => {
    for (const d of ['', `; domain=${domain}`, `; domain=.${domain}`]) document.cookie = `${name}=; max-age=0; path=/${d}`;
  });
}

/** Applies the current choice: loads GA once on consent, updates or stops it on any later change. */
export function syncAnalytics(consent: Consent | null) {
  if (!measurementId) return;
  allowed = consent?.analytics === true;
  // Official per-property kill switch: with it set, gtag.js sends nothing even if already loaded.
  w()[`ga-disable-${measurementId}`] = !allowed;
  if (allowed && consent && !loaded) load(consent);
  else if (loaded) w().gtag('consent', 'update', consentState(consent));
  if (!allowed) clearGaCookies();
}

/** Sends a GA4 event only when GA is loaded and analytics is still allowed. Never pass personal data. */
export function trackEvent(name: string, params: Record<string, string | number> = {}) {
  if (!loaded || !allowed) return;
  w().gtag('event', name, params);
}

/** click_email / click_phone for every mailto: and tel: link, current and future. Bound once per page. */
export function trackContactClicks() {
  if (contactClicksBound) return;
  contactClicksBound = true;
  document.addEventListener('click', event => {
    const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href^="mailto:"], a[href^="tel:"]');
    if (!link) return;
    // Where on the page, not which address: the address is ours, but keep events free of contact data anyway.
    const area = link.closest('header') ? 'header' : link.closest('footer') ? 'footer' : 'content';
    trackEvent(link.protocol === 'tel:' ? 'click_phone' : 'click_email', { link_area: area, page_path: location.pathname });
  });
}
