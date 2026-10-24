import type { ResultCopy, ResultKey } from '../lib/address/combobox';
import type { MunicipalityStatus } from './service-area';

// Visitor-facing result messages. `available` can only appear after a server check against an
// approved service area (src/data/service-area.ts); everything else leads to a personal answer.
export const coverageCopy: Record<ResultKey, ResultCopy> = {
  available: { title: 'Na tuto adresu svážíme.', text: 'Četnost a termíny svozu domluvíme v poptávce.' },
  unavailable: { title: 'Mimo oblast.', text: 'Tato adresa je mimo naši svozovou oblast a svoz sem zatím nenabízíme. Máte-li dotaz, napište nám.' },
  manual_review: { title: 'Individuálně po domluvě.', text: 'Tato adresa je mimo naši běžnou svozovou oblast, svoz ale můžeme domluvit individuálně. Využijte náš kontaktní formulář.' },
  unknown: { title: 'Individuálně po domluvě.', text: 'Svoz na tuto adresu nemáme potvrzený. Využijte náš kontaktní formulář a dostupnost vám potvrdíme.' },
  not_configured: { title: 'Dostupnost vám potvrdíme osobně.', text: 'Online ověření zatím nespouštíme. Adresu připojíme k vaší poptávce a svoz vám potvrdíme v odpovědi.' },
  not_selected: { title: 'Vyberte adresu z nabídky.', text: 'Bez výběru ji neumíme ověřit automaticky. Můžete ale pokračovat a ověříme ji osobně.' },
  failed: { title: 'Ověření se teď nepovedlo.', text: 'Adresu připojíme k vaší poptávce a dostupnost vám potvrdíme osobně.' },
};

export interface PlaceCopy {
  /** Short status in the map tooltip. */
  label: string;
  /** Result title under the address field; `{place}` is the town name. */
  title: string;
  text: string;
  /** Text of the inquiry link in the result. */
  cta: string;
}

// Picking a town on the map answers for the town as a whole, never for a specific address.
export const placeCopy: Record<MunicipalityStatus, PlaceCopy> = {
  available: { label: 'Svážíme', title: '{place}: svážíme.', text: 'Četnost a termíny svozu domluvíme v poptávce. Přesnou adresu provozu potvrdíme v odpovědi.', cta: 'Poptat svoz' },
  individual: { label: 'Individuálně po domluvě', title: '{place}: individuálně po domluvě.', text: 'Svoz sem domluvíme podle vašeho provozu. Využijte náš kontaktní formulář.', cta: 'Domluvit svoz' },
  unavailable: { label: 'Mimo oblast', title: '{place}: mimo oblast.', text: 'Svoz sem zatím nenabízíme. Máte-li dotaz, napište nám.', cta: 'Napsat nám' },
};
