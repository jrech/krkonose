interface ImportMetaEnv {
  /** Base URL of the address endpoints. Unset = "/api/address"; "off" = manual verification only. */
  readonly PUBLIC_ADDRESS_API_URL?: string;
  /** Endpoint accepting the inquiry as JSON (POST). Unset = the form prepares an e-mail instead. */
  readonly PUBLIC_INQUIRY_ENDPOINT?: string;
  /** Overrides the GA4 measurement ID in data/site.ts (G-…); "off" disables GA. Loads only after analytics consent. */
  readonly PUBLIC_GA_ID?: string;
}

// Worker bindings and secrets (wrangler.jsonc, .dev.vars locally). Only the address API reads them.
declare module 'cloudflare:workers' {
  export const env: {
    MAPY_API_KEY?: string;
    /** Rate Limiting binding (wrangler.jsonc). Missing in plain `astro dev` without the Workers runtime. */
    ADDRESS_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
  };
}
