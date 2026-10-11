# Izbira projekta in ključne funkcionalnosti

**Projekt:** Evidenca članov — šolska različica (`member-tracking-school`)  
**Datum pregleda:** 11. 10. 2026  
**Repozitorij:** [GitHub](https://github.com/domenbencak/member-tracking-school)

## 1. Izbrana rešitev

Izbrana je samostojna šolska kopija obstoječe aplikacije `member-tracking` za
upravljanje članov organizacije. Rešitev nadomešča preglednice s spletno
aplikacijo in relacijsko bazo. Uporablja Next.js, React, TypeScript, PostgreSQL,
Prisma in NextAuth; podatki za demonstracijo so izmišljeni.

Projekt je primeren za nadaljnje vaje, ker vsebuje **14 ključnih
funkcionalnosti**, dve uporabniški vlogi, podatkovni model s sedmimi tabelami,
uvoz z več koraki, pravila za podvojitve in obstoječa testna nabora. Obseg tako
presega zahtevanih 8–10 funkcionalnosti. Vzpostavitev je opisana v
[ločenem dokumentu](VZPOSTAVITEV.md), širša arhitektura pa v
[projektni dokumentaciji](DOKUMENTACIJA.md).

`USER` je običajni prijavljeni uporabnik, `ADMIN` pa administrator, ki ima tudi
pravice običajnega uporabnika. Seznam spodaj opisuje implementirano vedenje,
ne načrtovanih nadgradenj. Sam opis kode še ne pomeni, da je vsaka funkcija
pokrita z avtomatiziranim testom.

## 2. Pregled funkcionalnosti

| Oznaka | Funkcionalnost | Uporabnik | Vedenje in primer predstavitve | Glavni vir |
| --- | --- | --- | --- | --- |
| K-01 | Prijava, seja in odjava | USER, ADMIN | Prijava z e-pošto in geslom omogoči zaščitene strani; odjava zaključi sejo. | [Prijava](../src/lib/auth/options.ts), [odjava](../src/components/sign-out-button.tsx) |
| K-02 | Sprememba lastnega gesla | USER, ADMIN | Uporabnik vnese trenutno in novo geslo; sprememba razveljavi stare seje. | [Akcije uporabnikov](../src/lib/users/actions.ts), [obrazec](../src/components/change-password-form.tsx) |
| K-03 | Nadzorna plošča | USER, ADMIN | Prikaže število članov, članarino, veteranski status ter razporeditev po občinah, pododborih in starosti. | [Nadzorna plošča](../src/app/(app)/page.tsx), [poizvedbe](../src/lib/dashboard.ts) |
| K-04 | Iskanje, filtriranje in razvrščanje članov | USER, ADMIN | Iskanje po več poljih, filtri, razvrščanje in strani po 25, 50 ali 100 zapisov. | [Poizvedbe članov](../src/lib/members/queries.ts), [filtri](../src/components/member-filters.tsx) |
| K-05 | Podrobnosti člana | USER, ADMIN | Prikaže osebne in kontaktne podatke, članarino, status, datum spremembe in opombe. | [Podrobnosti](../src/app/(app)/clani/[id]/page.tsx) |
| K-06 | Dodajanje in urejanje članov | ADMIN | Shrani preverjena obvezna in neobvezna polja; podpira statuse Pokojen, Izstopil in Drugo. | [Akcije članov](../src/lib/members/actions.ts), [validacija](../src/lib/members/validation.ts) |
| K-07 | Arhiviranje in obnovitev | ADMIN | Arhiviran član izgine z običajnega seznama; iz arhiva ga je mogoče obnoviti. | [Akcije članov](../src/lib/members/actions.ts), [arhiv](../src/app/(app)/clani/arhiv/page.tsx) |
| K-08 | Uvoz iz Excela in obravnava podvojitev | ADMIN | Izbere list in preslikavo stolpcev, pregleda napake ter potrdi uvoz s pravilom SKIP, UPDATE ali CREATE_NEW. | [Čarovnik uvoza](../src/components/import-wizard.tsx), [storitev](../src/lib/import/service.ts) |
| K-09 | Zgodovina in poročila uvozov | ADMIN | Prikaže datoteko, izvajalca ter število ustvarjenih, posodobljenih, preskočenih in neveljavnih vrstic. | [Zgodovina](../src/app/(app)/uvozi/page.tsx), [poročilo](../src/app/(app)/uvozi/[id]/page.tsx) |
| K-10 | Posamezna naslovna nalepka | USER, ADMIN | Odpre predogled nalepke velikosti 99,1 × 38,1 mm in sproži tiskanje v brskalniku. | [Posamezna nalepka](../src/app/(app)/clani/[id]/nalepka/page.tsx) |
| K-11 | Skupinski tisk nalepk A4 | USER, ADMIN | Uporabi do 140 izbranih članov, 14 položajev na list in izbrani začetni položaj. | [A4 nalepke](../src/app/(app)/nalepke/a4/page.tsx), [izbor članov](../src/components/member-results.tsx) |
| K-12 | Izvoz posameznega člana | ADMIN | Prenese podatke posameznega člana kot JSON ali CSV; CSV nevtralizira začetke formul. | [API za izvoz](../src/app/api/members/[id]/export/route.ts), [CSV](../src/lib/csv.ts) |
| K-13 | Upravljanje uporabniških računov | ADMIN | Ustvari račun, spremeni vlogo, omogoči ali onemogoči dostop, ponastavi geslo oziroma izbriše račun; zaščiti zadnjega aktivnega administratorja. | [Akcije uporabnikov](../src/lib/users/actions.ts), [uporabniki](../src/app/(app)/uporabniki/page.tsx) |
| K-14 | Revizijska sled | ADMIN | Pregleda pomembna dejanja, izvajalca, čas in spremenjena polja; uporabi filtre revizijskih zapisov. | [Revizijska sled](../src/app/(app)/revizijska-sled/page.tsx), [zapisovanje](../src/lib/audit.ts) |

Pravice se preverjajo tudi na strežniku. Običajni uporabnik ne more izvajati
administratorskega uvoza z neposrednim klicem API. Prilagoditev prikaza za
mobilne naprave in preverjanje vhodov sta dodatni lastnosti rešitve.

## 3. Omejitve trenutne kopije

Skupinski izvoz CSV s seznama članov ni vključen med zgornjih 14 funkcionalnosti.
Gumb obstaja, vendar manjka API pot `/api/exports/members.csv`.
Izvoz posameznega člana ima svojo implementirano pot. Napaka skupinskega
izvoza je evidentirana v
[dokumentu o kakovosti](STANJE_TESTIRANJA_IN_ZAGOTAVLJANJA_KAKOVOSTI.md#4-odkrite-težave-in-razhajanja).

Javna registracija, samostojna obnovitev pozabljenega gesla, večfaktorska
prijava in skupno gostovano okolje niso implementirani. Tiskovne mere so
preverjene v kodi in brskalniku; fizični tisk na tiskalniku ni bil preverjen.

## 4. Predlagana predstavitev na vajah

1. Pokažemo lokalno postavitev in oba začetna računa.
2. Kot administrator prikažemo nadzorno ploščo, iskanje, filtre in podrobnosti.
3. Dodamo ali uredimo izmišljenega člana, nato ga arhiviramo in obnovimo.
4. Uvozimo [vzorčno preglednico](../public/examples/clani-vzorec.xlsx) ter pokažemo poročilo.
5. Pokažemo predogled posamezne in skupinskih nalepk ter izvoz posameznega člana.
6. Pokažemo uporabniške račune in revizijsko sled, nato primerjamo dostop z vlogo USER.

## 5. Uporaba generativne UI

Pri pregledu funkcionalnosti in pripravi dokumenta je bil uporabljen agent
**OpenAI Codex**. Vsaka funkcionalnost je bila primerjana z zgoraj povezanimi
izvornimi datotekami. Izbrane uporabniške poti so bile preverjene z obstoječimi
testi Playwright; njihov dejanski obseg je naveden v
[Stanju testiranja in zagotavljanja kakovosti](STANJE_TESTIRANJA_IN_ZAGOTAVLJANJA_KAKOVOSTI.md).
