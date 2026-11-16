# Svozová oblast: mapa, ověření adresy a nastavení

Sekce `03 / Svozová oblast` (`src/components/landing/Coverage.astro`) má dvě nezávislé části:

> **Varianta mapy** se přepíná v `src/data/map/config.ts`. Aktuálně je nastavené `'image'`: na tabletu a desktopu se zobrazí ilustrovaná mapa `src/assets/images/map/krkonose-mapa.png` (avif/webp/jpg, srcset 736–1663 px, poměr 1663 : 945, lazy). Na mobilu se vždy zobrazí SVG, protože popisky zapečené v obrázku by byly menší než 7 px. Ilustrace má popisky měst do ~1 km přesně, ale západní státní hranice u Harrachova, hranice krajů a jezera u Pece neodpovídají datům ČÚZK. Proto je v ní popisek „Ilustrační mapa“ a původní text „Podklad: ČÚZK, Natural Earth“ je z obrázku oříznutý. Hodnota `'svg'` vrátí přesnou mapu všude.

1. **Orientační mapa** (`CoverageMap.astro`). Ukazuje jen geografii. Nikdy neslouží jako hranice svozu.
2. **Ověření adresy** (`AddressSearch.astro` + `src/lib/address/*` + `src/lib/coverage/*`). Rozhoduje výhradně podle souřadnic a schválené svozové oblasti v `src/data/service-area.ts`.

## Aktuální oblast (schválil Jonas 24. 10. 2026)

- **Zóna „ano“**: konvexní obal kolem potvrzených míst rozšířený o 2,5 km. Generuje ho `node tools/service-area/build-zone.mjs` do `src/data/service-area-zone.ts`. Místa a buffer se mění na začátku skriptu.
- **Potvrzené obce** (`available`): Vrchlabí, Pec pod Sněžkou, Janské Lázně, Horní Maršov, Svoboda nad Úpou, Rudník, Mladé Buky, Jilemnice, Černý Důl, Dolní Dvůr, Lánov, Hostinné, Rokytnice nad Jizerou (vč. Františkova), Špindlerův Mlýn, Horní Branná, Benecko, Poniklá, Jestřabí v Krkonoších, Vítkovice (vč. Horních Mísečků a Skelných Hutí).
- **Individuálně po domluvě** (`individual`): Harrachov, Trutnov (nejsou v seznamu).
- **Mimo zónu** (`outsideZones: 'manual_review'`): „Individuálně po domluvě“ s odkazem na formulář. „Mimo oblast“ se ukáže jen u obce nastavené na `unavailable`, nebo když přepneš `outsideZones` na `'unavailable'`.

## Stavy měst na mapě (jediný zdroj pravdy)

Stav každého z 9 měst je v `serviceArea.municipalities` v `src/data/service-area.ts`. Hodnoty jsou `available` (Svážíme) / `individual` (Individuálně po domluvě) / `unavailable` (Mimo oblast). Stejná data čte mapa (tooltip, výsledek po kliknutí) i ověření adresy (`checkCoverage` podle obce z vyřešené adresy).

```ts
vrchlabi: { name: 'Vrchlabí', status: 'available', approvedBy: 'jméno majitele', approvedAt: '2026-11-01' },
```

- `available` bez `approvedBy` a `approvedAt` shodí build (`assertServiceArea()` v `Coverage.astro`). Za běhu se navíc bere jako `individual`.
- Texty tooltipu, výsledku a CTA pro každý stav jsou v `placeCopy` v `src/data/coverage-copy.ts`. Výběr města odpovídá za obec, ne za konkrétní adresu.
- CTA vede vždy na `/kontakt/?lokalita=…`. U `available` je to žluté tlačítko „Poptat svoz“, jinak textový odkaz.

### Interaktivní města

- Ilustrace: SVG vrstva ve viewBoxu obrázku (1663 × 945) nad `<Picture>`. Pozice značek jsou v `src/data/map/illustration-markers.ts` (změřené z PNG, ne z GPS). Při výměně obrázku je potřeba přeměřit jen tenhle soubor.
- Mobil: stejné chování na bodech SVG mapy (`CoverageMap.astro`).
- Chování: `src/lib/coverage/map-hotspots.ts`. Hover/focus ukáže tooltip, klik/Enter/mezerník vybere město, vyplní pole adresy a ukáže výsledek. Šipky přeskakují mezi městy (od západu na východ), Escape tooltip zavře. Tap na dotyku vybere a nechá tooltip otevřený. Psaní do pole výběr zruší (`coverage-place-clear`).
- Hover efekty jsou jen pod `(hover: hover)`. `prefers-reduced-motion` vypne škálování i přechody.

## Co funguje dnes

- Kompletní sekce na desktopu, tabletu i mobilu (na mobilu nejdřív formulář, pod ním SVG mapa).
- Našeptávač adres přes Mapy.com (combobox s listboxem, šipky / Enter / Escape, debounce 250 ms). Vybraná adresa se na serveru ověří proti `src/data/service-area.ts`.
- Dokud obec nemá potvrzený stav, výsledek je „Dostupnost vám potvrdíme osobně“. `available` se objeví jen u schválené obce nebo zóny.
- Ručně napsaný text (bez výběru z nabídky) se neověřuje. Propíše se jako neověřený text do poptávky. Bez JavaScriptu formulář odešle `?lokalita=…` na `/kontakt/`.
- `PUBLIC_ADDRESS_API_URL=off` při buildu vypne našeptávač a vrátí ruční režim.

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

### 2. Endpoint a hosting (Cloudflare Workers)

- Adaptér `@astrojs/cloudflare` (`astro.config.mjs`). Stránky zůstávají předgenerované, jako Worker běží jen `src/pages/api/address/[action].ts`. Sessions jsou vypnuté, aby se nezakládal KV namespace.
- Endpointy: `GET /api/address/suggest/?q=…` a `POST /api/address/check/` s `{ id }` (lomítko na konci kvůli `trailingSlash: 'always'`).
- Poskytovatel: `src/lib/address/providers/mapy-com.ts`. Prohlížeč dostane jen neprůhledné `id`. Server při kontrole zopakuje stejný dotaz na Mapy.com a přijme jen přesnou shodu, takže si návštěvník nemůže podstrčit vlastní souřadnice. (`/v1/geocode` jsme nepoužili, protože vracel sousední dům.)
- Klíč `MAPY_API_KEY` je jen na serveru: lokálně v `.dev.vars` (v .gitignore, vzor `.dev.vars.example`), na Cloudflare jako secret (`npx wrangler secret put MAPY_API_KEY` nebo Dashboard → Worker → Settings → Variables and Secrets).
- Nasazení: `npm run build` a `npx wrangler deploy`, nebo Cloudflare Workers Builds napojené na repozitář (build `npm run build`, deploy `npx wrangler deploy`). Konfigurace je ve `wrangler.jsonc`.
- Rate limiting: binding `ADDRESS_LIMITER` ve `wrangler.jsonc` (20 požadavků za 60 s na IP z `CF-Connecting-IP`, společně pro `suggest` i `check`). Kontrola běží v endpointu před voláním Mapy.com, při překročení vrací 429 s `Retry-After`. Limit je per Cloudflare lokace. Bez bindingu se limiter přeskočí jen v `astro dev`, nasazený Worker vrátí 503.
- Mapy.com se volá s timeoutem 3 s, našeptávač vrací nejvýše 5 návrhů, klient čeká 350 ms po posledním znaku a od 3 znaků hledá. Při 429 se v poli zobrazí „Příliš mnoho dotazů…“ a další dotazy se pozdrží o `Retry-After`.
- Našeptávač nabízí jen adresy v oblasti `searchArea` (`service-area.ts`: Krkonoše a Podkrkonoší s rezervou, zhruba 15,25–16,15 E a 50,40–50,92 N). Mapy.com nemá pevný filtr oblasti, takže se filtruje na serveru (z Mapy.com se bere 15 shod a ponechá se max. 5 uvnitř). Když shody existují jen mimo oblast (Praha, Brno…), server vrátí `outsideArea: true` a pole zobrazí „Do této lokality nesvážíme…“. Ručně podvržená adresa mimo oblast dostane z `/check/` stav `unavailable`.
- V produkci logujeme jen chyby poskytovatele, ne adresy.

## Mapa: zdroje dat a licence

| Vrstva | Zdroj | Licence / atribuce |
| --- | --- | --- |
| Státní hranice, hranice krajů, pevnina | ČÚZK, INSPIRE Územní správní jednotky, převod do GeoJSON: github.com/siwekm/czech-geojson (`kraje.json`) | CC BY 4.0, „© ČÚZK“ |
| Vrstevnice (700–1 400 m po 100 m) | Terrain Tiles on AWS Open Data (Mapzen/Tilezen, Terrarium z11), v Evropě z Copernicus EU-DEM a USGS SRTM | „Produced using Copernicus data and information funded by the European Union – EU-DEM layers“, „SRTM courtesy of the U.S. Geological Survey“ |
| Polohy měst (6; Rokytnice nad Jizerou z Wikipedie) | GeoNames cities1000 přes npm balíček `cities.json` | CC BY 4.0, „GeoNames“ |
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
