import type { CoverageResult, CoverageStatus, ResolvedAddress } from '../address/types';
import { containsPoint } from './geometry';
import { municipalityStatus, type MunicipalityStatus, type ServiceAreaConfig } from '../../data/service-area';

export interface CoverageChecker {
  check(address: ResolvedAddress): Promise<CoverageResult>;
}

const normalisePostcode = (value: string) => value.replace(/\s+/g, '');
const normaliseName = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();

const fromMunicipality: Record<MunicipalityStatus, CoverageStatus> = {
  available: 'available',
  unavailable: 'unavailable',
  requires_confirmation: 'manual_review',
};

/**
 * Decides coverage from coordinates and business-approved rules only.
 * Order: valid coordinates → approved area (postcode exceptions → manual-review zones → available zones)
 * → municipality rule → outside the approved area, or `unknown` while no area is approved.
 * This function never guesses `available`: it needs an approved zone or an approved municipality.
 */
export function checkCoverage(address: ResolvedAddress, area: ServiceAreaConfig): CoverageResult {
  const areaVersion = area.version || undefined;
  if (!Number.isFinite(address.lat) || !Number.isFinite(address.lng)) return { status: 'unknown', reason: 'lookup_failed', areaVersion };
  const areaApproved = area.status === 'approved' && area.zones.features.length > 0;

  if (areaApproved) {
    const postcode = address.postcode && normalisePostcode(address.postcode);
    if (postcode) {
      for (const status of ['unavailable', 'manual_review', 'available'] as const satisfies CoverageStatus[]) {
        if (area.postcodeRules[status]?.some(code => normalisePostcode(code) === postcode)) return { status, reason: 'postcode_rule', areaVersion };
      }
    }
    const matching = area.zones.features.filter(zone => containsPoint(zone.geometry, address.lng, address.lat));
    if (matching.some(zone => zone.properties.result === 'manual_review')) return { status: 'manual_review', reason: 'manual_zone', areaVersion };
    if (matching.some(zone => zone.properties.result === 'available')) return { status: 'available', reason: 'inside_zone', areaVersion };
  }

  const municipality = address.municipality && normaliseName(address.municipality);
  const rule = municipality ? Object.values(area.municipalities).find(item => normaliseName(item.name) === municipality) : undefined;
  if (rule) return { status: fromMunicipality[municipalityStatus(rule)], reason: 'municipality_rule', areaVersion };

  return areaApproved
    ? { status: 'unavailable', reason: 'outside_zones', areaVersion }
    : { status: 'unknown', reason: 'area_not_approved', areaVersion };
}

export const serviceAreaChecker = (area: ServiceAreaConfig): CoverageChecker => ({
  check: async address => checkCoverage(address, area),
});
