# Svozová oblast: mapa, ověření adresy a nastavení

Sekce `03 / Svozová oblast` (`src/components/landing/Coverage.astro`) má dvě nezávislé části:

> **Varianta mapy** se přepíná v `src/data/map/config.ts`. Aktuálně je nastavené `'image'`: na tabletu a desktopu se zobrazí ilustrovaná mapa `src/assets/images/map/krkonose-mapa.png` (avif/webp/jpg, srcset 736–1448 px, poměr 1448 : 1000, lazy). Na mobilu se vždy zobrazí SVG, protože popisky zapečené v obrázku by byly menší než 7 px. Ilustrace má popisky měst do ~1 km přesně, ale západní státní hranice u Harrachova, hranice krajů a jezera u Pece neodpovídají datům ČÚZK. Proto je v ní popisek „Ilustrační mapa“ a původní text „Podklad: ČÚZK, Natural Earth“ je z obrázku oříznutý. Hodnota `'svg'` vrátí přesnou mapu všude.

1. **Orientační mapa** (`CoverageMap.astro`). Ukazuje jen geografii. Nikdy neslouží jako hranice svozu.
2. **Ověření adresy** (`AddressSearch.astro` + `src/lib/address/*` + `src/lib/coverage/*`). Rozhoduje výhradně podle souřadnic a schválené svozové oblasti v `src/data/service-area.ts`.

## Stavy měst na mapě (jediný zdroj pravdy)

Stav každého z 8 měst je v `serviceArea.municipalities` v `src/data/service-area.ts`. Hodnoty jsou `available` / `unavailable` / `requires_confirmation` a výchozí stav všech je `requires_confirmation`. Stejná data čte mapa (tooltip, výsledek po kliknutí) i ověření adresy (`checkCoverage` podle obce z vyřešené adresy).

```ts
vrchlabi: { name: 'Vrchlabí', status: 'available', approvedBy: 'jméno majitele', approvedAt: '2026-11-01' },
```

- `available` bez `approvedBy` a `approvedAt` shodí build (`assertServiceArea()` v `Coverage.astro`). Za běhu se navíc bere jako `requires_confirmation`.
- Texty tooltipu, výsledku a CTA pro každý stav jsou v `placeCopy` v `src/data/coverage-copy.ts`. Výběr města odpovídá za obec, ne za konkrétní adresu.
- CTA vede vždy na `/kontakt/?lokalita=…`. U `available` je to žluté tlačítko „Poptat svoz“, jinak textový odkaz.

### Interaktivní města

- Ilustrace: SVG vrstva ve viewBoxu obrázku (1448 × 1000) nad `<Picture>`. Pozice značek jsou v `src/data/map/illustration-markers.ts` (změřené z PNG, ne z GPS). Při výměně obrázku je potřeba přeměřit jen tenhle soubor.
- Mobil: stejné chování na bodech SVG mapy (`CoverageMap.astro`).
- Chování: `src/lib/coverage/map-hotspots.ts`. Hover/focus ukáže tooltip, klik/Enter/mezerník vybere město, vyplní pole adresy a ukáže výsledek. Šipky přeskakují mezi městy (od západu na východ), Escape tooltip zavře. Tap na dotyku vybere a nechá tooltip otevřený. Psaní do pole výběr zruší (`coverage-place-clear`).
- Hover efekty jsou jen pod `(hover: hover)`. `prefers-reduced-motion` vypne škálování i přechody.

## Co funguje dnes

- Kompletní sekce na desktopu, tabletu i mobilu (na mobilu nejdřív formulář, pod ním mapa oříznutá na střed s většími popisky).
- Pole adresy se dá vyplnit a odeslat. Zatím není nastavený žádný poskytovatel, takže se zobrazí stav „Dostupnost vám potvrdíme osobně“ a adresa se jako **neověřený text** propíše do e-mailu poptávky (sekce Kontakt).
- Bez JavaScriptu formulář odešle `?lokalita=…#kontakt` a poptávka se předvyplní stejně.
- Výsledek `available` se zatím zobrazit nemůže: oblast má `status: 'not_configured'`, a dokud není `approved`, vrací `checkCoverage` vždy `unknown`.

## Co je připravené, ale vypnuté

- Našeptávač adres (combobox s listboxem, šipky / Enter / Escape, debounce 250 ms, stavy načítání / nic nenalezeno / chyba / vybráno). Zapne se, když build dostane `PUBLIC_ADDRESS_API_URL`.
- Serverové API `createAddressApi()` v `src/lib/address/server.ts`: validace vstupu, omezení na ČR, volání poskytovatele a kontrola pokrytí.
- Point-in-polygon pro GeoJSON `Polygon` / `MultiPolygon` (včetně děr), pravidla podle PSČ a zóny „ověřit ručně“.

## Datový tok

```
prohlížeč                          náš server (endpoint)                      poskytovatel
input ──GET /suggest?q=──────────► AddressAutocompleteProvider.suggest ────► Mapy.com / Google …
vybraný návrh ──POST /check {id}─► AddressResolutionProvider.resolve(id) ──► souřadnice + PSČ
                                   CoverageChecker.check(address)
                                     └─ src/data/service-area.ts (schválené zóny)
◄── { address, coverage: { status: available | unavailable | manual_review | unknown } }
```

Ručně napsaný text se nikdy neověřuje. Kontroluje se jen adresa, kterou poskytovatel převedl na souřadnice. Klient navíc odmítne každou odpověď, která nemá přesně očekávaný tvar, takže rozbitá odpověď nikdy nezobrazí „svážíme“.

## Jak zapnout ověřování

### 1. Svozová oblast (musí dodat a schválit majitel)

V `src/data/service-area.ts`:

```ts
export const serviceArea: ServiceAreaConfig = {
  status: 'approved',              // 'draft' = připraveno, ale stále vrací unknown
  version: '2026-11-01',
  approvedBy: 'jméno majitele',
  approvedAt: '2026-11-01',
  zones: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { id: 'zakladni', name: 'Běžný svoz', result: 'available' },
        geometry: { type: 'Polygon', coordinates: [[[15.55, 50.58], /* … [lng, lat] … */ [15.55, 50.58]]] } },
      { type: 'Feature', properties: { id: 'okraj', name: 'Okraj oblasti', result: 'manual_review' },
        geometry: { type: 'MultiPolygon', coordinates: [ /* … */ ] } },
    ],
  },
  postcodeRules: { manual_review: ['543 51'], unavailable: [] },
};
```

- Polygon nakreslíte třeba na geojson.io a vložíte `features`. Souřadnice jsou `[lng, lat]` (WGS 84).
- Pořadí rozhodování: neschválená oblast → `unknown`; pravidlo PSČ → jeho výsledek; uvnitř zóny `manual_review` → `manual_review`; uvnitř zóny `available` → `available`; jinak `unavailable` (zpráva: „mimo běžnou oblast, individuální svoz může být možný“).
- Texty výsledků jsou v `src/data/coverage-copy.ts`.

### 2. Serverový endpoint

Web je teď čistě statický (`output: 'static'`), takže endpoint potřebuje adaptér podle hostingu (`@astrojs/netlify`, `@astrojs/cloudflare`, `@astrojs/node` …). Pak přidejte `src/pages/api/address/[action].ts`:

```ts
import type { APIRoute } from 'astro';
import { createAddressApi } from '../../../lib/address/server';
import { serviceAreaChecker } from '../../../lib/coverage/check';
import { serviceArea } from '../../../data/service-area';
import { mapyComProvider } from '../../../lib/address/providers/mapy-com'; // napíšete podle zvoleného poskytovatele

export const prerender = false;
const provider = mapyComProvider(import.meta.env.MAPY_API_KEY); // klíč jen na serveru, bez PUBLIC_
const api = createAddressApi({ autocomplete: provider, resolver: provider, checker: serviceAreaChecker(serviceArea) });

export const GET: APIRoute = ({ params, request }) => params.action === 'suggest' ? api.suggest(request) : new Response(null, { status: 404 });
export const POST: APIRoute = ({ params, request }) => params.action === 'check' ? api.check(request) : new Response(null, { status: 404 });
```

Poskytovatel implementuje dvě rozhraní z `server.ts`:

- `AddressAutocompleteProvider.suggest(query, { limit, signal })` → `{ id, label, detail? }[]`, jen adresy v ČR (u Mapy.com `locality=cz`, `lang=cs`, `type=regional.address`; u Google Places `includedRegionCodes: ['cz']`).
- `AddressResolutionProvider.resolve(id)` → `{ label, lat, lng, postcode, municipality, countryCode: 'cz' }` nebo `null`.

Doporučení: rate limit na endpointu, krátká cache návrhů, v produkci logovat jen `coverage.reason` a `areaVersion`, ne celé adresy.

### 3. Zapnutí ve frontendu

Při buildu nastavte `PUBLIC_ADDRESS_API_URL=/api/address`. Bez téhle proměnné zůstává formulář v ručním režimu, i když endpoint existuje.

## Mapa: zdroje dat a licence

| Vrstva | Zdroj | Licence / atribuce |
| --- | --- | --- |
| Státní hranice, hranice krajů, pevnina | ČÚZK, INSPIRE Územní správní jednotky, převod do GeoJSON: github.com/siwekm/czech-geojson (`kraje.json`) | CC BY 4.0, „© ČÚZK“ |
| Vrstevnice (700–1 400 m po 100 m) | Terrain Tiles on AWS Open Data (Mapzen/Tilezen, Terrarium z11), v Evropě z Copernicus EU-DEM a USGS SRTM | „Produced using Copernicus data and information funded by the European Union – EU-DEM layers“, „SRTM courtesy of the U.S. Geological Survey“ |
| Polohy měst (6) | GeoNames cities1000 přes npm balíček `cities.json` | CC BY 4.0, „GeoNames“ |
| Pec pod Sněžkou, Janské Lázně | github.com/33bcdd/souradnice-mest (body obcí ČR, „volně k použití“), ověřeno proti Wikipedii (rozdíl < 300 m) | bez formální licence; při pochybnostech nahradit body z RÚIAN |

Krátká atribuce je přímo v mapě („Podklad © ČÚZK, GeoNames, Copernicus EU-DEM, USGS SRTM“).

Projekce: lokální ekvidistantní válcová se škálováním `cos(50,697°)`. V rámci výřezu (~60 × 48 km) je zkreslení pod 1 %. Rámec je v `src/data/map/frame.ts`.

### Úpravy mapy

- **Města a popisky**: `src/data/map/places.ts` (souřadnice, strana popisku, `compactLabel: 'below'` pro mobil). Do mapy se promítnou při buildu.
- **Geometrie** (`src/data/map/krkonose-geometry.ts`) je generovaná, ručně ji neupravujte. Přegenerování:

  ```sh
  cd tools/coverage-map
  npm install
  npm run build   # stáhne data do .cache/, zapíše src/data/map/krkonose-geometry.ts
  ```

  Interval vrstevnic, vyhlazení a zjednodušení jsou konstanty na začátku `build.mjs`. Při změně výřezu v `frame.ts` je nutné geometrii přegenerovat.

## Interakce a přístupnost

- SVG mapa má `<title>` a `<desc>` (popis výslovně říká, že neukazuje svozovou oblast).
- Města jsou `role="button"` s `aria-pressed` a přístupným jménem „Obec: stav“. Tooltip je proto `aria-hidden`. Mapy už nejsou `role="img"`, ale `role="group"`, protože obsahují ovládací prvky.
- Reveal používá existující `data-reveal` (`src/scripts/reveal.ts`), body měst se dolaďují o 180 ms později. `prefers-reduced-motion` vše vypne.
- Combobox: `role="combobox"` + `aria-activedescendant`, nabídka překrývá tlačítko (žádný posun layoutu), položky min. 48 px, výsledky a počty návrhů ohlašuje `aria-live`.
