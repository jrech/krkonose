// Shared contracts for address lookup and coverage checks. Used by the browser and by the
// future server endpoints, so keep this file free of DOM and Node APIs.

/** One autocomplete row. `id` is opaque and only meaningful to the server-side provider. */
export interface AddressSuggestion {
  id: string;
  label: string;
  /** Second line, e.g. "Vrchlabí, okres Trutnov". */
  detail?: string;
}

/** An address a provider resolved to real coordinates. Typed text never becomes one of these. */
export interface ResolvedAddress {
  label: string;
  lat: number;
  lng: number;
  postcode?: string;
  municipality?: string;
  /** ISO 3166-1 alpha-2, lower case. */
  countryCode: string;
}

export type CoverageStatus = 'available' | 'unavailable' | 'manual_review' | 'unknown';

export interface CoverageResult {
  status: CoverageStatus;
  /** Why the checker decided so; for logs and support, not shown verbatim to visitors. */
  reason:
    | 'inside_zone'
    | 'outside_zones'
    | 'manual_zone'
    | 'postcode_rule'
    | 'municipality_rule'
    | 'outside_search_area'
    | 'area_not_approved'
    | 'lookup_not_configured'
    | 'lookup_failed';
  /** Service-area version the decision was made against. */
  areaVersion?: string;
}

export interface CoverageCheckResponse {
  address: ResolvedAddress;
  coverage: CoverageResult;
}

export const coverageStatuses: readonly CoverageStatus[] = ['available', 'unavailable', 'manual_review', 'unknown'];
