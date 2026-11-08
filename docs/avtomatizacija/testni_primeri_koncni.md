# 3 Testni primeri

## TC-01 Veljavna prijava uporabnika USER, dostop do zaščitene strani in odjava

| **Atribut**               | **Vrednost**                                                                                                                      |
|---------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| Cilj                      | Preveriti, da aktiven račun USER z veljavnim geslom dostopa do zaščitene vsebine in da po odjavi zaščitena stran ni več dostopna. |
| Funkcionalnosti           | K-01, F-01                                                                                                                        |
| Vloga                     | USER                                                                                                                              |
| Vrsta                     | Pozitivni                                                                                                                         |
| Prioriteta                | Visoka                                                                                                                            |
| Avtor / datum / različica | agent UI (Claude) / 19. 10. 2026 / 2.0                                                                                            |

**Predpogoji**

- Aplikacija teče na http://localhost:3001. Uporabi točno ta naslov, ne 127.0.0.1 (NEXTAUTH_URL je localhost).

- Račun user@example.test obstaja, je aktiven, ni blokiran zaradi neuspelih prijav in ne zahteva spremembe gesla.

- Brskalnik nima aktivne seje aplikacije (zasebno okno).

**Testni podatki**

- e_posta: user@example.test

- geslo: \<VELJAVNO_GESLO_USER\>

| **\#** | **Dejanje**                                                                                 | **Pričakovani rezultat**                                                                 | **Vir**                                                                                           |
|--------|---------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| 1      | Odpri http://localhost:3001/prijava.                                                        | Prikaže se prijavni obrazec s poljema za e-pošto in geslo.                               | K-01; F-01; UPSTREAM.md, Authentication and authorization                                         |
| 2      | Vnesi testne podatke in potrdi prijavo.                                                     | Prijava uspe; prikaže se zaščitena vsebina aplikacije (npr. nadzorna plošča).            | K-01; F-01                                                                                        |
| 3      | Zabeleži naslov URL prikazane zaščitene strani.                                             | Naslov ni /prijava; vsebina je prikazana brez ponovne prijave.                           | F-01; UPSTREAM.md, Authentication and authorization                                               |
| 4      | Izvedi odjavo.                                                                              | Seja se zaključi; zaščitena vsebina ni več prikazana.                                    | K-01                                                                                              |
| 5      | V isti zavihek vnesi zabeleženi URL iz koraka 3. Nato odpri še http://localhost:3001/clani. | Zaščitena vsebina se ne prikaže; uporabnik je napoten na prijavo. Enako velja za /clani. | K-01; UPSTREAM.md, Authentication and authorization (vse strani razen /prijava zahtevajo prijavo) |

**Končni pričakovani rezultat:** USER se uspešno prijavi in vidi zaščiteno stran; po odjavi ta stran brez nove prijave ni dostopna. Uspeh: ujemajo se vsi pričakovani rezultati. Neizpolnjen predpogoj: »Blokirano«; razhajanje: »Neuspešno«.

**Predpostavke (potrditi z naročnikom)**

- Korak 2: da je po prijavi prikazana nadzorna plošča oziroma druga začetna zaščitena stran, dokumentacija ne določa natančno.

- Korak 4: napis in mesto gumba za odjavo ter stran, prikazana po odjavi, niso določeni.

- Korak 5: da se uporabnik preusmeri ravno na /prijava (in ne npr. prejme sporočilo o napaki), je predpostavka; zahteva je le, da vsebina ni dostopna.

**Stanje po testu:** Uporabnik je odjavljen; podatki v aplikaciji niso spremenjeni.

**Čiščenje in ponovitev:** Ni potrebno; zapri zasebno okno. Ponovitev: test je ponovljiv brez priprave; po petih napačnih poskusih v 15 minutah počakaj 15 minut (DOKUMENTACIJA.md, razdelek 6).

| **Dejanski rezultat**                                       | **Status** | **Izvajalec**     | **Datum izvedbe** | **Okolje**                                                                                                                                    | **Napaka** |
|-------------------------------------------------------------|------------|-------------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|------------|
| Vse se ujema. Po odjavi / in /clani preusmerita na prijavo. | Uspešno    | Aljaž Kodrič, Rok | 26\. 10. 2026     | Lokalna aplikacija http://localhost:3001 (VZPOSTAVITEV.md, razdelek 2); Windows, npm run dev, http://localhost:3001, Chromium, commit 5fdeff3 | —          |

**Viri:** FUNKCIONALNOSTI.md, razdelek 2 (K-01); DOKUMENTACIJA.md, razdelek 3 (F-01), razdelek 6; UPSTREAM.md, Authentication and authorization; VZPOSTAVITEV.md, razdelek 2

## TC-02 Združevanje iskanja ter filtrov Občina in Plačilo članarine

| **Atribut**               | **Vrednost**                                                                                                                     |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Cilj                      | Preveriti, da seznam članov hkrati upošteva iskanje in filtra, da se pogoji ohranijo po osvežitvi in da jih je mogoče počistiti. |
| Funkcionalnosti           | K-04, F-04                                                                                                                       |
| Vloga                     | USER                                                                                                                             |
| Vrsta                     | Pozitivni                                                                                                                        |
| Prioriteta                | Srednja                                                                                                                          |
| Avtor / datum / različica | agent UI (Claude) / 19. 10. 2026 / 2.0                                                                                           |

**Predpogoji**

- Aplikacija teče na http://localhost:3001; račun user@example.test je aktiven.

- Administrator je pred testom pripravil tri ne-arhivirane člane iz testnih podatkov (K-06).

- Noben drug ne-arhiviran član nima v iskanih poljih niza »TC02-«.

**Testni podatki**

- geslo: \<VELJAVNO_GESLO_USER\>

- izkaznica: TC02-A; ime: Ana; priimek: Testna; obcina: Maribor; plačilo članarine: Da

- izkaznica: TC02-B; ime: Bojan; priimek: Testni; obcina: Maribor; plačilo članarine: Ne

- izkaznica: TC02-C; ime: Cvetka; priimek: Testna; obcina: Ptuj; plačilo članarine: Da

| **\#** | **Dejanje**                                                                                        | **Pričakovani rezultat**                                                                                | **Vir**                                                                |
|--------|----------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|
| 1      | Prijavi se z user@example.test in geslom ter odpri seznam članov.                                  | Prikaže se seznam ne-arhiviranih članov.                                                                | K-01; K-04; DOKUMENTACIJA.md, razdelek 2                               |
| 2      | V iskanje vnesi »TC02-«.                                                                           | Prikazani so natanko trije zapisi: TC02-A, TC02-B, TC02-C.                                              | K-04; F-04                                                             |
| 3      | Ohrani iskanje ter nastavi Občina = Maribor in Plačilo članarine = Da ter klikni »Uporabi filtre«. | Prikazan je samo TC02-A.                                                                                | K-04; F-04                                                             |
| 4      | Osveži stran (F5).                                                                                 | Iskalni niz in oba filtra ostanejo nastavljeni; prikazan je samo TC02-A; URL vsebuje parametre pogojev. | DOKUMENTACIJA.md, razdelek 8; UPSTREAM.md, Member browsing and exports |
| 5      | Spremeni Občina = Ptuj in Plačilo članarine = Ne ter klikni »Uporabi filtre«.                      | Ni prikazanega nobenega zapisa; seznam je prazen.                                                       | F-04                                                                   |
| 6      | Klikni »Počisti filtre« (brez ročnega osveževanja strani) in razširi razdelek Filtri.              | Iskalno polje in filtra so prazni; seznam ni več omejen s temi pogoji.                                  | K-04; DOKUMENTACIJA.md, razdelek 8                                     |
| 7      | Vnesi samo »TC02-« brez filtrov.                                                                   | Spet so prikazani vsi trije zapisi, kar potrjuje, da sta filtra počiščena.                              | K-04; F-04                                                             |

**Končni pričakovani rezultat:** Iskanje in filtra se združujejo (3 / 1 / 0 zapisov), ohranijo se po osvežitvi in jih je mogoče počistiti. Uspeh: ujemajo se vsi pričakovani rezultati. Neizpolnjen predpogoj: »Blokirano«; razhajanje: »Neuspešno«.

**Predpostavke (potrditi z naročnikom)**

- Korak 2: da iskanje »po več poljih« vključuje številko izkaznice in delno ujemanje niza.

- Korak 3: da se pogoji združujejo z logičnim IN.

- Korak 5: besedilo sporočila ob praznem rezultatu ni določeno.

- Korak 6: dokumentacija ne določa načina čiščenja; uporabljen je gumb »Počisti filtre«, ki ga ponuja vmesnik.

**Stanje po testu:** Trije testni člani ostanejo nespremenjeni in ne-arhivirani.

**Čiščenje in ponovitev:** Administrator lahko testne člane arhivira (K-07) ali jih ohrani za ponovitev. Ponovitev: ponovno uporabi iste člane, če obstajajo in niso arhivirani; sicer jih pripravi znova.

| **Dejanski rezultat**                                                                                        | **Status** | **Izvajalec**     | **Datum izvedbe** | **Okolje**                                                                                                                                    | **Napaka** |
|--------------------------------------------------------------------------------------------------------------|------------|-------------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|------------|
| K1–5 OK (3/1/0). Po »Počisti filtre« filtra ostaneta nastavljena (Ptuj, Ne), iskanje TC02- vrne 0 namesto 3. | Neuspešno  | Aljaž Kodrič, Rok | 26\. 10. 2026     | Lokalna aplikacija http://localhost:3001 (VZPOSTAVITEV.md, razdelek 2); Windows, npm run dev, http://localhost:3001, Chromium, commit 5fdeff3 | N-01       |

**Viri:** FUNKCIONALNOSTI.md, razdelek 2 (K-04, K-06); DOKUMENTACIJA.md, razdelek 3 (F-04), razdelek 8; UPSTREAM.md, Member browsing and exports

## TC-03 Zavrnitev novega člana z e-pošto brez znaka @

| **Atribut**               | **Vrednost**                                                                                     |
|---------------------------|--------------------------------------------------------------------------------------------------|
| Cilj                      | Preveriti, da sistem ob dodajanju člana z neveljavno e-pošto prikaže napako in zapisa ne shrani. |
| Funkcionalnosti           | K-06, F-03                                                                                       |
| Vloga                     | ADMIN                                                                                            |
| Vrsta                     | Negativni                                                                                        |
| Prioriteta                | Visoka                                                                                           |
| Avtor / datum / različica | agent UI (Claude) / 19. 10. 2026 / 2.0                                                           |

**Predpogoji**

- Aplikacija teče na http://localhost:3001; račun admin@example.test je aktiven.

- Član z izkaznico TC03-001 ne obstaja (preveri v koraku 2).

**Testni podatki**

- geslo: \<VELJAVNO_GESLO_ADMIN\>

- ime: Neža

- priimek: Zavrnjena

- izkaznica: TC03-001

- e_posta: neza.zavrnjena.example.test

- ulica: Testna ulica 3

- postna_stevilka: 3000

- posta: Celje

- obcina: Celje

- plačilo članarine: Da

| **\#** | **Dejanje**                                                                             | **Pričakovani rezultat**                                                           | **Vir**                                                           |
|--------|-----------------------------------------------------------------------------------------|------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| 1      | Na http://localhost:3001 se prijavi z admin@example.test in \<VELJAVNO_GESLO_ADMIN\>.   | Prijava uspe; na voljo je dodajanje članov.                                        | K-01; DOKUMENTACIJA.md, razdelek 2                                |
| 2      | Na seznamu članov poišči »TC03-001«. Preveri še arhiv članov (/clani/arhiv).            | Ni zadetkov ne na seznamu ne v arhivu.                                             | K-04                                                              |
| 3      | Odpri obrazec za novega člana in vnesi vse testne podatke.                              | Obrazec sprejme vnos.                                                              | K-06                                                              |
| 4      | Shrani.                                                                                 | Prikaže se sporočilo, da e-pošta ni veljavna, ob polju E-pošta; član ni ustvarjen. | K-06; F-03; DOKUMENTACIJA.md, razdelek 3 (Nefunkcionalne zahteve) |
| 5      | Zapusti obrazec brez popravka in na seznamu poišči »TC03-001«. Preveri še arhiv članov. | Ni zadetkov na seznamu in v arhivu; zapis ni shranjen.                             | K-06; F-03                                                        |

**Končni pričakovani rezultat:** Shranjevanje je zavrnjeno z jasnim sporočilom o neveljavni e-pošti; član TC03-001 ne obstaja. Uspeh: ujemajo se vsi pričakovani rezultati. Neizpolnjen predpogoj: »Blokirano«; razhajanje: »Neuspešno«.

**Predpostavke (potrditi z naročnikom)**

- Korak 4: točno besedilo in mesto sporočila nista določena; napako lahko prikaže brskalnik ali strežnik (oba preverjata vhode).

- Korak 4: ali obrazec po napaki ohrani vnesene podatke, ni določeno.

- Korak 3: točni napisi polj obrazca niso določeni.

**Stanje po testu:** Nov član ni ustvarjen; podatki niso spremenjeni.

**Čiščenje in ponovitev:** Ni potrebno. Če je bil zapis kljub temu ustvarjen, ga zabeleži kot napako in arhiviraj. Ponovitev: preveri, da TC03-001 ne obstaja, nato ponovi.

| **Dejanski rezultat**                                                   | **Status** | **Izvajalec**     | **Datum izvedbe** | **Okolje**                                                                                                                                    | **Napaka** |
|-------------------------------------------------------------------------|------------|-------------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|------------|
| Zavrnjeno, napaka ob E-pošti, zapis ni nastal. Vsa polja se izpraznijo. | Uspešno    | Aljaž Kodrič, Rok | 26\. 10. 2026     | Lokalna aplikacija http://localhost:3001 (VZPOSTAVITEV.md, razdelek 2); Windows, npm run dev, http://localhost:3001, Chromium, commit 5fdeff3 | N-04       |

**Viri:** FUNKCIONALNOSTI.md, razdelek 2 (K-06); DOKUMENTACIJA.md, razdelek 2, razdelek 3 (F-03, Nefunkcionalne zahteve), razdelek 5 (Podatki člana)

## TC-04 Arhiviranje in obnovitev istega člana

| **Atribut**               | **Vrednost**                                                                                                                     |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Cilj                      | Preveriti, da arhiviran član izgine z običajnega seznama, je v arhivu in se z obnovitvijo vrne isti zapis z ohranjenimi podatki. |
| Funkcionalnosti           | K-05, K-07, F-06                                                                                                                 |
| Vloga                     | ADMIN                                                                                                                            |
| Vrsta                     | Pozitivni                                                                                                                        |
| Prioriteta                | Visoka                                                                                                                           |
| Avtor / datum / različica | agent UI (Claude) / 19. 10. 2026 / 2.0                                                                                           |

**Predpogoji**

- Aplikacija teče na http://localhost:3001; račun admin@example.test je aktiven.

- Administrator je pripravil ne-arhiviranega člana iz testnih podatkov (K-06); izkaznica TC04-001 je edinstvena.

**Testni podatki**

- geslo: \<VELJAVNO_GESLO_ADMIN\>

- ime: Marko

- priimek: Arhivski

- izkaznica: TC04-001

- e_posta: marko.arhivski@example.test

- obcina: Kranj

- plačilo članarine: Da

- opomba: TC04 opomba

| **\#** | **Dejanje**                                                                                              | **Pričakovani rezultat**                                                                                                                                | **Vir**                                                                 |
|--------|----------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| 1      | Na http://localhost:3001 se prijavi z admin@example.test in \<VELJAVNO_GESLO_ADMIN\>. Poišči »TC04-001«. | Prikazan je natanko en zapis.                                                                                                                           | K-04                                                                    |
| 2      | Odpri podrobnosti; zabeleži URL strani ter vse prikazane podatke.                                        | Podrobnosti ustrezajo testnim podatkom.                                                                                                                 | K-05                                                                    |
| 3      | Arhiviraj člana in potrdi dejanje. V potrditveno okno po potrebi vnesi polno ime »Marko Arhivski«.       | Sistem zahteva potrditev; arhiviranje uspe.                                                                                                             | K-07; UPSTREAM.md, Security, privacy, and operations                    |
| 4      | Na običajnem seznamu poišči »TC04-001«.                                                                  | Ni zadetkov.                                                                                                                                            | K-07; F-06; DOKUMENTACIJA.md, razdelek 8                                |
| 5      | Odpri arhiv (/clani/arhiv) in v tabeli poišči vrstico z izkaznico TC04-001.                              | Član TC04-001 je v arhivu.                                                                                                                              | K-07; DOKUMENTACIJA.md, razdelek 2                                      |
| 6      | Obnovi člana.                                                                                            | Obnovitev uspe; član ni več v arhivu.                                                                                                                   | K-07; F-06                                                              |
| 7      | Na običajnem seznamu poišči »TC04-001«.                                                                  | Prikazan je natanko en zapis (ni nastal nov).                                                                                                           | F-06; DOKUMENTACIJA.md, razdelek 5 (Brisanje in zgodovina)              |
| 8      | Odpri podrobnosti in primerjaj z zapisom iz koraka 2.                                                    | URL in ID sta enaka; vsi podatki člana (osebni, kontaktni, članski, organizacijski in opombe) so enaki. Sistemski čas »Posodobljeno« se sme spremeniti. | K-05; DOKUMENTACIJA.md, razdelek 5 (Brisanje in zgodovina), razdelek 11 |

**Končni pričakovani rezultat:** Isti zapis je po arhiviranju skrit s seznama in viden v arhivu, po obnovitvi pa spet na seznamu z enakim URL in podatki. Uspeh: ujemajo se vsi pričakovani rezultati. Neizpolnjen predpogoj: »Blokirano«; razhajanje: »Neuspešno«.

**Predpostavke (potrditi z naročnikom)**

- Koraka 2 in 8: da URL podrobnosti vsebuje trajni identifikator zapisa in ga je mogoče uporabiti kot dokaz istovetnosti.

- Korak 3: napisi gumbov in besedilo potrditve niso določeni.

- Korak 6: ali obnovitev zahteva potrditev, ni določeno.

- Vedenje ob neposrednem odprtju URL arhiviranega člana ni določeno in se v tem primeru ne preverja.

**Stanje po testu:** Član TC04-001 je ne-arhiviran s prvotnimi podatki; revizijska sled lahko vsebuje dogodka arhiviranja in obnovitve.

**Čiščenje in ponovitev:** Po potrebi člana arhiviraj (K-07). Ponovitev: uporabi ne-arhiviranega člana TC04-001 ali pripravi novega z edinstveno izkaznico.

| **Dejanski rezultat**                                         | **Status** | **Izvajalec**     | **Datum izvedbe** | **Okolje**                                                                                                                                    | **Napaka** |
|---------------------------------------------------------------|------------|-------------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|------------|
| Vse se ujema, isti ID in podatki; Posodobljeno 08:12 → 08:18. | Uspešno    | Aljaž Kodrič, Rok | 26\. 10. 2026     | Lokalna aplikacija http://localhost:3001 (VZPOSTAVITEV.md, razdelek 2); Windows, npm run dev, http://localhost:3001, Chromium, commit 5fdeff3 | —          |

**Viri:** FUNKCIONALNOSTI.md, razdelek 2 (K-05, K-07); DOKUMENTACIJA.md, razdelek 2, razdelek 3 (F-06), razdelek 5, razdelek 8, razdelek 11; UPSTREAM.md, Security, privacy, and operations

## TC-05 Uvoz Excela s pravilom SKIP: nov član, podvojitev in neveljavna vrstica

| **Atribut**               | **Vrednost**                                                                                                                                                             |
|---------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Cilj                      | Preveriti, da uvoz s pravilom SKIP ustvari samo nov veljaven zapis, preskoči podvojitev po številki izkaznice, izloči neveljavno vrstico in shrani poročilo v zgodovino. |
| Funkcionalnosti           | K-08, K-09, F-07, F-08                                                                                                                                                   |
| Vloga                     | ADMIN                                                                                                                                                                    |
| Vrsta                     | Pozitivni                                                                                                                                                                |
| Prioriteta                | Visoka                                                                                                                                                                   |
| Avtor / datum / različica | agent UI (Claude) / 19. 10. 2026 / 2.0                                                                                                                                   |

**Predpogoji**

- Aplikacija teče na http://localhost:3001; račun admin@example.test je aktiven.

- Administrator je prek obrazca pripravil ne-arhiviranega obstoječega člana iz testnih podatkov (K-06).

- Člana z izkaznicama TC05-NOV-01 in TC05-NEV-01 ter e-pošto nina.novak.tc05@example.test ne obstajata.

- Pripravljena je datoteka tc05-skip-v1.xlsx (en list »Clani«, glava v vrstici 1, vrstice 2–4).

**Testni podatki**

- geslo: \<VELJAVNO_GESLO_ADMIN\>

- obstojeci_clan: izkaznica: TC05-OBST-01; ime: Petra; priimek: Obstoječa; e_posta: petra.obstojeca@example.test; obcina: Koper; opomba: Izvorna opomba TC05

- glava: Št. Izkaznice \| Priimek \| Ime \| E mail \| Občina \| Opombe

- vrstica_2_nov: TC05-NOV-01 \| Novak \| Nina \| nina.novak.tc05@example.test \| Celje \| (prazno)

- vrstica_3_podvojitev: tc05-obst-01 \| Obstoječa \| Petra \| petra.spremenjena@example.test \| Koper \| Spremenjena opomba TC05

- vrstica_4_neveljavna: TC05-NEV-01 \| Neveljavna \| Vera \| vera.neveljavna.example.test \| Celje \| (prazno)

| **\#** | **Dejanje**                                                                                              | **Pričakovani rezultat**                                                                                                                                                                                                     | **Vir**                                                                                        |
|--------|----------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| 1      | Na http://localhost:3001 se prijavi z admin@example.test in \<VELJAVNO_GESLO_ADMIN\>.                    | Prijava uspe; na voljo je uvoz.                                                                                                                                                                                              | K-01; DOKUMENTACIJA.md, razdelek 2                                                             |
| 2      | Poišči TC05-NOV-01 in TC05-NEV-01; odpri podrobnosti TC05-OBST-01 in zabeleži e-pošto, občino in opombo. | Prva dva iskanja nimata zadetkov; podatki obstoječega člana ustrezajo testnim.                                                                                                                                               | K-04; K-05                                                                                     |
| 3      | Odpri uvoz in izberi tc05-skip-v1.xlsx.                                                                  | Datoteka je sprejeta; prikazan je predogled treh podatkovnih vrstic. Ime lista »Clani« je razvidno najkasneje v poročilu (korak 11).                                                                                         | K-08; DOKUMENTACIJA.md, razdelek 7 (koraki 1–3)                                                |
| 4      | Preveri preslikavo šestih stolpcev.                                                                      | Vsi stolpci so preslikani na ustrezna polja, vključno z Ime, Priimek in Opombe.                                                                                                                                              | K-08; DOKUMENTACIJA.md, razdelek 7 (korak 3); UPSTREAM.md, Excel import                        |
| 5      | Izberi pravilo SKIP in nadaljuj na pregled.                                                              | Pregled pokaže števce: za uvoz 1, za posodobitev 0, preskočeno 1, neveljavno 1; vrstica 3 je označena kot preskočena podvojitev obstoječega člana, vrstica 4 kot neveljavna z opisom napake e-pošte; potrditev je omogočena. | F-08; DOKUMENTACIJA.md, razdelek 7 (koraki 4–7, Pravila podvojitev); UPSTREAM.md, Excel import |
| 6      | Pred potrditvijo v drugem zavihku poišči TC05-NOV-01. Zavihka z uvozom ne zapuščaj in ne osvežuj.        | Ni zadetkov.                                                                                                                                                                                                                 | DOKUMENTACIJA.md, razdelek 7 (Slika 5)                                                         |
| 7      | Potrdi uvoz.                                                                                             | Poročilo pokaže 1 uvoženo, 0 posodobljenih, 1 preskočeno, 1 neveljavno vrstico.                                                                                                                                              | K-09; F-07; F-08                                                                               |
| 8      | Poišči TC05-NOV-01.                                                                                      | Natanko en zapis: Nina Novak, Celje, nina.novak.tc05@example.test.                                                                                                                                                           | F-07                                                                                           |
| 9      | Poišči TC05-OBST-01 in odpri podrobnosti.                                                                | En sam zapis; e-pošta, občina in opomba so enake kot v koraku 2.                                                                                                                                                             | F-08; DOKUMENTACIJA.md, razdelek 7 (Pravila podvojitev)                                        |
| 10     | Poišči TC05-NEV-01.                                                                                      | Ni zadetkov.                                                                                                                                                                                                                 | DOKUMENTACIJA.md, razdelek 7 (Pravila podvojitev)                                              |
| 11     | Odpri zgodovino uvozov in poročilo tega uvoza.                                                           | Vnos navaja tc05-skip-v1.xlsx, izvajalca admin@example.test in enaka števila kot v koraku 7; vrstica 4 je navedena z napako.                                                                                                 | K-09; F-07; DOKUMENTACIJA.md, razdelek 7                                                       |

**Končni pričakovani rezultat:** Nastane samo Nina Novak; obstoječi član je nespremenjen; neveljavni zapis ne nastane; poročilo 1/0/1/1 je v zgodovini uvozov. Uspeh: ujemajo se vsi pričakovani rezultati. Neizpolnjen predpogoj: »Blokirano«; razhajanje: »Neuspešno«.

**Predpostavke (potrditi z naročnikom)**

- Korak 5: da normalizacija številke izkaznice prezre velikost črk ter začetne in končne presledke, dokumentacija ne določa natančno.

- Podatki: stolpec Opombe v UPSTREAM.md ni naveden med podprtimi, vendar ga čarovnik ponuja; vključen je, da korak 9 dejansko preveri, da SKIP ne spremeni opombe. Potrditi z naročnikom in dopolniti dokumentacijo.

- Koraka 5 in 11: točno besedilo napake e-pošte ter ali je preskočena vrstica podrobno navedena v poročilu, nista določena.

- Korak 7: napisi števcev (npr. »ustvarjeno« namesto »uvoženo«) niso določeni.

**Stanje po testu:** Obstaja nov član TC05-NOV-01; TC05-OBST-01 je nespremenjen; v zgodovini je novo poročilo uvoza.

**Čiščenje in ponovitev:** Arhiviraj TC05-NOV-01 in po potrebi TC05-OBST-01 (K-07); poročilo uvoza ostane. Ponovitev: arhiviran TC05-NOV-01 bi se ujemal z novo vrstico, zato uporabi novo lokalno okolje ali nove identifikatorje in datoteko tc05-skip-v2.xlsx.

| **Dejanski rezultat**                                                                       | **Status** | **Izvajalec**     | **Datum izvedbe** | **Okolje**                                                                                                                                    | **Napaka** |
|---------------------------------------------------------------------------------------------|------------|-------------------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|------------|
| Vse se ujema (1/0/1/1). V pregledu vrstica 3 piše »Posodobitev«, prikazane so kode in JSON. | Uspešno    | Aljaž Kodrič, Rok | 26\. 10. 2026     | Lokalna aplikacija http://localhost:3001 (VZPOSTAVITEV.md, razdelek 2); Windows, npm run dev, http://localhost:3001, Chromium, commit 5fdeff3 | N-02, N-03 |

**Viri:** FUNKCIONALNOSTI.md, razdelek 2 (K-08, K-09); DOKUMENTACIJA.md, razdelek 3 (F-07, F-08), razdelek 5, razdelek 7; UPSTREAM.md, Excel import
