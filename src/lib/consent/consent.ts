// Cookie consent state, stored in localStorage (listed as "Uložení vaší volby" in data/legal.ts).
// Anything that needs consent listens for CONSENT_EVENT and checks hasConsent() before loading.

export type ConsentCategory = 'analytics' | 'marketing' | 'maps';
export const OPTIONAL_CATEGORIES: ConsentCategory[] = ['analytics', 'marketing', 'maps'];

export interface Consent {
  version: number;
  analytics: boolean;
  /** Advertising storage and signals (Consent Mode ad_*). Separate from analytics on purpose. */
  marketing: boolean;
  maps: boolean;
  /** ISO time of the choice; the choice expires after MAX_AGE_DAYS and we ask again. */
  decidedAt: string;
  /** Random id that only tells records apart. Not linked to a person. */
  id: string;
}

const STORAGE_KEY = 'pk-consent';
// Bump when categories change so everyone is asked again.
const VERSION = 2;
const MAX_AGE_DAYS = 365;

export const CONSENT_EVENT = 'pk:consent-change';
export const OPEN_SETTINGS_EVENT = 'pk:consent-open';

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const consent = JSON.parse(raw) as Consent;
    const age = Date.now() - Date.parse(consent.decidedAt);
    if (consent.version !== VERSION || OPTIONAL_CATEGORIES.some(c => typeof consent[c] !== 'boolean') || !(age >= 0) || age > MAX_AGE_DAYS * 864e5) return null;
    return consent;
  } catch {
    return null;
  }
}

export function hasConsent(category: ConsentCategory): boolean {
  return readConsent()?.[category] === true;
}

export function saveConsent(choice: Pick<Consent, ConsentCategory>): Consent {
  const consent: Consent = {
    version: VERSION,
    analytics: choice.analytics,
    marketing: choice.marketing,
    maps: choice.maps,
    decidedAt: new Date().toISOString(),
    id: readConsent()?.id ?? (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)),
  };
  // Private windows or blocked storage: the choice still applies for this page view.
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(consent)); } catch {}
  document.dispatchEvent(new CustomEvent<Consent>(CONSENT_EVENT, { detail: consent }));
  return consent;
}

/** Grants one category without touching the others, e.g. the "Načíst mapu" button. */
export function grantConsent(category: ConsentCategory) {
  const current = readConsent();
  saveConsent({ analytics: current?.analytics ?? false, marketing: current?.marketing ?? false, maps: current?.maps ?? false, [category]: true });
}

export function openConsentSettings() {
  document.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}
