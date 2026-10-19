# Funkcionalno testiranje – Evidenca članov (različica 2.0)

Datum: 19. 10. 2026. Status vseh testov: **Ni izvedeno**. Prejšnja različica (1.1) ostaja v datoteki `Funkcionalno_testiranje.md`.

## Končni ukaz agentu

```text
Deluj kot agent za funkcionalno testiranje. Za projekt Evidenca članov – šolska različica (member-tracking-school) ustvari natanko pet ročnih funkcionalnih testnih primerov v slovenščini.

VIR PRIČAKOVANEGA DELOVANJA
Pričakovane rezultate izpelji izključno iz dokumentacije: docs/FUNKCIONALNOSTI.md (funkcionalnosti K-01 do K-14), docs/DOKUMENTACIJA.md (funkcionalne zahteve F-01 do F-12 z merili uspeha ter opis uvoza in podvojitev), docs/UPSTREAM.md in docs/VZPOSTAVITEV.md (okolje in računa). Izvorne kode ne odpiraj in je ne uporabljaj kot vir; test mora preverjati, kaj aplikacija MORA delati po zahtevah, ne opisovati, kako je trenutno implementirana. Kjer dokumentacija vedenja ne določa natančno (npr. točno besedilo sporočila o napaki, napis gumba ali kaj se zgodi ob neposrednem odprtju naslova arhiviranega člana), pričakovanje zapiši na ravni zahteve (npr. »prikaže se sporočilo, da e-pošta ni veljavna«) in ga v polju assumptions označi kot predpostavko, ki jo je treba potrditi z naročnikom. Pri vsakem pričakovanem rezultatu v polju source navedi oznako zahteve (K-xx ali F-xx) oziroma dokument in razdelek, iz katerega izhaja.

SCENARIJI
TC-01: veljavna prijava uporabnika USER, dostop do zaščitene strani in odjava; po odjavi zaščitena stran ni dostopna.
TC-02: združevanje iskanja ter filtrov Občina in Plačilo članarine. Uporabi tri ne-arhivirane člane z enkratnimi izkaznicami TC02-A (Maribor, plačano), TC02-B (Maribor, neplačano) in TC02-C (Ptuj, plačano). Iskanje TC02- vrne tri zapise; Maribor in plačano vrne samo A; Ptuj in neplačano ne vrne nič. Preveri še, da pogoji ostanejo po osvežitvi strani (stanje seznama je po dokumentaciji v URL) in da jih je mogoče počistiti.
TC-03: zavrnitev novega člana z neveljavno e-pošto brez @; vsa druga polja so veljavna. Preveri, da sistem prikaže napako in zapisa ne shrani.
TC-04: arhiviranje in obnovitev istega člana. Zabeleži identiteto člana pred arhiviranjem; preveri, da arhiviran član ni na običajnem seznamu, da je v arhivu in da obnovitev vrne isti zapis z ohranjenimi podatki.
TC-05: uvoz Excela s pravilom SKIP iz datoteke tc05-skip-v1.xlsx z enim listom, glavo v vrstici 1 in tremi podatkovnimi vrsticami: en nov veljaven član, ena podvojitev obstoječega člana po številki izkaznice (zapisana z drugačno velikostjo črk in s presledki ter s spremenjeno e-pošto in opombo) in ena vrstica z neveljavno e-pošto. Uporabi samo stolpce, ki jih dokumentacija navaja kot podprte. Preveri, da pred potrditvijo nov član še ne obstaja, da poročilo pokaže 1 uvoženo, 0 posodobljenih, 1 preskočeno in 1 neveljavno vrstico, da obstoječi član ostane nespremenjen, da neveljavni zapis ne nastane in da je poročilo dostopno v zgodovini uvozov.

ATRIBUTI
Vsak primer naj vsebuje: ID, naslov, cilj, oznake funkcionalnosti (samo za izrecno preverjane rezultate), vlogo, vrsto (pozitivni ali negativni), prioriteto, predpogoje, konkretne izmišljene testne podatke, oštevilčene korake s pričakovanim rezultatom in virom za vsak korak, končni pričakovani rezultat kot merilo uspeha, predpostavke, stanje po testu, čiščenje in navodilo za ponovitev. Dodaj avtorja (agent UI), datum 19. 10. 2026, različico 2.0, dejanski rezultat, status izvedbe, izvajalca, datum izvedbe, okolje in različico aplikacije ter povezavo na napako. Dejanski rezultat in status izvedbe sta »Ni izvedeno«; ostala polja za zapis izvedbe so »Za vnos ob izvedbi«. Uspeh zahteva ujemanje vseh pričakovanih rezultatov; neizpolnjen predpogoj pomeni »Blokirano«, razhajanje z rezultatom pa »Neuspešno«.

OKOLJE
Lokalna aplikacija http://localhost:3001 in šolska računa user@example.test ter admin@example.test. Gesli označi kot <VELJAVNO_GESLO_USER> in <VELJAVNO_GESLO_ADMIN>. Ne predpostavljaj skupnega števila članov v bazi. Priprava podatkov je predpogoj, ne že opravljeno dejanje.

OBLIKA
Piši jedrnato, kot navodilo za drugega izvajalca, brez notranjih podrobnosti baze ali kode. Posamezen primer naj ima največ 450 besed, TC-05 največ 650. Vrni JSON z objektom cases in ključi: id, title, objective, functionality_ids, role, type, priority, preconditions, data, steps (number, action, expected, source), final_expected, assumptions, postconditions, cleanup, author, created_date, version, actual_result, execution_status, executor, execution_date, environment, defect_link, sources. Ne izmišljaj uspešne izvedbe.
```

## Potek iteracij in komentar

| Iteracija | Ukaz | Ugotovitev ob pregledu | Popravek |
|---|---|---|---|
| 1 | Prvi ukaz (OpenAI Codex) | Primeri so bili preobsežni: pri iskanju šest članov in šest filtrov, pri uvozu dva lista in 14 stolpcev. | Iskanje omejeno na tri člane in dva filtra, uvoz na en list in pet stolpcev. |
| 2 | Ukaz v1.1 (OpenAI Codex) | Ukaz je kot vir dovoljeval izvorno kodo in »samo implementirano vedenje«. Del pričakovanih rezultatov je bil zato prepisan iz kode: 404 pri odprtju arhiviranega člana, potrditev s polnim imenom, točna besedila sporočil in stolpec Opombe pri uvozu. Test, izpeljan iz kode, potrdi tudi morebitne napake implementacije, zato ni ustrezen. | Vir pričakovanega delovanja je samo dokumentacija (K-01 do K-14, F-01 do F-12). Kar dokumentacija ne določa, agent označi kot predpostavko. Vsak pričakovani rezultat ima naveden vir. |
| 3 | Končni ukaz v2.0 (Claude) | Primeri izhajajo iz zahtev. Agent je sam ugotovil, da stolpec Opombe ni dokumentiran kot podprt pri uvozu, in ga izpustil. Preverjanje 404 je odstranjeno, ker ga zahteve ne določajo. Besedila sporočil so zapisana na ravni zahteve. | Sprejeto kot končna različica. |

### Kaj bi v testnih primerih spremenili sami

- TC-02 ima med oznakami tudi K-01, čeprav je prijava le priprava na test. V matriki K-01 pri TC-02 ne štejemo.
- Predpostavke (npr. ali primerjava izkaznic ne upošteva velikosti črk in presledkov ter kaj se zgodi ob odprtju naslova arhiviranega člana) bi potrdili z naročnikom in dopolnili dokumentacijo, nato pa testne primere ustrezno zaostrili.
- TC-04 in TC-05 bi razdelili na manjše teste, da bi ob napaki lažje določili vzrok.
- Dodali bi negativni test za vlogo USER (F-02: USER ne more izvesti administratorskega uvoza) ter teste mejnih vrednosti vhodnih polj.

## Testni primeri

### TC-01 Veljavna prijava uporabnika USER, dostop do zaščitene strani in odjava

**Cilj:** Preveriti, da aktiven račun USER z veljavnim geslom dostopa do zaščitene vsebine in da po odjavi zaščitena stran ni več dostopna.

**Funkcionalnosti:** K-01, F-01 · **Vloga:** USER · **Vrsta:** Pozitivni · **Prioriteta:** Visoka

**Avtor:** agent UI (Claude) · **Datum:** 19. 10. 2026 · **Različica:** 2.0

**Predpogoji:**
- Aplikacija teče na http://localhost:3001.
- Račun user@example.test obstaja, je aktiven, ni blokiran zaradi neuspelih prijav in ne zahteva spremembe gesla.
- Brskalnik nima aktivne seje aplikacije (zasebno okno).

**Testni podatki:**
- e_posta: user@example.test
- geslo: <VELJAVNO_GESLO_USER>

| Korak | Dejanje | Pričakovani rezultat | Vir |
|---|---|---|---|
| 1 | Odpri http://localhost:3001/prijava. | Prikaže se prijavni obrazec s poljema za e-pošto in geslo. | K-01; F-01; UPSTREAM.md, Authentication and authorization |
| 2 | Vnesi testne podatke in potrdi prijavo. | Prijava uspe; prikaže se zaščitena vsebina aplikacije (npr. nadzorna plošča). | K-01; F-01 |
| 3 | Zabeleži naslov URL prikazane zaščitene strani. | Naslov ni /prijava; vsebina je prikazana brez ponovne prijave. | F-01; UPSTREAM.md, Authentication and authorization |
| 4 | Izvedi odjavo. | Seja se zaključi; zaščitena vsebina ni več prikazana. | K-01 |
| 5 | V isti zavihek vnesi zabeleženi URL iz koraka 3. | Zaščitena vsebina se ne prikaže; uporabnik je napoten na prijavo. | K-01; UPSTREAM.md, Authentication and authorization (vse strani razen /prijava zahtevajo prijavo) |

**Končni pričakovani rezultat:** USER se uspešno prijavi in vidi zaščiteno stran; po odjavi ta stran brez nove prijave ni dostopna. Uspeh: ujemajo se vsi pričakovani rezultati. Neizpolnjen predpogoj: »Blokirano«; razhajanje: »Neuspešno«.

**Predpostavke:**
- Korak 2: da je po prijavi prikazana nadzorna plošča oziroma druga začetna zaščitena stran, dokumentacija ne določa natančno.
- Korak 4: napis in mesto gumba za odjavo ter stran, prikazana po odjavi, niso določeni.
- Korak 5: da se uporabnik preusmeri ravno na /prijava (in ne npr. prejme sporočilo o napaki), je predpostavka; zahteva je le, da vsebina ni dostopna.

**Stanje po testu:** Uporabnik je odjavljen; podatki v aplikaciji niso spremenjeni.

**Čiščenje in ponovitev:** Ni potrebno; zapri zasebno okno. Ponovitev: test je ponovljiv brez priprave; po petih napačnih poskusih v 15 minutah počakaj 15 minut (DOKUMENTACIJA.md, razdelek 6).

**Dejanski rezultat:** Ni izvedeno · **Status izvedbe:** Ni izvedeno · **Izvajalec:** Za vnos ob izvedbi · **Datum izvedbe:** Za vnos ob izvedbi · **Okolje:** Lokalna aplikacija http://localhost:3001 (VZPOSTAVITEV.md, razdelek 2); brskalnik in različica aplikacije: Za vnos ob izvedbi · **Povezava na napako:** Za vnos ob izvedbi

**Viri:** FUNKCIONALNOSTI.md, razdelek 2 (K-01); DOKUMENTACIJA.md, razdelek 3 (F-01), razdelek 6; UPSTREAM.md, Authentication and authorization; VZPOSTAVITEV.md, razdelek 2

### TC-02 Združevanje iskanja ter filtrov Občina in Plačilo članarine

**Cilj:** Preveriti, da seznam članov hkrati upošteva iskanje in filtra, da se pogoji ohranijo po osvežitvi in da jih je mogoče počistiti.

**Funkcionalnosti:** K-01, K-04, F-04 · **Vloga:** USER · **Vrsta:** Pozitivni · **Prioriteta:** Srednja

**Avtor:** agent UI (Claude) · **Datum:** 19. 10. 2026 · **Različica:** 2.0

**Predpogoji:**
- Aplikacija teče na http://localhost:3001; račun user@example.test je aktiven.
- Administrator je pred testom pripravil tri ne-arhivirane člane iz testnih podatkov (K-06).
- Noben drug ne-arhiviran član nima v iskanih poljih niza »TC02-«.

**Testni podatki:**
- geslo: <VELJAVNO_GESLO_USER>
- izkaznica: TC02-A; ime: Ana; priimek: Testna; obcina: Maribor; clanarina: plačano
- izkaznica: TC02-B; ime: Bojan; priimek: Testni; obcina: Maribor; clanarina: neplačano
- izkaznica: TC02-C; ime: Cvetka; priimek: Testna; obcina: Ptuj; clanarina: plačano

| Korak | Dejanje | Pričakovani rezultat | Vir |
|---|---|---|---|
| 1 | Prijavi se z user@example.test in geslom ter odpri seznam članov. | Prikaže se seznam ne-arhiviranih članov. | K-01; K-04; DOKUMENTACIJA.md, razdelek 2 |
| 2 | V iskanje vnesi »TC02-«. | Prikazani so natanko trije zapisi: TC02-A, TC02-B, TC02-C. | K-04; F-04 |
| 3 | Ohrani iskanje ter nastavi Občina = Maribor in Plačilo članarine = plačano. | Prikazan je samo TC02-A. | K-04; F-04 |
| 4 | Osveži stran (F5). | Iskalni niz in oba filtra ostanejo nastavljeni; prikazan je samo TC02-A; URL vsebuje parametre pogojev. | DOKUMENTACIJA.md, razdelek 8; UPSTREAM.md, Member browsing and exports |
| 5 | Spremeni Občina = Ptuj in Plačilo članarine = neplačano. | Ni prikazanega nobenega zapisa; seznam je prazen. | F-04 |
| 6 | Počisti iskanje in oba filtra. | Iskalno polje in filtra so prazni; seznam ni več omejen s temi pogoji. | K-04; DOKUMENTACIJA.md, razdelek 8 |
| 7 | Vnesi samo »TC02-« brez filtrov. | Spet so prikazani vsi trije zapisi, kar potrjuje, da sta filtra počiščena. | K-04; F-04 |

**Končni pričakovani rezultat:** Iskanje in filtra se združujejo (3 / 1 / 0 zapisov), ohranijo se po osvežitvi in jih je mogoče počistiti. Uspeh: ujemajo se vsi pričakovani rezultati. Neizpolnjen predpogoj: »Blokirano«; razhajanje: »Neuspešno«.

**Predpostavke:**
- Korak 2: da iskanje »po več poljih« vključuje številko izkaznice in delno ujemanje niza.
- Korak 3: točni napisi filtrov in vrednosti (»plačano«/»neplačano«) ter da se pogoji združujejo z logičnim IN.
- Korak 5: besedilo sporočila ob praznem rezultatu ni določeno.
- Korak 6: način čiščenja (gumb ali ročna ponastavitev) in njegov napis nista določena.

**Stanje po testu:** Trije testni člani ostanejo nespremenjeni in ne-arhivirani.

**Čiščenje in ponovitev:** Administrator lahko testne člane arhivira (K-07) ali jih ohrani za ponovitev. Ponovitev: ponovno uporabi iste člane, če obstajajo in niso arhivirani; sicer jih pripravi znova.

**Dejanski rezultat:** Ni izvedeno · **Status izvedbe:** Ni izvedeno · **Izvajalec:** Za vnos ob izvedbi · **Datum izvedbe:** Za vnos ob izvedbi · **Okolje:** Lokalna aplikacija http://localhost:3001 (VZPOSTAVITEV.md, razdelek 2); brskalnik in različica aplikacije: Za vnos ob izvedbi · **Povezava na napako:** Za vnos ob izvedbi

**Viri:** FUNKCIONALNOSTI.md, razdelek 2 (K-04, K-06); DOKUMENTACIJA.md, razdelek 3 (F-04), razdelek 8; UPSTREAM.md, Member browsing and exports

### TC-03 Zavrnitev novega člana z e-pošto brez znaka @

**Cilj:** Preveriti, da sistem ob dodajanju člana z neveljavno e-pošto prikaže napako in zapisa ne shrani.

**Funkcionalnosti:** K-06, F-03 · **Vloga:** ADMIN · **Vrsta:** Negativni · **Prioriteta:** Visoka

**Avtor:** agent UI (Claude) · **Datum:** 19. 10. 2026 · **Različica:** 2.0

**Predpogoji:**
- Aplikacija teče na http://localhost:3001; račun admin@example.test je aktiven.
- Član z izkaznico TC03-001 ne obstaja (preveri v koraku 2).

**Testni podatki:**
- geslo: <VELJAVNO_GESLO_ADMIN>
- ime: Neža
- priimek: Zavrnjena
- izkaznica: TC03-001
- e_posta: neza.zavrnjena.example.test
- ulica: Testna ulica 3
- postna_stevilka: 3000
- posta: Celje
- obcina: Celje
- clanarina: plačano

| Korak | Dejanje | Pričakovani rezultat | Vir |
|---|---|---|---|
| 1 | Na http://localhost:3001 se prijavi z admin@example.test in <VELJAVNO_GESLO_ADMIN>. | Prijava uspe; na voljo je dodajanje članov. | K-01; DOKUMENTACIJA.md, razdelek 2 |
| 2 | Na seznamu članov poišči »TC03-001«. | Ni zadetkov. | K-04 |
| 3 | Odpri obrazec za novega člana in vnesi vse testne podatke. | Obrazec sprejme vnos. | K-06 |
| 4 | Shrani. | Prikaže se sporočilo, da e-pošta ni veljavna, ob polju E-pošta; član ni ustvarjen. | K-06; F-03; DOKUMENTACIJA.md, razdelek 3 (Nefunkcionalne zahteve) |
| 5 | Zapusti obrazec brez popravka in na seznamu poišči »TC03-001«. | Ni zadetkov; zapis ni shranjen. | K-06; F-03 |

**Končni pričakovani rezultat:** Shranjevanje je zavrnjeno z jasnim sporočilom o neveljavni e-pošti; član TC03-001 ne obstaja. Uspeh: ujemajo se vsi pričakovani rezultati. Neizpolnjen predpogoj: »Blokirano«; razhajanje: »Neuspešno«.

**Predpostavke:**
- Korak 4: točno besedilo in mesto sporočila nista določena; napako lahko prikaže brskalnik ali strežnik (oba preverjata vhode).
- Korak 4: ali obrazec po napaki ohrani vnesene podatke, ni določeno.
- Korak 3: točni napisi polj obrazca niso določeni.

**Stanje po testu:** Nov član ni ustvarjen; podatki niso spremenjeni.

**Čiščenje in ponovitev:** Ni potrebno. Če je bil zapis kljub temu ustvarjen, ga zabeleži kot napako in arhiviraj. Ponovitev: preveri, da TC03-001 ne obstaja, nato ponovi.

**Dejanski rezultat:** Ni izvedeno · **Status izvedbe:** Ni izvedeno · **Izvajalec:** Za vnos ob izvedbi · **Datum izvedbe:** Za vnos ob izvedbi · **Okolje:** Lokalna aplikacija http://localhost:3001 (VZPOSTAVITEV.md, razdelek 2); brskalnik in različica aplikacije: Za vnos ob izvedbi · **Povezava na napako:** Za vnos ob izvedbi

**Viri:** FUNKCIONALNOSTI.md, razdelek 2 (K-06); DOKUMENTACIJA.md, razdelek 2, razdelek 3 (F-03, Nefunkcionalne zahteve), razdelek 5 (Podatki člana)

### TC-04 Arhiviranje in obnovitev istega člana

**Cilj:** Preveriti, da arhiviran član izgine z običajnega seznama, je v arhivu in se z obnovitvijo vrne isti zapis z ohranjenimi podatki.

**Funkcionalnosti:** K-05, K-07, F-06 · **Vloga:** ADMIN · **Vrsta:** Pozitivni · **Prioriteta:** Visoka

**Avtor:** agent UI (Claude) · **Datum:** 19. 10. 2026 · **Različica:** 2.0

**Predpogoji:**
- Aplikacija teče na http://localhost:3001; račun admin@example.test je aktiven.
- Administrator je pripravil ne-arhiviranega člana iz testnih podatkov (K-06); izkaznica TC04-001 je edinstvena.

**Testni podatki:**
- geslo: <VELJAVNO_GESLO_ADMIN>
- ime: Marko
- priimek: Arhivski
- izkaznica: TC04-001
- e_posta: marko.arhivski@example.test
- obcina: Kranj
- clanarina: plačano
- opomba: TC04 opomba

| Korak | Dejanje | Pričakovani rezultat | Vir |
|---|---|---|---|
| 1 | Na http://localhost:3001 se prijavi z admin@example.test in <VELJAVNO_GESLO_ADMIN>. Poišči »TC04-001«. | Prikazan je natanko en zapis. | K-04 |
| 2 | Odpri podrobnosti; zabeleži URL strani ter vse prikazane podatke. | Podrobnosti ustrezajo testnim podatkom. | K-05 |
| 3 | Arhiviraj člana in potrdi dejanje. | Sistem zahteva potrditev; arhiviranje uspe. | K-07; UPSTREAM.md, Security, privacy, and operations |
| 4 | Na običajnem seznamu poišči »TC04-001«. | Ni zadetkov. | K-07; F-06; DOKUMENTACIJA.md, razdelek 8 |
| 5 | Odpri arhiv in poišči člana. | Član TC04-001 je v arhivu. | K-07; DOKUMENTACIJA.md, razdelek 2 |
| 6 | Obnovi člana. | Obnovitev uspe; član ni več v arhivu. | K-07; F-06 |
| 7 | Na običajnem seznamu poišči »TC04-001«. | Prikazan je natanko en zapis (ni nastal nov). | F-06; DOKUMENTACIJA.md, razdelek 5 (Brisanje in zgodovina) |
| 8 | Odpri podrobnosti in primerjaj z zapisom iz koraka 2. | URL je enak; vsi podatki so enaki. | K-05; DOKUMENTACIJA.md, razdelek 5 (Brisanje in zgodovina), razdelek 11 |

**Končni pričakovani rezultat:** Isti zapis je po arhiviranju skrit s seznama in viden v arhivu, po obnovitvi pa spet na seznamu z enakim URL in podatki. Uspeh: ujemajo se vsi pričakovani rezultati. Neizpolnjen predpogoj: »Blokirano«; razhajanje: »Neuspešno«.

**Predpostavke:**
- Koraka 2 in 8: da URL podrobnosti vsebuje trajni identifikator zapisa in ga je mogoče uporabiti kot dokaz istovetnosti.
- Korak 3: napisi gumbov in besedilo potrditve niso določeni.
- Korak 6: ali obnovitev zahteva potrditev, ni določeno.
- Vedenje ob neposrednem odprtju URL arhiviranega člana ni določeno in se v tem primeru ne preverja.

**Stanje po testu:** Član TC04-001 je ne-arhiviran s prvotnimi podatki; revizijska sled lahko vsebuje dogodka arhiviranja in obnovitve.

**Čiščenje in ponovitev:** Po potrebi člana arhiviraj (K-07). Ponovitev: uporabi ne-arhiviranega člana TC04-001 ali pripravi novega z edinstveno izkaznico.

**Dejanski rezultat:** Ni izvedeno · **Status izvedbe:** Ni izvedeno · **Izvajalec:** Za vnos ob izvedbi · **Datum izvedbe:** Za vnos ob izvedbi · **Okolje:** Lokalna aplikacija http://localhost:3001 (VZPOSTAVITEV.md, razdelek 2); brskalnik in različica aplikacije: Za vnos ob izvedbi · **Povezava na napako:** Za vnos ob izvedbi

**Viri:** FUNKCIONALNOSTI.md, razdelek 2 (K-05, K-07); DOKUMENTACIJA.md, razdelek 2, razdelek 3 (F-06), razdelek 5, razdelek 8, razdelek 11; UPSTREAM.md, Security, privacy, and operations

### TC-05 Uvoz Excela s pravilom SKIP: nov član, podvojitev in neveljavna vrstica

**Cilj:** Preveriti, da uvoz s pravilom SKIP ustvari samo nov veljaven zapis, preskoči podvojitev po številki izkaznice, izloči neveljavno vrstico in shrani poročilo v zgodovino.

**Funkcionalnosti:** K-08, K-09, F-07, F-08 · **Vloga:** ADMIN · **Vrsta:** Pozitivni · **Prioriteta:** Visoka

**Avtor:** agent UI (Claude) · **Datum:** 19. 10. 2026 · **Različica:** 2.0

**Predpogoji:**
- Aplikacija teče na http://localhost:3001; račun admin@example.test je aktiven.
- Administrator je prek obrazca pripravil ne-arhiviranega obstoječega člana iz testnih podatkov (K-06).
- Člana z izkaznicama TC05-NOV-01 in TC05-NEV-01 ter e-pošto nina.novak.tc05@example.test ne obstajata.
- Pripravljena je datoteka tc05-skip-v1.xlsx (en list »Clani«, glava v vrstici 1, vrstice 2–4).

**Testni podatki:**
- geslo: <VELJAVNO_GESLO_ADMIN>
- obstojeci_clan: izkaznica: TC05-OBST-01; ime: Petra; priimek: Obstoječa; e_posta: petra.obstojeca@example.test; obcina: Koper; opomba: Izvorna opomba TC05
- glava: Št. Izkaznice | Priimek | Ime | E mail | Občina
- vrstica_2_nov: TC05-NOV-01 | Novak | Nina | nina.novak.tc05@example.test | Celje
- vrstica_3_podvojitev:   tc05-obst-01  | Obstoječa | Petra | petra.spremenjena@example.test | Koper
- vrstica_4_neveljavna: TC05-NEV-01 | Neveljavna | Vera | vera.neveljavna.example.test | Celje

| Korak | Dejanje | Pričakovani rezultat | Vir |
|---|---|---|---|
| 1 | Na http://localhost:3001 se prijavi z admin@example.test in <VELJAVNO_GESLO_ADMIN>. | Prijava uspe; na voljo je uvoz. | K-01; DOKUMENTACIJA.md, razdelek 2 |
| 2 | Poišči TC05-NOV-01 in TC05-NEV-01; odpri podrobnosti TC05-OBST-01 in zabeleži e-pošto, občino in opombo. | Prva dva iskanja nimata zadetkov; podatki obstoječega člana ustrezajo testnim. | K-04; K-05 |
| 3 | Odpri uvoz in izberi tc05-skip-v1.xlsx. | Datoteka je sprejeta; prikazan je list »Clani« in predogled treh vrstic. | K-08; DOKUMENTACIJA.md, razdelek 7 (koraki 1–3) |
| 4 | Preveri preslikavo petih stolpcev. | Vsi stolpci so preslikani na ustrezna polja, vključno z Ime in Priimek. | K-08; DOKUMENTACIJA.md, razdelek 7 (korak 3); UPSTREAM.md, Excel import |
| 5 | Izberi pravilo SKIP in nadaljuj na pregled. | Pregled pokaže: vrstica 2 za ustvarjanje, vrstica 3 podvojitev obstoječega člana za preskok, vrstica 4 neveljavna z opisom napake e-pošte; potrditev je omogočena. | F-08; DOKUMENTACIJA.md, razdelek 7 (koraki 4–7, Pravila podvojitev); UPSTREAM.md, Excel import |
| 6 | Pred potrditvijo v drugem zavihku poišči TC05-NOV-01. | Ni zadetkov. | DOKUMENTACIJA.md, razdelek 7 (Slika 5) |
| 7 | Potrdi uvoz. | Poročilo pokaže 1 uvoženo, 0 posodobljenih, 1 preskočeno, 1 neveljavno vrstico. | K-09; F-07; F-08 |
| 8 | Poišči TC05-NOV-01. | Natanko en zapis: Nina Novak, Celje, nina.novak.tc05@example.test. | F-07 |
| 9 | Poišči TC05-OBST-01 in odpri podrobnosti. | En sam zapis; e-pošta, občina in opomba so enake kot v koraku 2. | F-08; DOKUMENTACIJA.md, razdelek 7 (Pravila podvojitev) |
| 10 | Poišči TC05-NEV-01. | Ni zadetkov. | DOKUMENTACIJA.md, razdelek 7 (Pravila podvojitev) |
| 11 | Odpri zgodovino uvozov in poročilo tega uvoza. | Vnos navaja tc05-skip-v1.xlsx, izvajalca admin@example.test in enaka števila kot v koraku 7; vrstica 4 je navedena z napako. | K-09; F-07; DOKUMENTACIJA.md, razdelek 7 |

**Končni pričakovani rezultat:** Nastane samo Nina Novak; obstoječi član je nespremenjen; neveljavni zapis ne nastane; poročilo 1/0/1/1 je v zgodovini uvozov. Uspeh: ujemajo se vsi pričakovani rezultati. Neizpolnjen predpogoj: »Blokirano«; razhajanje: »Neuspešno«.

**Predpostavke:**
- Korak 5: da normalizacija številke izkaznice prezre velikost črk ter začetne in končne presledke, dokumentacija ne določa natančno.
- Podatki: stolpec za opombo ni med podprtimi stolpci, zato spremenjene opombe ni mogoče vključiti v datoteko; korak 9 preveri, da opomba ostane enaka. Potrditi z naročnikom.
- Koraka 5 in 11: točno besedilo napake e-pošte ter ali je preskočena vrstica podrobno navedena v poročilu, nista določena.
- Korak 7: napisi števcev (npr. »ustvarjeno« namesto »uvoženo«) niso določeni.

**Stanje po testu:** Obstaja nov član TC05-NOV-01; TC05-OBST-01 je nespremenjen; v zgodovini je novo poročilo uvoza.

**Čiščenje in ponovitev:** Arhiviraj TC05-NOV-01 in po potrebi TC05-OBST-01 (K-07); poročilo uvoza ostane. Ponovitev: arhiviran TC05-NOV-01 bi se ujemal z novo vrstico, zato uporabi novo lokalno okolje ali nove identifikatorje in datoteko tc05-skip-v2.xlsx.

**Dejanski rezultat:** Ni izvedeno · **Status izvedbe:** Ni izvedeno · **Izvajalec:** Za vnos ob izvedbi · **Datum izvedbe:** Za vnos ob izvedbi · **Okolje:** Lokalna aplikacija http://localhost:3001 (VZPOSTAVITEV.md, razdelek 2); brskalnik in različica aplikacije: Za vnos ob izvedbi · **Povezava na napako:** Za vnos ob izvedbi

**Viri:** FUNKCIONALNOSTI.md, razdelek 2 (K-08, K-09); DOKUMENTACIJA.md, razdelek 3 (F-07, F-08), razdelek 5, razdelek 7; UPSTREAM.md, Excel import

## Matrika sledljivosti

| Oznaka | Funkcionalnost | Zahteva | TC-01 | TC-02 | TC-03 | TC-04 | TC-05 |
|---|---|---|---|---|---|---|---|
| K-01 | Prijava, seja in odjava | F-01 | X | — | — | — | — |
| K-04 | Iskanje, filtriranje in razvrščanje | F-04 | — | X | — | — | — |
| K-05 | Podrobnosti člana | F-03 | — | — | — | X | — |
| K-06 | Dodajanje in urejanje članov | F-03 | — | — | X | — | — |
| K-07 | Arhiviranje in obnovitev | F-06 | — | — | — | X | — |
| K-08 | Uvoz iz Excela in podvojitve | F-07, F-08 | — | — | — | — | X |
| K-09 | Zgodovina in poročila uvozov | F-07 | — | — | — | — | X |

## Uporabljena orodja UI

Uporabljeni orodji: OpenAI Codex (prvi dve iteraciji testnih primerov in prvotna priprava dokumentov) ter Claude (Anthropic) – priprava popravljenega ukaza v2.0, generiranje končnih testnih primerov s podagentom, ki je imel dostop samo do dokumentacije (brez izvorne kode), in priprava teh dokumentov. Ukaz in rezultat sva pregledala ter jih primerjala z dokumentacijo.
