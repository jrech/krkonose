interface ImportMetaEnv {
  /** Base URL of the address endpoints. Unset = "/api/address"; "off" = manual verification only. */
  readonly PUBLIC_ADDRESS_API_URL?: string;
  /** Endpoint accepting the inquiry as JSON (POST). Unset = the form prepares an e-mail instead. */
  readonly PUBLIC_INQUIRY_ENDPOINT?: string;
  /** Overrides the GA4 measurement ID in data/site.ts (G-…); "off" disables GA. Loads only after analytics consent. */
  readonly PUBLIC_GA_ID?: string;
}
