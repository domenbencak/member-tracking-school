# Diagrami šolskega projekta

Diagrami so pripravljeni po dejanski kodi in shemi lokalne šolske različice.
**SVG** je vektorski format za povečavo in tisk, **PNG** pa je uporaben za
vključitev v predstavitev. Datoteke **Mermaid (.mmd)** omogočajo nadaljnje urejanje.

| Diagram | SVG | PNG | Izvor Mermaid |
| --- | --- | --- | --- |
| Arhitektura aplikacije | [SVG](diagrams/01-arhitektura.svg) | [PNG](diagrams/01-arhitektura.png) | [MMD](diagrams/01-arhitektura.mmd) |
| Vloge in funkcije | [SVG](diagrams/02-vloge-in-funkcije.svg) | [PNG](diagrams/02-vloge-in-funkcije.png) | [MMD](diagrams/02-vloge-in-funkcije.mmd) |
| Podatkovni model ER | [SVG](diagrams/03-podatkovni-model.svg) | [PNG](diagrams/03-podatkovni-model.png) | [MMD](diagrams/03-podatkovni-model.mmd) |
| Zaporedje prijave | [SVG](diagrams/04-zaporedje-prijave.svg) | [PNG](diagrams/04-zaporedje-prijave.png) | [MMD](diagrams/04-zaporedje-prijave.mmd) |
| Potek uvoza Excel | [SVG](diagrams/05-potek-uvoza.svg) | [PNG](diagrams/05-potek-uvoza.png) | [MMD](diagrams/05-potek-uvoza.mmd) |
| Sodelovanje in lokalno okolje | [SVG](diagrams/06-sodelovanje-in-lokalno-okolje.svg) | [PNG](diagrams/06-sodelovanje-in-lokalno-okolje.png) | [MMD](diagrams/06-sodelovanje-in-lokalno-okolje.mmd) |

## 1. Arhitektura

![Arhitektura](diagrams/01-arhitektura.svg)

Excel se prebere v brskalniku. Strežnik prejme preslikane vrstice, preveri
pravice in poslovna pravila ter uporabi lokalno bazo.

## 2. Vloge in funkcije

![Vloge in funkcije](diagrams/02-vloge-in-funkcije.svg)

To je pregled funkcij po vlogah, ne formalni UML diagram vseh primerov uporabe.
Administrator ima tudi pravice običajnega uporabnika.

## 3. Podatkovni model

![Podatkovni model](diagrams/03-podatkovni-model.svg)

Prikazanih je vseh sedem tabel in izbor njihovih atributov. Oznaki PK in FK
pomenita primarni in tuji ključ, UK pa unikaten ključ. Povezava
`duplicateMemberId: brez FK` predstavlja logično referenco. `AuditLog.entityId`
ni tuji ključ. `LoginAttempt` nima relacije z uporabniškim računom.
Vprašaj pri tipu označuje vrednost, ki lahko manjka. Črtkane relacije s FK so
neidentifikacijske: vsaka tabela ima svoj samostojen primarni ključ.

## 4. Zaporedje prijave

![Zaporedje prijave](diagrams/04-zaporedje-prijave.svg)

Prijava ločeno preveri omejitev poskusov, geslo in aktivnost računa. Zaščitena
stran ponovno preveri veljavnost seje in trenutne pravice.

## 5. Potek uvoza

![Potek uvoza](diagrams/05-potek-uvoza.svg)

Dejanja posameznih vrstic se zberejo v poročilu. Potrditev uvoza ponovno preveri
osnutek in spremembe shrani skupaj s poročilom in revizijskim zapisom.

## 6. Sodelovanje in lokalno okolje

![Sodelovanje](diagrams/06-sodelovanje-in-lokalno-okolje.svg)

GitHub sinhronizira kodo, ne podatkovnih baz ali zasebnih gesel.

## Ponovno generiranje

Po spremembi `.mmd` namestimo orodje Mermaid CLI v začasno mapo in ponovno
izrišemo vseh šest diagramov. Skripta uporabi Chromium iz obstoječega Playwrighta;
Mermaid CLI ni odvisnost same aplikacije. Ukaze izvedemo iz korena repozitorija.

```bash
npx playwright install chromium
diagram_tools=$(mktemp -d)
PUPPETEER_SKIP_DOWNLOAD=true npm install --prefix "$diagram_tools" --no-audit --no-fund @mermaid-js/mermaid-cli@12.0.0
node scripts/render-school-diagrams.mjs "$diagram_tools/node_modules/.bin/mmdc"
```

Diagrami so ustvarjeni z Mermaid CLI 12.0.0. PNG se izriše v dvojni ločljivosti.
Skripta omogoča ponovno generiranje SVG in
PNG brez spreminjanja datotek `.mmd`. Sintaksa in ukazi sledijo
[uradni dokumentaciji Mermaid CLI](https://github.com/mermaid-js/mermaid-cli).
Za pomen relacij uporabimo
[uradno dokumentacijo ER diagramov](https://mermaid.js.org/syntax/entityRelationshipDiagram.html).
