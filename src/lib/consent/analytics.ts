// Google Analytics 4, loaded only with analytics consent and only when PUBLIC_GA_ID is set
// (e.g. PUBLIC_GA_ID=G-XXXXXXXXXX in .env or the hosting settings). Nothing loads before that.
// When GA goes live, also switch the analytics entry in data/legal.ts to `active: true`.
import type { Consent } from './consent';

const measurementId = import.meta.env.PUBLIC_GA_ID;
let loaded = false;

type GtagWindow = Window & { dataLayer: unknown[]; gtag: (...args: unknown[]) => void } & Record<string, unknown>;

export function syncAnalytics(consent: Consent | null) {
  if (!measurementId) return;
  const w = window as unknown as GtagWindow;
  const allowed = consent?.analytics === true;
  w[`ga-disable-${measurementId}`] = !allowed;
  if (allowed && !loaded) {
    loaded = true;
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag() { w.dataLayer.push(arguments); };
    w.gtag('js', new Date());
    w.gtag('config', measurementId, { anonymize_ip: true });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.append(script);
  }
  if (!allowed) {
    // Withdrawn consent: drop the GA cookies this site set (_ga, _ga_<ID>).
    const domain = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(name => name.startsWith('_ga')).forEach(name => {
      for (const d of ['', `; domain=${domain}`, `; domain=.${domain}`]) document.cookie = `${name}=; max-age=0; path=/${d}`;
    });
  }
}
