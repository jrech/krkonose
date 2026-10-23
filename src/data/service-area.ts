// Operational pickup area — the ONLY source of truth for coverage answers, shared by the address
// check (src/lib/coverage/check.ts) and the interactive map (src/lib/coverage/map-hotspots.ts).
// Independent of the illustrative map (src/data/map/*): never derive coverage from map labels or SVG paths.
//
// Two layers, both owner-approved:
// - `municipalities`: per-town status for the towns on the map. Every town starts as
//   'requires_confirmation'; 'available' only counts with approvedBy + approvedAt (build fails otherwise).
// - `zones` + `postcodeRules`: precise boundaries for automated address checks. Status stays
//   'not_configured' until the owner provides and approves them.
// How to fill it in: docs/svozova-oblast.md.
import type { AreaGeometry } from '../lib/coverage/geometry';
import type { MapPlaceId } from './map/places';

export interface ServiceZone {
  type: 'Feature';
  geometry: AreaGeometry;
  properties: {
    id: string;
    name: string;
    /** `available` = regular pickup confirmed; `manual_review` = edge of area, confirm case by case. */
    result: 'available' | 'manual_review';
  };
}

export type MunicipalityStatus = 'available' | 'unavailable' | 'requires_confirmation';

export interface MunicipalityRule {
  /** Official municipality name, matched against the resolved address (case and diacritics insensitive). */
  name: string;
  status: MunicipalityStatus;
  /** Required for 'available': who confirmed regular pickup there and when (e.g. '2026-11-01'). */
  approvedBy?: string;
  approvedAt?: string;
}

export interface ServiceAreaConfig {
  status: 'not_configured' | 'draft' | 'approved';
  /** Bump on every boundary change, e.g. '2026-11-01'. Returned with each check for support. */
  version: string;
  /** Who approved the boundaries and when; required before status becomes 'approved'. */
  approvedBy?: string;
  approvedAt?: string;
  zones: { type: 'FeatureCollection'; features: ServiceZone[] };
  /** Postcode exceptions (PSČ, e.g. '543 01'); they override zones. */
  postcodeRules: Partial<Record<'available' | 'manual_review' | 'unavailable', string[]>>;
  municipalities: Record<MapPlaceId, MunicipalityRule>;
}

const unconfirmed = (name: string): MunicipalityRule => ({ name, status: 'requires_confirmation' });

export const serviceArea: ServiceAreaConfig = {
  status: 'not_configured',
  version: '',
  zones: { type: 'FeatureCollection', features: [] },
  postcodeRules: {},
  // No town is confirmed yet. Example once the owner confirms one:
  // vrchlabi: { name: 'Vrchlabí', status: 'available', approvedBy: 'jméno majitele', approvedAt: '2026-11-01' },
  municipalities: {
    vrchlabi: unconfirmed('Vrchlabí'),
    'spindleruv-mlyn': unconfirmed('Špindlerův Mlýn'),
    harrachov: unconfirmed('Harrachov'),
    'pec-pod-snezkou': unconfirmed('Pec pod Sněžkou'),
    'janske-lazne': unconfirmed('Janské Lázně'),
    trutnov: unconfirmed('Trutnov'),
    hostinne: unconfirmed('Hostinné'),
    jilemnice: unconfirmed('Jilemnice'),
  },
};

const isApproved = (rule: MunicipalityRule) => Boolean(rule.approvedBy?.trim() && rule.approvedAt?.trim());

/** Effective status: an 'available' rule without approval is treated as 'requires_confirmation'. */
export function municipalityStatus(rule: MunicipalityRule | undefined): MunicipalityStatus {
  if (!rule) return 'requires_confirmation';
  return rule.status === 'available' && !isApproved(rule) ? 'requires_confirmation' : rule.status;
}

/** Called at build time (Coverage.astro) so a half-filled approval stops the build instead of shipping. */
export function assertServiceArea(area: ServiceAreaConfig = serviceArea) {
  const unapproved = Object.entries(area.municipalities)
    .filter(([, rule]) => rule.status === 'available' && !isApproved(rule))
    .map(([id]) => id);
  if (unapproved.length) throw new Error(`service-area.ts: 'available' needs approvedBy and approvedAt (${unapproved.join(', ')})`);
  if (area.status === 'approved' && !(area.approvedBy && area.approvedAt && area.version)) {
    throw new Error("service-area.ts: status 'approved' needs version, approvedBy and approvedAt");
  }
}
