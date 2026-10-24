interface ImportMetaEnv {
  /** Base URL of the address endpoints. Unset = "/api/address"; "off" = manual verification only. */
  readonly PUBLIC_ADDRESS_API_URL?: string;
  /** Endpoint accepting the inquiry as JSON (POST). Unset = the form prepares an e-mail instead. */
  readonly PUBLIC_INQUIRY_ENDPOINT?: string;
  /** Google Analytics 4 measurement ID (G-…). Loads only after analytics consent. Unset = no GA. */
  readonly PUBLIC_GA_ID?: string;
}

// Worker bindings and secrets (wrangler.jsonc, .dev.vars locally). Only the address API reads them.
declare module 'cloudflare:workers' {
  export const env: { MAPY_API_KEY?: string };
}
