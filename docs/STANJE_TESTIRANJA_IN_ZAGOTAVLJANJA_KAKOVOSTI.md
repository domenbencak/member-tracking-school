# Stanje testiranja in zagotavljanja kakovosti

**Projekt:** Evidenca članov — šolska različica (`member-tracking-school`)  
**Datum preverjanja:** 11. 10. 2026  
**Pregledana izhodiščna različica:** `036a08491fab325f046f48d451283fd68d55476f`  
**Repozitorij:** [GitHub](https://github.com/domenbencak/member-tracking-school)

Dokument opisuje aktivnosti, ki so že prisotne v projektu, in preverjanja,
izvedena ob pripravi naloge. Ločuje implementirano zaščito, dejansko izvedene
teste in manjkajoča preverjanja. Uspešna izvedba obstoječih testov ne dokazuje
pravilnosti vseh funkcionalnosti: pregled je odkril tudi manjkajoči skupinski
izvoz CSV, ki ga testi ne pokrivajo.

## 1. Prisotne aktivnosti

V stolpcu UI je navedena znana uporaba **OpenAI Codex** pri tem pregledu in
način preverjanja rezultata agenta. Podatki o pretekli uporabi UI pri prvotni
izdelavi kode in testov so obravnavani v poglavju 6.

| Aktivnost in vrsta | Stanje | Pokriti del rešitve | Orodja in ogrodja | Uporaba UI in preverjanje rezultata |
| --- | --- | --- | --- | --- |
| Statična analiza kode | Nastavljena; izvedba uspešna, brez opozoril ESLint. | Izvorna koda in konfiguracija; generirane datoteke ter poročila so izključeni. | ESLint 9.34.0, pravila Next.js Core Web Vitals in TypeScript; `npm run lint`. | Codex je zagnal obstoječa pravila in preveril izhodno kodo 0. Opis obsega je primerjan z `eslint.config.mjs`. |
| Statično preverjanje tipov | Nastavljeno; izvedba uspešna. | Datoteke TypeScript/TSX, tipi komponent, API in odjemalca Prisma. | TypeScript 5.9.2, `strict: true`; `npm run typecheck`. | Codex je preveril `tsconfig.json` in uspešen izhod `tsc --noEmit`. |
| Testiranje enot in regresija poslovnih pravil | Prisotno; 63 od 63 testov uspešnih v osmih datotekah. | Razčlenjevanje uvoza, podvojitve, validacija in filtri članov, pravice, CSV, tiskovne mere, izolacija baze. | Vitest 4.1.0, okolje Node.js; `npm test`. | Codex je pregledal dejanske testne primere in primerjal poročilo Vitest z navedenim številom ter področji. |
| Testiranje uporabniških poti in integracije | Prisotno; trije od treh testov uspešni, brez preskočenih testov. | Prijava, brskalnik, Next.js, API in PostgreSQL: uvoz, urejanje, nalepke, filtri, mobilni prikaz in zavrnitev uvoza za USER. | Playwright 1.62.0, Chromium, en delavec, HTML poročilo; `npm run test:e2e`. | Codex je izvedel obstoječe teste, preveril njihove trditve, končni rezultat in `.last-run.json` s stanjem `passed`. |
| Preverjanje produkcijske gradnje | Prisotno; gradnja uspešna. | Generiranje odjemalca Prisma, prevajanje Next.js, preverjanje tipov in izdelava produkcijskih poti. | Prisma 7.9.1, Next.js 16.2.12, webpack; `npm run build`. | Codex je preveril izhodno kodo 0 in seznam zgrajenih poti. To preverjanje samo po sebi ne potrjuje delovanja vseh poti. |
| Kratek preizkus produkcijskega zagona in izvozov | Izveden pri tej nalogi; prijava in posamezni izvozi uspešni, skupinski izvoz vrne 404. | Zgrajena aplikacija, administratorska prijava, izvoz člana kot JSON/CSV in manjkajoča pot skupinskega izvoza. | `npm run start`, Node.js, Playwright in trditve `node:assert/strict`. | Codex je pripravil enkratni preverjevalni skript. Ta je zahteval vidno nadzorno ploščo, HTTP 200 pri posameznih izvozih, pravilen ID v JSON in HTTP 404 pri manjkajoči poti. Skript ni dodan kot trajni regresijski test. |
| Preizkus vzpostavitve, sheme in migracij | Skripte in dve migraciji že prisotne; postopek uspešen v ločenem okolju po razrešitvi `P1000`. | Odvisnosti, odjemalec Prisma, PostgreSQL, migracije ter začetni uporabniki in člani. | npm 11.16.0, Docker Compose 2.39.4, PostgreSQL 18, Prisma CLI; `school:setup`, `prisma validate`, poizvedbe `psql`. | Codex je sledil README, preveril izhode, zdravje vsebnika, veljavno shemo, dve uporabljeni migraciji, dva računa in deset začetnih članov. |
| Negativni testi varnostnih pravil | Delno pokrito; vključeni primeri uspešni. | Vloga USER proti ADMIN, formula v CSV in zavrnitev nešolskih povezav do baze. | Vitest in Playwright; del zgornjih naborov, ne dodaten testni nabor. | Codex je preveril, da testi zahtevajo napako oziroma HTTP 403 in da so bili izvedeni. To ni penetracijski pregled. |
| Preverjanje uporabniškega prikaza in tiskovne geometrije | Delno prisotno; izbrane trditve uspešne. | Namizni in mobilni seznam, vodoravno prelivanje ter mere posamezne in A4 nalepke. | Playwright, posnetki zaslona, CSS `mm`, Vitest. | Codex je pregledal posnetke in primerjal teste mer z izvorno kodo. Posnetki niso samodejna primerjava z referenčnimi slikami; fizični tisk ni preverjen. |
| Preprečevanje neveljavnih vhodov | Implementirano; posamezna pravila pokrita s testi. | Obrazci članov in uporabnikov, vhodne zahteve uvoza, pravice, lokalna povezava do baze. | Zod 4.4.3, strežniške akcije, `requireAdmin`, `getSchoolDatabaseUrl`. | Codex je opis primerjal z validacijskimi shemami in strežniškimi preverjanji. Vseh kombinacij vhodov ni preveril. |
| Ponovljiva namestitev in verzioniranje | Prisotno; `npm ci` uspešen. Zgodovina vsebuje združitev pull requesta št. 1. | Različice odvisnosti, izvorna koda, migracije in dokumentacija. | Git, GitHub, `package-lock.json`, `.gitignore`. | Codex je pregledal zaklenjene odvisnosti, skripte in zgodovino Git. Neodvisen človeški pregled ali zaščita vej iz lokalne zgodovine nista dokazljiva. |
| Pregled dokumentacije glede na izvedbo | Izvedeno pri tej nalogi; dokumentacija dopolnjena. | Vzpostavitev, seznam funkcij, povezave na kodo, stanje kakovosti in navedba UI. | Markdown, pregled kode, preverjanje povezav in rezultati ukazov. | Codex je pripravil besedilo, ga primerjal z dejanskimi datotekami in odpravil napačno navedbo delujočega skupinskega izvoza. |

Konfiguraciji testov sta v [vitest.config.ts](../vitest.config.ts) in
[playwright.config.ts](../playwright.config.ts); ukazi in različice so v
[package.json](../package.json). `npm run test:all` zaporedoma izvaja lint,
preverjanje tipov, teste enot in E2E. Produkcijska gradnja je ločen ukaz.

## 2. Preverjanje ob pripravi naloge

Okolje: macOS ARM64, Node.js `26.3.0`, npm `11.16.0`, Docker CLI `24.0.7`,
Docker Compose `2.39.4`. Node.js je znotraj dovoljenega obsega `>=24 <27`;
projekt za novo postavitev priporoča Node.js 24.

Preverjanje je uporabljalo projekt Docker Compose
`member-tracking-school-qa-20261011` in njegov samostojni volumen. Baza je bila
lokalna na `127.0.0.1:5433`. Privzeti obstoječi volumen je bil ohranjen.

| Ukaz oziroma preverjanje | Rezultat 11. 10. 2026 |
| --- | --- |
| `npm run school:env` | Ustvarjena zasebna `.env`; naslednja izvedba jo je ohranila. |
| `npm ci --cache /private/tmp/member-tracking-school-npm-cache --no-audit --no-fund` | Nameščenih 647 paketov; odjemalec Prisma uspešno ustvarjen. Varnostni pregled odvisnosti s tem ukazom ni bil izveden. |
| `npm run school:setup`, privzeti projekt | PostgreSQL zdrav, migracija ustavljena zaradi `P1000`; nepravilno ujemanje novih poverilnic in obstoječega volumna. |
| `npm run school:setup`, ločen projekt | Uspešno; obe migraciji uporabljeni, začetni podatki ustvarjeni. |
| Poizvedbe `psql` pred E2E | 10 članov, 2 uporabnika in 2 zaključeni migraciji. |
| `npm run lint` | Uspešno, izhodna koda 0. |
| `npm run typecheck` | Uspešno, izhodna koda 0. |
| `npm test` | 8 uspešnih datotek, 63 uspešnih testov; 1,13 s po poročilu Vitest. |
| `npm run test:e2e` | 3 uspešni testi; 31,6 s po poročilu Playwright. |
| `npx --no-install prisma validate` | Shema veljavna, izhodna koda 0. |
| `npm run build` | Uspešno; aplikacija prevedena, tipi preverjeni in poti zgrajene. |
| `npm run start` in enkratni preizkus produkcijske aplikacije | Zagon in prijava ADMIN uspešna; JSON in CSV posameznega člana HTTP 200, skupinski CSV HTTP 404. |
| Preverjanje dokumentacijskih povezav in `.gitignore` | Vse lokalne povezave in sidra veljavna; 14 opisanih funkcij. `.env` in korenski `exports/` sta izključena, izvorna mapa API `exports/` pa ni več izključena. |

Poročilo Playwright je lokalno v `playwright-report/index.html`, posnetki
zaslona in stanje zadnje izvedbe pa v `test-results/`. Te datoteke so
izključene iz Gita. Poročilo odpremo z `npx playwright show-report`.

Med izvedbo so se pojavila opozorila Node.js o `module.register()`, npm o
namestitvenih skriptah ter Playwright o `NO_COLOR`/`FORCE_COLOR`. Pri E2E je
bilo zabeleženo tudi opozorilo React o neskladju pri hidraciji z atributom
`style` oziroma `caret-color`. Testi so kljub temu uspeli; vzrok opozorila
hidracije v tem pregledu ni potrjen. Uspešen rezultat zato ne pomeni, da je
konzola aplikacije brez opozoril.

## 3. Dejanska testna pokritost

### Testi enot

| Testna datoteka | Število | Kaj preverja |
| --- | ---: | --- |
| [authorization.test.ts](../src/lib/auth/authorization.test.ts) | 2 | ADMIN je dovoljen; USER prejme napako s stanjem 403. |
| [csv.test.ts](../src/lib/csv.test.ts) | 5 | Nevtralizacija začetkov `=`, `+`, `-`, `@` in pravilno ubežanje narekovajev. |
| [duplicates.test.ts](../src/lib/import/duplicates.test.ts) | 3 | Prednost izkaznice, neobčutljivost e-pošte na velikost črk in pogoji identitetnega ujemanja. |
| [parser.test.ts](../src/lib/import/parser.test.ts) | 24 | Slovenske glave, logične vrednosti, statusi, datumi in zavrnitev izbranih neveljavnih vrednosti. |
| [queries.test.ts](../src/lib/members/queries.test.ts) | 5 | Razvrščanje, položaj praznih vrednosti, iskanje opomb ter obravnava filtrov. |
| [validation.test.ts](../src/lib/members/validation.test.ts) | 7 | Obvezna polja, presledki, e-pošta, status, datum spremembe, opombe in opozorilo za poštno številko. |
| [printing.test.ts](../src/lib/printing.test.ts) | 3 | Oblikovanje naslova, fizične konstante in izbrane deklaracije CSS. |
| [school-database.test.ts](../src/lib/school-database.test.ts) | 14 | Tri dovoljene lokalne povezave in enajst neveljavnih oziroma nešolskih povezav. |
| **Skupaj** | **63** | Parametrizirani primeri `it.each` so šteti kot posamezni testi. |

Ti testi ne izvajajo poizvedb nad pravo bazo za preverjanje vseh filtrov,
transakcij ali migracij. Preverjajo izbrane funkcije in zgrajene pogoje.

### Testi skozi brskalnik

| Test | Dejanski obseg |
| --- | --- |
| Administrator uvozi, uredi in predogleda nalepko | Prijava ADMIN, vzorčni Excel, pravilo `CREATE_NEW`, poročilo uvoza, status in opomba, sprememba VPO, posamezna nalepka, izračunane mere posamezne/A4 nalepke ter mobilni seznam. |
| Običajni uporabnik ne more klicati administratorskega uvoza | Prijava USER in neposredni POST na `/api/imports/drafts`, ki mora vrniti 403. |
| Seznam ostane pregleden in filtri vrnejo člane | Namizna tabela, izbrane vsebine, odsotnost vodoravnega prelivanja, filter občine z nepraznim rezultatom, polja statusa pri novem članu ter mobilni seznam širine 390 px. |

Viri: [admin-import.spec.ts](../e2e/admin-import.spec.ts) in
[member-list.spec.ts](../e2e/member-list.spec.ts). E2E vključuje integracijo z
resnično lokalno bazo; ločenega samostojnega integracijskega nabora ni.
Vrstice tabele ne pomenijo, da so vse variante uvoza, vsi filtri ali vse
administratorske operacije že pokrite.

## 4. Odkrite težave in razhajanja

| Oznaka | Ugotovitev in dokaz | Stanje oziroma ukrep |
| --- | --- | --- |
| Q-01 | Seznam vsebuje povezavo `/api/exports/members.csv`, vendar v repozitoriju manjka ustrezna API datoteka; pot tudi ni na seznamu produkcijske gradnje. Neposredni klic v produkcijski izvedbi s prijavljenim administratorjem vrne HTTP 404. | Funkcionalna napaka ostaja odprta. Dokumentacija je popravljena: med delujočimi funkcijami je naveden samo izvoz posameznega člana. Obstoječi testi manjkajoče poti ne zaznajo. |
| Q-02 | Nova `.env` in obstoječi volumen uporabljata različni gesli; `db:deploy` vrne `P1000`. | Za preverjanje je bilo ustvarjeno ločeno okolje z `COMPOSE_PROJECT_NAME`; postopek je dodan v navodila. Stari podatki niso bili izbrisani. |
| Q-03 | Med E2E je React izpisal opozorilo hidracije; testi ne vsebujejo pravila, ki bi odpovedalo ob vsakem opozorilu konzole. | Zabeleženo za nadaljnjo analizo. Vzrok ni potrjen; ni upravičeno trditi, da ga uspešni E2E izključujejo. |
| Q-04 | Prvotno pravilo `exports/` v `.gitignore` je izključevalo tudi izvorno mapo `src/app/api/exports/`. | Pravilo je omejeno na korensko `/exports/`, da bodo prihodnje izvorne datoteke API lahko vključene v Git. S tem manjkajoča implementacija Q-01 ni samodejno obnovljena. |

## 5. Manjkajoče aktivnosti in nadaljnje delo

| Področje | Trenutno stanje | Smiselna naslednja aktivnost |
| --- | --- | --- |
| Merjenje pokritosti kode | Vitest ima nastavljena poročevalca `text` in `html`, vendar ponudnik pokritosti ni med zaklenjenimi odvisnostmi; odstotek ni izmerjen. | Uvesti ponudnika pokritosti ter pregledati pokritost kritičnih vej. |
| Neprekinjena integracija | V repozitoriju ni `.github/workflows/`; zunanji CI ni preverjen. | V CI avtomatizirati lint, tipe, teste, migracije v začasni bazi in gradnjo. |
| Dodatne regresijske poti | Ni E2E za skupinski izvoz, obnovitev člana, upravljanje uporabnikov, spremembo gesla, pretekle seje, vsa pravila podvojitev ali revizijsko sled. | Najprej odpraviti Q-01 in preveriti izvoz; nato pokriti kritične uporabniške poti. |
| Varnost in odvisnosti | Prisotni so izbrani negativni testi; formalni penetracijski pregled in samodejni pregled ranljivosti nista dokumentirana. `npm ci --no-audit` ju ne nadomešča. | Uvesti pregled odvisnosti in preveriti dostop, izvor zahtev, omejevanje prijav ter veljavnost sej. |
| Zmogljivost | Omejitve uvoza so nastavljene, obremenitvenih testov ni. | Izmeriti odzivnost in porabo virov pri večjih izmišljenih naborih. |
| Dostopnost in združljivost | Izbrani mobilni in namizni prikazi so preverjeni v Chromiumu; formalnega pregleda dostopnosti in testov drugih brskalnikov ni. | Preveriti tipkovnico, bralnik zaslona, dostopnost in druge brskalnike. |
| Fizični tisk | Preverjene so konstante, CSS in mere v brskalniku. | Preveriti dejanski tisk pri merilu 100 % na izbranem tiskalniku. |
| Varnostne kopije in obnova | Volumen ohranja podatke, vendar to ni varnostna kopija; preizkus obnove ni dokumentiran. | Pripraviti in preveriti postopek kopiranja ter obnove izmišljenih podatkov. |

Naštete aktivnosti so predlogi za nadaljnje vaje in niso predstavljene kot
že izvedene. Dokumentacija ne navaja izmišljenega odstotka pokritosti,
zagotovljene zmogljivosti ali popolne varnosti.

## 6. Uporaba generativne umetne inteligence

Pri pripravi te naloge je bil uporabljen **OpenAI Codex, generativni agent**:

- za pregled kode, konfiguracije, dokumentacije in obstoječih testov;
- za sledenje postopku vzpostavitve in izvedbo preverjanj;
- za enkratni preverjevalni skript produkcijske prijave in izvoznih poti;
- za pripravo dokumentov o vzpostavitvi, funkcionalnostih in kakovosti;
- za popravek napačnih navedb o skupinskem izvozu in preširokega pravila `.gitignore`.

Rezultati agenta so bili preverjeni s povezavami na dejanske izvorne datoteke,
pregledom konfiguracije in zgodovine Git, uspešnimi izhodi ukazov, številom
zapisov v ločeni bazi ter poročilom in posnetki Playwright. Obstoječih testov
pri tem pregledu agent ni dopisoval. Uspešnih rezultatov ni razširil na dele,
ki jih ti testi ne preverjajo.

V pregledanem repozitoriju **ni podatkov, ki bi zanesljivo določali uporabo
UI pri prvotni izdelavi aplikacije in testov**. Orodje in način preverjanja
starejših rezultatov zato nista znana; to ni trditev, da UI prej ni bila
uporabljena. Ta izjava pokriva znano uporabo v sedanji pripravi naloge.

Povezana dokumenta: [Vzpostavitev projekta](VZPOSTAVITEV.md) in
[Izbira projekta in ključne funkcionalnosti](FUNKCIONALNOSTI.md).
