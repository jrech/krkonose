import type { ResultCopy, ResultKey } from '../lib/address/combobox';
import type { MunicipalityStatus } from './service-area';

// Visitor-facing result messages. `available` can only appear after a server check against an
// approved service area (src/data/service-area.ts); everything else leads to a personal answer.
export const coverageCopy: Record<ResultKey, ResultCopy> = {
  available: { title: 'Na tuto adresu svážíme.', text: 'Četnost a termíny svozu domluvíme v poptávce.' },
  unavailable: { title: 'Tato adresa je mimo naši běžnou svozovou oblast.', text: 'Individuální svoz ale může být možný. Napište nám a domluvíme se.' },
  manual_review: { title: 'Tuto adresu ověříme osobně.', text: 'Leží na okraji oblasti nebo pro ni platí zvláštní podmínky. Ozveme se s potvrzením.' },
  unknown: { title: 'Dostupnost vám potvrdíme osobně.', text: 'Adresu připojíme k vaší poptávce a ozveme se s odpovědí.' },
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
  available: { label: 'Svážíme', title: '{place}: sem svážíme.', text: 'Četnost a termíny svozu domluvíme v poptávce. Přesnou adresu provozu potvrdíme v odpovědi.', cta: 'Poptat svoz' },
  requires_confirmation: { label: 'Dostupnost potvrdíme', title: '{place}: dostupnost potvrdíme osobně.', text: 'Svoz do této obce potvrzujeme podle konkrétní adresy. Pošlete poptávku a ozveme se s odpovědí.', cta: 'Pokračovat k poptávce' },
  unavailable: { label: 'Běžně nejezdíme', title: '{place}: sem běžně nejezdíme.', text: 'Individuální svoz ale může být možný. Napište nám a domluvíme se.', cta: 'Zeptat se na individuální svoz' },
};
