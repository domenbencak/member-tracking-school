# Vzpostavitev projekta

**Projekt:** Evidenca članov — šolska različica (`member-tracking-school`)  
**Datum preverjanja:** 11. 10. 2026  
**Repozitorij:** [GitHub](https://github.com/domenbencak/member-tracking-school)

Projekt je samostojna lokalna kopija aplikacije za upravljanje članov.
Vzpostavitev uporablja izmišljene podatke, svojo podatkovno bazo in lokalno
ustvarjene poverilnice. Navodila temeljijo na obstoječem [README](../README.md)
in skriptah v [package.json](../package.json).

## 1. Predpogoji

| Predpogoj | Zahteva |
| --- | --- |
| Git | Dostop do repozitorija; za zasebni repozitorij je potrebno povabilo. |
| Node.js in npm | Priporočena različica Node.js 24 iz [.nvmrc](../.nvmrc). `package.json` dovoljuje različice `>=24 <27`. |
| Docker | Zagnan Docker Desktop oziroma Docker Engine in Docker Compose. |
| Lokalna vrata | Prosta vrata `3001` za aplikacijo in `5433` za PostgreSQL. |

Spletni uporabniški vmesnik je v slovenščini. Za lokalni zagon niso potrebni
Vercel, Neon ali računi iz prvotne aplikacije.

## 2. Prva namestitev in zagon

```bash
git clone https://github.com/domenbencak/member-tracking-school.git
cd member-tracking-school
npm run school:env
npm ci
npm run school:setup
npm run dev
```

Ukaze izvedemo v korenu projekta. Prvi `school:env` ne potrebuje nameščenih
odvisnosti; uporabi Node.js in [.env.example](../.env.example). Ustvari zasebno
`.env` z naključnimi gesli. Obstoječo `.env` ohrani.

`npm ci` namesti različice iz zaklenjene datoteke odvisnosti in s postopkom
`postinstall` ustvari odjemalca Prisma. `school:setup` nato izvede:

1. pripravo oziroma preverjanje lokalne `.env`;
2. zagon PostgreSQL in čakanje na uspešen pregled zdravja storitve;
3. uporabo obeh obstoječih migracij;
4. sejenje začetnih uporabnikov in desetih izmišljenih članov, če je tabela članov prazna.

Aplikacijo odpremo na **http://localhost:3001**. Razvojni strežnik ostane zagnan
v terminalu; ustavimo ga s `Ctrl+C`.

| Račun | E-pošta | Geslo |
| --- | --- | --- |
| Administrator | `admin@example.test` | Vrednost `INITIAL_ADMIN_PASSWORD` iz lastne `.env`. |
| Običajni uporabnik | `user@example.test` | Vrednost `SAMPLE_USER_PASSWORD` iz lastne `.env`. |

Če spremenimo začetna e-poštna naslova, uporabimo vrednosti iz `.env`.
`SCHOOL_DB_PASSWORD` je geslo baze in ni geslo uporabniškega računa.
Ponovno sejenje gesel obstoječih uporabnikov ne ponastavi.

## 3. Lokalno okolje in ponovni zagon

Privzeti projekt Docker Compose je `member-tracking-school`, podatkovni volumen
pa `member-tracking-school_school_postgres`. Baza in uporabnik se imenujeta
`member_tracking_school`. PostgreSQL je dosegljiv na `127.0.0.1:5433`.

```bash
npm run school:db
npm run db:deploy
npm run dev
```

Po spremembi sheme uporabimo `npm run db:migrate` in novo migracijo vključimo
v Git. Za uporabo obstoječih migracij uporabimo `db:deploy`.
Za zaustavitev baze ob ohranitvi podatkov uporabimo `docker compose stop`.

Za preverjanje produkcijske izvedbe ustavimo razvojni strežnik in izvedemo:

```bash
npm run build
npm run start
```

Tudi produkcijski lokalni strežnik uporablja vrata `3001`.

## 4. Preverjanje vzpostavitve

```bash
npm run lint
npm run typecheck
npm test
npx playwright install chromium
npm run test:e2e
npx prisma validate
npm run build
```

Pred `test:e2e` ustavimo svoj strežnik na vratih `3001`: Playwright zažene
lastnega in ga po izvedbi ustavi. Poverilnice prebere iz `.env`; po potrebi jih
prepišemo z `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_USER_EMAIL` in
`E2E_USER_PASSWORD` za obstoječe testne račune. Testi zapisujejo izmišljene
podatke, zato jih izvajamo v lokalnem šolskem okolju. Administratorski test s
pravilom `CREATE_NEW` doda deset članov pri vsakem uspešnem uvozu.

Rezultati dejanske izvedbe so v
[Stanju testiranja in zagotavljanja kakovosti](STANJE_TESTIRANJA_IN_ZAGOTAVLJANJA_KAKOVOSTI.md#2-preverjanje-ob-pripravi-naloge).

## 5. Težave pri vzpostavitvi

| Težava | Rešitev |
| --- | --- |
| Docker daemon ni dosegljiv | Zaženemo Docker Desktop oziroma Docker Engine in ponovimo `npm run school:db`. |
| Vrata `3001` so zasedena | Ustavimo prej zagnan razvojni ali produkcijski strežnik. |
| Vrata `5433` so zasedena | Ustavimo drugo lokalno storitev na teh vratih. Dveh šolskih baz na istih vratih ne moremo zagnati hkrati. |
| Obstaja `.env.local` | Pregledamo njene nastavitve; priprava se ustavi, ker ta datoteka lahko prepiše šolsko konfiguracijo. |
| Prisma `P1000`: napačne poverilnice baze | Preverimo, ali `.env` ustreza obstoječemu volumnu. Novo geslo v `.env` ne spremeni gesla že inicializirane baze. |
| Prijava zavrne novo geslo iz `.env` | Obstoječi račun lahko že uporablja spremenjeno geslo; `db:seed` ga ne ponastavi. |
| Testi E2E so preskočeni | Preverimo, ali `.env` vsebuje oba začetna računa in gesli ter ali sta računa ustvarjena v testni bazi. Preskočen test ni uspešno preverjanje funkcionalnosti. |

Če stara baza pripada drugi postavitvi in želimo novo, ločeno okolje, najprej
ustavimo njen šolski vsebnik:

```bash
docker compose stop
```

Nato v svojo `.env` dodamo oziroma nastavimo:

```dotenv
COMPOSE_PROJECT_NAME=member-tracking-school-qa-20261011
```

Ponovimo `npm run school:setup`. Drugo ime projekta ustvari ločen volumen;
baza še vedno uporablja zahtevano ime, uporabnika in vrata `5433`.
Za novo postavitev izberemo novo ime projekta. S tem ohranimo stari volumen
in njegove podatke. Ukazi `docker compose` nato uporabljajo novo ime iz `.env`.

## 6. Dejanska vzpostavitev in uporaba UI

Preverjanje 11. 10. 2026 je potekalo na macOS ARM64 z Node.js `26.3.0`, npm
`11.16.0`, Docker CLI `24.0.7` in Docker Compose `2.39.4`.

Namestitev odvisnosti je uspela. Prvi poskus vzpostavitve je naletel na `P1000`,
ker je privzeti volumen vseboval že inicializirano bazo z drugim geslom.
Zato je bilo ustvarjeno ločeno okolje
`member-tracking-school-qa-20261011`, brez brisanja starega volumna.
V njem sta bili uspešno uporabljeni obe migraciji; pred testi sta bila
preverjena dva uporabnika in deset članov. Uspeli so tudi vsi ukazi preverjanja
iz poglavja 4; Chromium je bil že nameščen.

Preverjena sta bila tudi produkcijski zagon in prijava administratorja.
Izvoz posameznega člana kot JSON in CSV je vrnil HTTP 200. Skupinski izvoz je
vrnil HTTP 404; njegova manjkajoča implementacija je zabeležena v
[dokumentu o kakovosti](STANJE_TESTIRANJA_IN_ZAGOTAVLJANJA_KAKOVOSTI.md#4-odkrite-težave-in-razhajanja).

Pri sledenju navodilom, pregledu izhodov in pripravi tega dokumenta je bil
uporabljen generativni agent **OpenAI Codex**. Opisi so bili preverjeni z
dejanskimi skriptami, rezultati ukazov in številom zapisov v vzpostavljeni bazi.
