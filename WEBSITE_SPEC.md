# Prádelna Krkonoše — Website & Content Spec

> Obsahová a UX specifikace pro Codex. Vychází z projektu, auditních poznámek a rozhodnutí v chatu. Nepotvrzené provozní údaje jsou označené jako ověřovací úkol, ne jako marketingové tvrzení.

## 1. Cíl webu

Pomoci hotelům, penzionům, apartmánům, chatám, chalupám, wellness a gastro provozům v Krkonoších rychle zjistit:
1. zda prádelna řeší jejich typ prádla,
2. zda obslouží jejich lokalitu,
3. jak probíhá svoz, praní, úprava a vrácení,
4. jak si vyžádat konkrétní nabídku.

Primární konverze: relevantní B2B poptávka. Sekundární: kliknutí na telefon nebo e-mail. Nehodnotit úspěch webu jen podle kliků.

## 2. Struktura stránek

Dohodnutý malý web:
- **Úvod** — hlavní landing page se službami, segmenty provozů, přehledem svozu, postupem, důvěrou, FAQ a CTA.
- **Kontakt / Poptávka** — samostatná stránka s krátkým formulářem, telefonem, e-mailem a informací, co se stane po odeslání.
- **Svozová oblast** — samostatnou stránku přidat jen tehdy, pokud potvrzený seznam lokalit, trasy nebo vyhledávání potřebují víc prostoru. Do té doby ponechat na Úvodu přehled a odkaz/CTA na ověření oblasti; nevytvářet prázdnou stránku.
- **O nás** a jednotlivé stránky hotelů/penzionů/gastra zatím nevytvářet automaticky. Segmenty zpracovat na landing page. Samostatné stránky mají smysl až s unikátním obsahem, důkazy a konkrétními podmínkami.

Navigace na landing page: **Úvod · Služby · Pro koho pereme · Svozová oblast · Jak to funguje · Kontakt**. Na Kontakt: logo/Úvod, případně stručné zpětné odkazy; primární CTA nesmí soupeřit s odesláním formuláře.

## 3. Doporučené pořadí landing page

1. **Header / navigace** — stručná navigace a jedno výrazné CTA.
2. **Hero** — konkrétní B2B nabídka, Krkonoše/oblast jen pokud je fakticky přesná, primární poptávka a telefon. První sdělení se zobrazí ihned.
3. **Důvěra / důkazy** — reference nebo provozní fakta pouze po potvrzení. Neověřená čísla nezobrazovat veřejnosti.
4. **Služby / celý výsledek** — vysvětlit celý řetězec: svoz → praní a úprava → kontrola, složení a zabalení → rozvoz. Explicitně zachovat skládání a přípravu textilu k použití, pokud to prádelna skutečně poskytuje.
5. **Pro koho pereme** — čtyři segmenty: Hotely a wellness; Penziony a apartmány; Chaty a chalupy; Gastro. Každý segment říká konkrétní potřebu a druh prádla, které prádelna skutečně přijímá.
6. **Svozová oblast** — jednoduchá stylizovaná mapa nebo ověřovač lokality, potvrzený seznam obcí, jasná fallback cesta pro neznámou lokalitu.
7. **Jak to funguje** — tři stručné kroky od první poptávky ke sjednanému režimu svozu.
8. **Kvalita a spolehlivost** — pouze konkrétní postupy potvrzené provozem: třídění zakázek, kontrola, evidence, reklamace nebo řešení výpadku podle toho, co se opravdu děje.
9. **Reference / případová studie** — skutečný klient, jeho souhlas a přesná citace nebo faktický minipřípad. Pokud zatím není, sekci nezaplňovat falešnou citací.
10. **FAQ** — odpovědi na praktické otázky, které brání poptávce.
11. **Závěrečné CTA** — vést na samostatný Kontakt / Poptávka.
12. **Footer** — telefon, e-mail, oblast, důležité odkazy a právní údaje.

Sekce nemají znovu opakovat stejné benefity. Každá přidává nové rozhodovací informace.

## 4. Obsah čtyř provozních segmentů

Karty provozů mohou být fotografické, vrstvené při scrollu na desktopu. Každá karta má:
- název segmentu,
- 1 stručnou větu o provozní potřebě,
- 3–5 položek prádla, pokud jsou potvrzené,
- krátkou větu k režimu svozu jen pokud je potvrzený,
- CTA, které vede do poptávky s předvybraným segmentem.

Pracovní náměty k ověření:
- **Hotely a wellness:** ložní a koupelnový textil, případně župany.
- **Penziony a apartmány:** ložní prádlo a ručníky; výměny mezi pobyty nebo sezónní špička.
- **Chaty a chalupy:** povlečení a koupelnový textil; objem a frekvence podle provozu.
- **Gastro:** ubrusy, utěrky a pracovní textil — pouze pokud je prádelna přijímá.

Fotografie mají ukazovat skutečný textil/předání/provoz, ne generické hotelové interiéry. Na mobilu nepoužívat sticky překrytí; karty se skládají běžně pod sebe.

## 5. Svozová oblast a mapa

Mapa má odpovědět: **„Obsloužíte tuto obec nebo adresu?“** Nesmí být jen dekorace.
- Zobrazovat pouze ověřené obsluhované obce a trasy.
- U každé lokality uvést frekvenci nebo den svozu pouze po potvrzení.
- Pod mapou/vedle ní poskytnout seznam obcí a vyhledávání jako rovnocennou mobilní a přístupnou alternativu.
- Pokud obec není nalezena, dát jasnou možnost kontaktovat prádelnu a ověřit adresu.
- Interakce musí fungovat kliknutím i klávesnicí; hover je jen doplněk.
- Pokud se použije našeptávání adresy, zobrazit podmínky pokrytí až po ověření přes data služby. Neodvozovat dostupnost z pouhé geografické blízkosti.
- Přesnou polohu provozovny nepovyšovat nad informaci o svozu; rozsah a podmínky oblasti jsou pro návštěvníka důležitější.

## 6. Kontakt / Poptávka

Krátká forma:
- Jméno a provozovna.
- Typ provozu (předvyplnit z CTA segmentu, pokud návštěvník přišel z karty).
- Obec nebo adresa provozu.
- Telefon **nebo** e-mail jako povinný kontaktní kanál; druhý může být volitelný.
- Orientační množství/frekvence může být volitelné, pokud pomůže připravit nabídku.
- Krátká zpráva volitelně.
- Souhlas a odkaz na zásady ochrany osobních údajů podle skutečného právního nastavení webu.

Vysvětlit, co se stane po odeslání a kdy se prádelna ozve, ale termín uvádět až po potvrzení. Zajistit validaci, chybové a úspěšné stavy a ochranu proti spamu. Formulář nesmí vyžadovat data, která nejsou nutná k prvnímu kontaktu.

## 7. FAQ — otázky k pokrytí

Připravit stručné odpovědi, po potvrzení majitelem:
- Za jak dlouho vracíte prádlo?
- Jezdíte o víkendech a svátcích?
- Máte minimální množství pro svoz?
- Jak se účtuje doprava?
- Jak evidujete prádlo a řešíte reklamace?
- Lze domluvit sezónní nebo zkušební spolupráci?
- Obsloužíte naši obec nebo konkrétní adresu?

Nevkládat obecné odpovědi typu „vždy se přizpůsobíme“, pokud za nimi není konkrétní a pravdivý postup.

## 8. Fakta, která jsou před publikací k ověření

Nezobrazovat jako skutečnost, dokud je majitel nepotvrdí:
- počet let zkušeností; oddělit historii firmy od zkušeností týmu,
- počet obsluhovaných provozů a svozů,
- jména klientů, loga, citace, výsledky a souhlas se zveřejněním,
- přesné obce, adresy, trasy, svozové dny a frekvence,
- kapacita v hlavní sezóně, doba obratu, víkendový a sváteční servis,
- minimální objem, doprava, cenotvorba a zkušební spolupráce,
- seznam zpracovávaných textilií pro každý segment,
- kontrolní postupy, evidence, reklamace a náhradní řešení,
- reálné osoby, role, historie, vybavení a fotografie provozu,
- kontaktní údaje, otevírací doba, právní identifikace a ochrana osobních údajů.

Čísla „10+ let“, „35+ provozů“ a „200+ svozů“ se vyskytla jako návrh a musí se ověřit; předchozí web uváděl 30+ provozů. Nepovažovat žádné z těchto čísel za schválený fakt.

## 9. Obsahové a technické mantinely

- Čeština, přímé a konkrétní formulace, srozumitelné i bez marketingových frází.
- Žádné neověřené sliby, falešné reference, smyšlené certifikace ani dekorativní statistiky.
- Odstranit odkaz „LLM info“ z běžného patičkového menu.
- Nedělat opakující se stránky pro segmenty, pokud se liší jen názvem a fotkou.
- Zachovat čitelnou hierarchii, mobilní rozložení, sémantické nadpisy, alt texty a přístupné ovládání.
- Formulář musí dávat jasnou zpětnou vazbu a skutečně doručit poptávku; otestovat celý průchod.
- SEO obsah má odpovídat skutečnému pokrytí a službám. Nevytvářet lokalizační stránky bez unikátní užitečné informace.
- Měřit odeslání relevantního formuláře, kliknutí na telefon/e-mail a následně domluvenou spolupráci, pokud je tracking dostupný a nastavený v souladu se soukromím.
