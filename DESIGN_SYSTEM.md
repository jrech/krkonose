# Prádelna Krkonoše — Design System

> Implementační zdroj pravdy pro aktuální webový refresh. Layout a vizuální styl vycházejí z `krkonose-export.html` a `krkonose-export-mobile.html`; obsah a provozní tvrzení musí zůstat ověřené.
> Když se starší specifikace nebo existující kód rozcházejí s exporty Refresh 02, zachovej návrh exportů. Nepřebírej ale placeholder loga, reference ani tvrzení označená k ověření.

## 1. Značka a vizuální směr

**Charakter:** lokální B2B prádelna, klidná, konkrétní, spolehlivá a současná. Má působit jako dobře organizovaný servis pro provozy v Krkonoších, ne jako luxusní hotel ani generický SaaS.

**Vizuální principy**
- Světlý, vzdušný základ; tmavý petrolej pro kontrastní obsah.
- Sytý hluboký tyrkys pro velké plochy kvality, kontaktu a patičky.
- Tyrkys je funkční akcent pro odkazy a malé interaktivní prvky.
- Sluneční žlutá vyhrazená pro hlavní CTA a omezené zvýraznění.
- Reálné fotografie dodávky, prádla, předání a provozu. Nepředstírat ilustrační nebo AI snímky jako vlastní provoz.
- Výrazná, ale střízlivá typografie. Málo dekorace, žádné náhodné SaaS widgety, grafy ani falešné metriky.
- Vrstvené fotografické karty provozů jsou hlavní scroll moment stránky. Zbytek webu zůstává klidný.

## 2. Barvy

| Token | Hodnota | Použití |
|---|---|---|
| `--pk-ink` | `#092E32` | Primární text, nadpisy, tmavé plochy |
| `--pk-deep-teal` | `#075B66` | Velké kontrastní plochy kvality, kontaktu a patičky |
| `--pk-teal` | `#087F86` | Odkazy, ikony a aktivní stavy na světlém pozadí |
| `--pk-teal-hover` | `#06666C` | Hover odkazů/tlačítek s tyrkysovým pozadím |
| `--pk-yellow` | `#FFD166` | Hlavní CTA a malé akcenty |
| `--pk-yellow-hover` | `#F2BE4B` | Hover hlavního CTA |
| `--pk-paper` | `#F5F8F6` | Výchozí pozadí stránky |
| `--pk-white` | `#FFFFFF` | Karty, formulářová pole a kontrastní plochy |
| `--pk-muted` | `#53696B` | Sekundární text |
| `--pk-dark-muted` | `#D6E1DE` | Tlumený text na hlubokém tyrkysu |
| `--pk-line` | `#D6E1DE` | Ohraničení, dělicí linky |
| `--pk-error` | `#B63838` | Chybové stavy |
| `--pk-success` | `#236A4B` | Úspěšné stavy |

**Kontrastní pravidla**
- Žlutá tlačítka vždy používají tmavý ink text.
- Tyrkysové odkazy používej na světlém pozadí a s viditelným hover/focus stavem.
- Světlý tyrkys nepoužívej pro drobný text.
- Na tmavé ploše používej bílý text a dostatečně kontrastní tlumený text; ověř kontrast ve výsledném CSS.

**Poznámka k barvám:** `#092E32` zůstává barvou textu a hlavním inkoustem. Export Refresh 02 přidává `#075B66` jako samostatnou barvu velkých tmavých ploch; nepoužívej ji místo `--pk-ink` pro drobný text.

## 3. Typografie

**Rodina:** Rethink Sans pro celý web. Používej lokálně dostupný font nebo Google Fonts podle projektu; při načítání zajisti systémový sans-serif fallback.

| Role | Desktop | Mobil | Váha / řádkování |
|---|---:|---:|---|
| Display / hlavní hero | 80 px | 44 px | 500 / 1.05 |
| H1 | 64 px | 44 px | 500 / 1.10 |
| H2 | 48 px | 32 px | 500 / 1.15 |
| H3 | 28 px | 24 px | 500 / 1.25 |
| H4 | 24 px | 22 px | 500 / 1.30 |
| Lead / body large | 18 px | 17 px | 400 / 1.55 |
| Body | 16 px | 16 px | 400 / 1.60 |
| Small / label | 14 px | 14 px | 400–600 / 1.45 |
| Caption / eyebrow | 12 px | 12 px | 600 / 1.40 |

- Navigace a text tlačítek: 16 px, váha 600.
- Eyebrow: 12–14 px, váha 600, tracking přibližně 1 px, střídmé použití.
- Textové sloupce drž přibližně na 60–70 znacích na řádek.
- Nadpisy mají sdělovat nabídku nebo přínos; nepoužívej obecné nadpisy jen kvůli velikosti.
- Pro češtinu používej správnou diakritiku a typografické uvozovky.

## 4. Rozvržení a spacing

- Základní jednotka: 8 px. Používej škálu 4, 8, 16, 24, 32, 48, 64, 80, 120 a 160 px.
- Desktop: 12 sloupců, mezera 24 px, okraje minimálně 48 px.
- Tablet: 8 sloupců, mezera 24 px, okraje 32 px.
- Mobil: 4 sloupce, mezera 16 px, okraje 20–24 px.
- Maximální šířka obsahu podle exportu: 1440 px. Obsah centrovat; na širokém monitoru neprotahovat fotografie ani text přes celou plochu.
- Vertikální odstup sekcí: desktop 120–160 px, tablet 80–96 px, mobil 64–80 px. V kódu tři tokeny v `tokens.css`: `--section-space-s` (120 px, husté seznamy typu FAQ), `--section-space` (144 px, výchozí) a `--section-space-l` (160 px, krátké sekce s jedním sdělením: Kvalita, Reference, Kontakt).
- Vnitřní rytmus sekcí: 16/24/32/48 px. Větší mezery používej jen pro skutečné skupiny obsahu.
- Při přepočtu layoutu upřednostni čitelnou délku řádku a skutečný obsah před mechanickým zachováním 12sloupcové mřížky.

## 5. Tvary, fotografie a ikony

- Tlačítka i formulářová pole: radius 14 px (`--radius-button`, pole přes `--radius-field`), aby input a tlačítko pod ním držely stejný tvar.
- Fotografie: radius 12–16 px; důsledně opakovat zvolenou hodnotu v rámci jedné sekce.
- Závěrečná CTA karta: šířka obsahového kontejneru, radius 16 px (`--radius-image`), překrývá předěl světlé sekce nad ní a tmavé patičky.
- Linky: 1 px, barva `--pk-line`.
- Stíny pouze pro prvek, který se skutečně vznáší nad obsahem (například sticky navigace); žádné plošné stínování všech karet.
- Ikonografie: střídmé outline ikony dle exportu, velikost 24 px a jednotná tloušťka. Používat funkčně; ikona nesmí nahrazovat srozumitelný popisek.
- Ikonové dlaždice (`krkonose_new.html`): každá ikona i číslo kroku sedí ve stejném zaobleném čtverci `.tile` (45 × 45 px, radius 13 px, okraj 1 px, ikona 20 px; na mobilu 40 px; o 30 % menší než 64px dlaždice v exportu, na Jonasovo přání). Varianty: tyrkysová na světlé ploše (Služby, „Co bude dál“), `.tile--dark` s průsvitně bílou plochou a žlutou ikonou na deep teal (Péče o textil, kontaktní karty), `.tile--gold` pro čísla kroků (Tři kroky). `.tile--s` (31 px) jen tam, kde je málo místa (kontakt). Tokeny `--tile-*` v `tokens.css`.
- Karty (Svozová oblast, FAQ): radius 20 px (`--card-radius`), okraj `--card-line` (#DCE5DF). Gradienty jen u warm gold CTA, nikde jinde.
- Fotky nikdy násilně neroztahovat. Zachovat přirozený poměr stran a použít `object-fit: cover` jen v definovaném rámu s promyšleným `object-position`.
- Hero Refresh 02 používá editorial sazbu: velký titulek a poptávku vedle sebe nad širokou panoramatickou fotografií; na mobilu se obsah skládá svisle.
- Karty provozů mají na desktopu fotografii vedle textu a mohou se vrstvit sticky; na mobilu se zobrazí jako samostatné bílé karty v běžném toku.
- Hero panorama může využít šířku obsahu; zachovej důležité části fotografie v desktopovém i mobilním ořezu.
- Pro celoplošný obrazový rám max. 1440 px počítej přibližně s 2880 px širokým zdrojem pro 2× zobrazení. Použij samostatný mobilní ořez, pokud kompozice jinak nefunguje.
- Ořez nesmí skrývat podstatnou dodávku, člověka nebo textil. Kontrolovat při skutečné velikosti zdrojového souboru; upscale nedoplní chybějící detail.
- Preferuj vlastní fotografie skutečného provozu. Pokud se použijí stock/AI/ilustrační snímky, nepopsat je jako vlastní dokumentaci.

## 6. Komponenty a stavy

### Tlačítka
Zdroj stavů: `Warm gold — Button states-export.html` (Button states / 06). Font zůstává Rethink Sans 16 px / 600, ne Inter z exportu. Hodnoty jsou tokeny `--btn-*` v `tokens.css`, pravidla v `global.css`.
- **Primary (warm gold):** třístupňový zlatý gradient, gradientní okraj 1 px, jemný bevel a 2px „lip“ stín pod tlačítkem, text `#35250D`, radius 14 px (`--radius-button`), výška 56 px desktop / nejméně 48 px mobil.
- **Hover (zjemněný 2026-11-05):** světlejší gradient se prolne za 250 ms (`--motion-btn`), zvednutí jen o 1 px, mírně větší stín; popisek se odroluje o jeden řádek za 300 ms (`--motion-roll`). Vše ease-out, jen pro `(hover: hover)`. Ghost se nezvedá, jen dostane zlatý nádech.
- **Pressed (:active):** tmavší „propadlý“ gradient, vnitřní stín, posun o 2 px dolů, rychlejší přechod (90 ms).
- **Keyboard focus:** obrys 2 px `#72501C` s odstupem 3 px, kopíruje radius; stín se zmenší. Na tmavé ploše (kontaktní karta) je obrys žlutý přes `--btn-ring`.
- **Ghost (`.button--secondary`):** průhledná plocha, jemný zlatý okraj 1,5 px, text `#785018`; hover lehký zlatý nádech.
- **Disabled (`:disabled`, `aria-disabled="true"`):** `#E9EAE5` plocha, `#DBDED6` okraj, text `#8A8F82` / 500, bez stínu, hoveru a posunu.
- Barvy gradientu se mezi stavy plynule prolínají (registrované `@property`); `prefers-reduced-motion` vypíná přechody i posuny.
- **Text link:** tyrkysový odkaz, podtržení na hover/focus; vhodný pro navigaci a sekundární odkazy.
- Cookie lišta (`.cc-btn`) má vlastní styl pro tmavý pruh a warm gold nepoužívá.
- V jednom obsahovém bloku má být nejvýše jedna vizuálně dominantní primary akce.

### Formulářová pole
- Label vždy viditelný nad polem; placeholder není náhradou labelu.
- Pole se světlým šedozeleným fillem `--pk-field` (#F3F6F4) a jemnou linkou `--pk-field-line` (#DFE7E3), bez stínů (i iOS vnitřní stín je vypnutý); při focusu bílý fill + tyrkysový obrys. Ink text, radius 14 px (`--radius-field`); standardní text nejméně 16 px.
- Focus má zřetelný outline/ring.
- Chybu popsat textem i barvou; uveď, jak ji napravit.
- Po úspěšném odeslání zobrazit potvrzení a další očekávaný krok.
- Poptávka nemá vyžadovat současně telefon i e-mail. Nabídnout jeden preferovaný kontaktní údaj a jednoduché pole pro druhý pouze jako volitelné.
- Nevyžadovat detaily, které lze zjistit při následném hovoru.

### Navigace
- Jednoduchá a přehledná; na desktopu nabídni telefon jako sekundární přímou cestu a poptávku jako hlavní akci stránky.
- Lišta je bílá plocha s linkou `--header-line` (#CAD8D4) a jemným stínem `--header-shadow`; po odscrollování se stín mírně prohloubí. Telefon 16 px s ikonou v deep teal.
- Svozovou oblast zobraz jako orientační diagram s jasným upozorněním, že vyznačená místa nepotvrzují dostupnost svozu.
- Na mobilu nabídnout ovladatelné menu s přístupným názvem, stavy a klávesnicovou obsluhou.

## 7. Pohyb a přístupnost

- Hero nadpis a hlavní CTA jsou viditelné ihned; žádný preloader ani animace nesmí zadržet hlavní sdělení.
- Hover: 160–200 ms. Scroll reveal: 400–600 ms, posun nejvýše 16–24 px, bez skrytí obsahu při vypnutém JavaScriptu.
- Vrstvení karet provozů může být sticky na desktopu, pokud uživatel může plynule scrollovat a každý obsah zůstane čitelný. Na mobilu karty zobrazit v normálním svislém toku bez sticky překrývání.
- Respektovat `prefers-reduced-motion`: vypnout nebo výrazně zjednodušit reveal, posuny a sticky animace.
- Zachovat viditelný focus, sémantické nadpisy, přístupné názvy ovládacích prvků, dostatečný kontrast a ovládání mapy klávesnicí.
- Informace nesmí být dostupná pouze přes hover.

## 8. Praktické implementační pravidlo

Nejdřív použij existující tokeny a komponenty v kódu. Nevytvářej druhou paletu, paralelní typografii ani vlastní styl tlačítek pro jednotlivé sekce. Pokud návrh vyžaduje nový token, přidej ho s pojmenováním podle role a aktualizuj tento dokument.
