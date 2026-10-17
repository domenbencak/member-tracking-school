# Funkcionalno testiranje evidence članov

Datum: 12. 10. 2026. Status vseh testov: **Ni izvedeno**.

## Končni ukaz

Deluj kot agent za funkcionalno testiranje. Za projekt Evidenca članov – šolska različica (member-tracking-school) ustvari natanko pet ročnih funkcionalnih testnih primerov v slovenščini. Osnova so docs/FUNKCIONALNOSTI.md, ustrezni deli docs/DOKUMENTACIJA.md in izvorna koda aplikacije. Uporabi obstoječe oznake K-xx, dejanske napise vmesnika in samo implementirano vedenje. Ne beri .env, ne izvajaj testov in ne spreminjaj aplikacije.

Pripravi te scenarije: TC-01 veljavna prijava uporabnika USER, dostop do zaščitene strani in odjava; TC-02 združevanje iskanja ter filtrov Občina in Plačilo članarine; TC-03 zavrnitev novega člana z neveljavno e-pošto; TC-04 arhiviranje s potrditvijo polnega imena in obnovitev istega člana; TC-05 uvoz Excela s pravilom SKIP, ki vsebuje en nov veljaven zapis, eno podvojitev in eno neveljavno e-pošto.

Vsak primer naj vsebuje ID, naslov, cilj, oznake funkcionalnosti, vlogo, vrsto pozitivni ali negativni, prioriteto, predpogoje, konkretne izmišljene podatke, oštevilčene korake s pričakovanim rezultatom za vsak korak, končni pričakovani rezultat kot merilo uspeha, stanje po testu, čiščenje in navodilo za ponovitev. Dodaj avtorja agenta, datum 12. 10. 2026, različico 1.1, dejanski rezultat, status izvedbe, izvajalca, datum izvedbe, okolje in različico aplikacije ter povezavo na napako. Dejanski rezultat in status izvedbe sta Ni izvedeno; ostala polja za zapis izvedbe so Za vnos ob izvedbi. Navedi relativne poti do virov. Priprava podatkov je predpogoj, ne že opravljeno dejanje.

Uporabi lokalno aplikacijo http://localhost:3001 in obstoječa šolska računa user@example.test ter admin@example.test. Geslo označi kot <VELJAVNO_GESLO_USER> oziroma <VELJAVNO_GESLO_ADMIN>; dejanske vrednosti se v dokument ne zapisujejo. Zahtevaj aktivna računa brez obvezne menjave gesla in neodvisno pripravo seje za vsak test. Ne predpostavljaj točnega skupnega števila vseh članov v obstoječi bazi. Uspeh zahteva ujemanje vseh pričakovanih rezultatov; blokiran predpogoj pomeni Blokirano, razhajanje z rezultatom pa Neuspešno.

TC-02 omeji na tri ne-arhivirane zapise z enkratnimi izkaznicami TC02-A, TC02-B in TC02-C. A ima občino Maribor in plačano članarino, B Maribor in neplačano, C Ptuj in plačano. Iskanje TC02- vrne tri zapise; kombinacija Maribor in Da vrne samo A; Ptuj in Ne vrne nič. Preveri še ohranitev pogojev po osvežitvi in čiščenje filtrov. Ostali filtri ostanejo privzeti.

TC-03 zahteva pravilni imeni in neveljavno e-pošto brez @, druga polja pa veljavna ali privzeta. Preveri dejanski sporočili aplikacije ter odsotnost shranjenega zapisa. TC-04 zabeleži ID, po arhiviranju poskusi odpreti prvotni URL podrobnosti in pričakuj nedostopen zapis oziroma 404. Po obnovitvi preveri isti ID in ohranitev podatkov. Uporabi dejanske gumbe Izbriši, Potrdi brisanje in Obnovi.

TC-05 poenostavi na pravo datoteko tc05-skip-v1.xlsx z enim listom Clani_TC05, glavo v vrstici 1 in tremi podatkovnimi vrsticami. Stolpci so Št. izkaznice, Priimek, Ime, E-pošta in Opombe. Pri podvojitvi uporabi isto izkaznico z drugačno velikostjo črk in presledki ter spremenjeni e-pošto in opombo. Preveri, da pred potrditvijo nov član še ne obstaja. Po preverjanju pričakuj Za uvoz 1, Za posodobitev 0, Preskočeno 1 in Neveljavno 1; končno poročilo ima skupaj 3 vrstice. Po potrditvi preveri nov zapis, nespremenjeno podvojitev, odsotnost neveljavnega zapisa in ponovno odprtje poročila v zgodovini. Pri enem listu ne predpostavljaj vidnega izbirnika lista. Ponovitev mora upoštevati tudi podvojitve v arhivu.

Piši jedrnato in kot navodilo za drugega izvajalca. Izloči notranje podrobnosti baze in kode iz korakov. Vsak primer naj ima največ 450 besed, TC-05 največ 650. Oznake funkcionalnosti naj predstavljajo izrecno preverjane rezultate, ne zgolj uporabo navigacije ali pripravo podatkov. Vrni strukturiran JSON z objektom cases in ključi id, title, objective, functionality_ids, role, type, priority, preconditions, data, steps (number, action, expected), final_expected, postconditions, cleanup, author, created_date, version, actual_result, execution_status, executor, execution_date, environment, defect_link in evidence. Ne izmišljaj uspešne izvedbe.

## Pregled rezultata

Prvi izhod agenta je vseboval vseh pet primerov in zahtevane atribute, vendar je pri iskanju vključil šest članov in šest filtrov, pri uvozu pa dva lista in štirinajst stolpcev. Ukaz sem dopolnil tako, da iskanje preverja tri člane in dva filtra, uvoz pa en list in pet stolpcev. Tako je priprava podatkov krajša, pričakovani rezultati pa ostanejo natančno določeni.
V končnem ukazu sem dodatno zahteval dostop do arhiviranega člana po prvotnem URL-ju, uporabo obstoječih šolskih računov z označbami za gesla in jasna merila uspeha. Iz korakov sem odstranil zahtevo po opisovanju notranjih podrobnosti kode. Pregled in dopolnitev je opravil glavni agent Codex; izvedba testov ni bila del te naloge.
Sam bi pri nadaljnjem razvoju testiranja dodal ločen primer zavrnitve administratorskega dejanja za vlogo USER in mejne vrednosti vhodnih polj. Primer arhiviranja in obnove bi razdelil na dva samostojna testa, primer uvoza pa na več manjših preverjanj, da bi ob napaki lažje določil vzrok. V tej oddaji ostaja natanko pet primerov.

## Testni primeri

### TC-01 Veljavna prijava uporabnika in odjava

**Cilj:** Preveriti prijavo aktivnega uporabnika USER, dostop do zaščitene strani in izgubo dostopa po odjavi.

**Funkcionalnosti:** K-01

**Vloga:** USER

**Vrsta:** Pozitivni

**Prioriteta:** Visoka P1

**Avtor:** OpenAI Codex – glavni agent

**Datum nastanka:** 12. 10. 2026

**Različica:** 1.1

**Predpogoji:** Aplikacija http://localhost:3001 deluje. Račun user@example.test je aktiven, ima vlogo USER in ne zahteva menjave gesla. Prijava za račun in IP ni blokirana.; Odprite novo zasebno okno brskalnika brez prijavljene seje. Veljavno lokalno geslo pozna izvajalec.

**Testni podatki:** E-pošta: user@example.test. Geslo: <VELJAVNO_GESLO_USER>, označba za veljavno lokalno geslo.; Prijava: /prijava. Zaščitena stran: /clani.

| Korak | Dejanje | Pričakovani rezultat |
| --- | --- | --- |
| 1 | Odprite http://localhost:3001/prijava. | Prikazana so polji E-pošta in Geslo ter gumb Prijava. |
| 2 | Vnesite navedeno e-pošto in veljavno lokalno geslo. Kliknite Prijava. | Odpre se Nadzorna plošča. V glavi je user@example.test in gumb Odjava. |
| 3 | Kliknite Člani. | Odpre se /clani z naslovom Člani in seznamom. Ponovna prijava ni zahtevana. |
| 4 | Kliknite Odjava in počakajte na preusmeritev. | Odpre se /prijava z obrazcem za prijavo. |
| 5 | V naslovno vrstico znova vnesite http://localhost:3001/clani. | Odpre se prijava; seznam članov ni prikazan. URL lahko vsebuje callbackUrl. |

**Končni pričakovani rezultat:** Test je uspešen, če veljavna prijava omogoči dostop do /clani, odjava pa ta dostop prekine in so izpolnjeni vsi pričakovani rezultati korakov.

**Stanje po testu:** Uporabnik je odjavljen. Članski podatki in obstoječi račun ostanejo nespremenjeni.

**Čiščenje:** Zaprite zasebno okno. Ob ponovitvi uporabite novo okno brez seje; obstoječega šolskega računa ne odstranjujte.

**Dejanski rezultat:** Ni izvedeno

**Status izvedbe:** Ni izvedeno

**Izvajalec:** Za vnos ob izvedbi

**Datum izvedbe:** Za vnos ob izvedbi

**Okolje in različica aplikacije:** Za vnos ob izvedbi

**Povezava na napako:** Za vnos ob izvedbi

**Viri:** docs/FUNKCIONALNOSTI.md; src/components/login-form.tsx; src/components/sign-out-button.tsx; src/lib/auth/options.ts; src/lib/auth/authorization.ts; src/proxy.ts

### TC-02 Iskanje in kombinacija filtrov članov

**Cilj:** Preveriti združevanje iskanja s filtriranjem po občini in plačilu članarine, prazen rezultat, osvežitev in čiščenje pogojev.

**Funkcionalnosti:** K-04

**Vloga:** USER

**Vrsta:** Pozitivni

**Prioriteta:** Visoka P1

**Avtor:** OpenAI Codex – glavni agent

**Datum nastanka:** 12. 10. 2026

**Različica:** 1.1

**Predpogoji:** Aplikacija deluje. Neodvisno se prijavite kot aktiven USER user@example.test z <VELJAVNO_GESLO_USER>, brez zahteve po menjavi gesla.; Administrator pred izvedbo pripravi tri spodnje ne-arhivirane člane. V drugih iskanih poljih ne-arhiviranih članov ni niza TC02-. Podatki se med testom ne spreminjajo. Uporabite namizni prikaz.

**Testni podatki:** A: Nika Filtrnik; izkaznica TC02-A; občina Maribor; Plačilo članarine Da.; B: Maja Filtrnik; izkaznica TC02-B; občina Maribor; Plačilo članarine Ne.; C: Rok Filtrnik; izkaznica TC02-C; občina Ptuj; Plačilo članarine Da. Vsi imajo status Drugo; ostala neobvezna polja so prazna ali privzeta. Iskanje: TC02-.

| Korak | Dejanje | Pričakovani rezultat |
| --- | --- | --- |
| 1 | Odprite /clani brez parametrov. V Iskanje članov vnesite TC02- in počakajte na posodobitev seznama. | Prikazane so natanko tri vrstice z izkaznicami TC02-A, TC02-B in TC02-C; števec je 3 rezultatov. |
| 2 | Razprite Filtri. Izberite Občina Maribor in Plačilo članarine Da. Ostale filtre pustite privzete. Kliknite Uporabi filtre. | Prikazan je samo TC02-A; števec je 1 rezultatov. B izloči članarina, C občina. |
| 3 | Osvežite stran. | Iskanje TC02-, oba filtra in en rezultat TC02-A ostanejo ohranjeni. |
| 4 | Ohranite iskanje. Nastavite Občina Ptuj in Plačilo članarine Ne ter kliknite Uporabi filtre. | Števec je 0 rezultatov. Prikaže se Ni članov, ki bi ustrezali izbranim pogojem. |
| 5 | Kliknite Počisti filtre. | Odpre se /clani brez pogojev. Iskanje je prazno, filtri privzeti; prikazan je nefiltriran nabor članov. |

**Končni pričakovani rezultat:** Test je uspešen, če iskanje vrne tri testne člane, kombinacija Maribor in Da samo A, Ptuj in Ne nobenega, osvežitev ohrani pogoje in čiščenje jih odstrani.

**Stanje po testu:** Iskanje in filtri so počiščeni; podatki testnih članov so nespremenjeni.

**Čiščenje:** Odjavite se. Stalni testni nabor pustite pripravljen; začasne člane administrator arhivira. Pred ponovitvijo obnovite iste tri zapise ali pripravite nov enkraten nabor in uskladite označbe.

**Dejanski rezultat:** Ni izvedeno

**Status izvedbe:** Ni izvedeno

**Izvajalec:** Za vnos ob izvedbi

**Datum izvedbe:** Za vnos ob izvedbi

**Okolje in različica aplikacije:** Za vnos ob izvedbi

**Povezava na napako:** Za vnos ob izvedbi

**Viri:** docs/FUNKCIONALNOSTI.md; src/components/member-filters.tsx; src/components/search-input.tsx; src/components/member-results.tsx; src/lib/members/queries.ts

### TC-03 Zavrnitev dodajanja člana z neveljavnim elektronskim naslovom

**Cilj:** Preveriti, da neveljavna e-pošta povzroči jasno napako in prepreči shranjevanje novega člana.

**Funkcionalnosti:** K-06

**Vloga:** ADMIN

**Vrsta:** Negativni

**Prioriteta:** Visoka P1

**Avtor:** OpenAI Codex – glavni agent

**Datum nastanka:** 12. 10. 2026

**Različica:** 1.1

**Predpogoji:** Aplikacija deluje. Neodvisno se prijavite kot aktiven ADMIN admin@example.test z <VELJAVNO_GESLO_ADMIN>, brez zahteve po menjavi gesla.; Član z izkaznico TC03-ERR-001 še ne obstaja. Drugih neveljavnih vrednosti ne vnašajte.

**Testni podatki:** Ime Klara; Priimek Preizkusnik; Št. izkaznice TC03-ERR-001; E-pošta klara.tc03.example.test, brez znaka @.; Status člana Drugo; članarina in veteranski status Ni podatka. Ostala neobvezna polja so prazna; datum statusa ostane privzet.

| Korak | Dejanje | Pričakovani rezultat |
| --- | --- | --- |
| 1 | Odprite /clani brez parametrov. Poiščite TC03-ERR-001. | Prikazano je 0 rezultatov; testni član še ne obstaja. |
| 2 | Kliknite Dodaj člana. | Odpre se /clani/nov z obrazcem Dodaj člana in gumbom Shrani. |
| 3 | Vnesite navedene ime, priimek, izkaznico in neveljavno e-pošto. Ohranite druge navedene vrednosti. Kliknite Shrani. | Obrazec ostane odprt. Prikažeta se Preverite označena polja. in pri e-pošti Vnesite veljaven e-poštni naslov. Stran podrobnosti se ne odpre. |
| 4 | Kliknite Prekliči. Na seznamu brez dodatnih filtrov znova poiščite TC03-ERR-001. | Prikazano je 0 rezultatov in Ni članov, ki bi ustrezali izbranim pogojem. Zapis ni bil shranjen. |

**Končni pričakovani rezultat:** Test je uspešen, če sistem zavrne neveljavno e-pošto z navedenima sporočiloma in ne ustvari testnega člana. Pričakovana zavrnitev pomeni pravilen rezultat testa.

**Stanje po testu:** Član TC03-ERR-001 ne obstaja. Administrator je na seznamu članov.

**Čiščenje:** Počistite filtre in se odjavite. Podatkov za čiščenje ob pričakovanem rezultatu ni. Če zapis nepričakovano nastane, evidentirajte napako in ga arhivirajte s polnim imenom Klara Preizkusnik. Pred ponovitvijo zagotovite odsotnost označbe v ne-arhiviranem naboru.

**Dejanski rezultat:** Ni izvedeno

**Status izvedbe:** Ni izvedeno

**Izvajalec:** Za vnos ob izvedbi

**Datum izvedbe:** Za vnos ob izvedbi

**Okolje in različica aplikacije:** Za vnos ob izvedbi

**Povezava na napako:** Za vnos ob izvedbi

**Viri:** docs/FUNKCIONALNOSTI.md; src/components/member-form.tsx; src/lib/members/validation.ts; src/lib/members/actions.ts; src/lib/action-state.ts

### TC-04 Arhiviranje in obnovitev istega člana

**Cilj:** Preveriti, da arhiviranje onemogoči običajen dostop do člana, obnovitev pa vrne isti zapis z ohranjenimi podatki.

**Funkcionalnosti:** K-07; K-05

**Vloga:** ADMIN

**Vrsta:** Pozitivni

**Prioriteta:** Visoka P1

**Avtor:** OpenAI Codex – glavni agent

**Datum nastanka:** 12. 10. 2026

**Različica:** 1.1

**Predpogoji:** Aplikacija deluje. Neodvisno se prijavite kot aktiven ADMIN admin@example.test z <VELJAVNO_GESLO_ADMIN>, brez zahteve po menjavi gesla.; Pripravljen je natanko en ne-arhiviran član s spodnjimi podatki; drugi testi ga ne spreminjajo.

**Testni podatki:** Vid Arhivnik; izkaznica TC04-ARH-001; e-pošta vid.tc04@example.test; ulica Testna ulica 14; poštna številka 2000; pošta Maribor; status Drugo; datum statusa 2026-10-01; članarina Da; veteran Ne; opomba Kontrolna opomba TC04.; Potrditveno polno ime: Vid Arhivnik.

| Korak | Dejanje | Pričakovani rezultat |
| --- | --- | --- |
| 1 | Na /clani brez dodatnih filtrov poiščite TC04-ARH-001. Odprite člana, preverite podatke in zabeležite ID ter URL podrobnosti. | Najden je en Vid Arhivnik. Podrobnosti ustrezajo testnim podatkom. |
| 2 | Kliknite Izbriši. | Odpre se Arhiviraj člana. Zahtevano je Polno ime; gumb Potrdi brisanje je brez vnosa onemogočen. |
| 3 | Vnesite Vid Arhivnik in kliknite Potrdi brisanje. | Prikaže se Član je arhiviran. Odpre se /clani. |
| 4 | Znova poiščite TC04-ARH-001. | Običajni seznam vrne 0 rezultatov. |
| 5 | V naslovni vrstici odprite zabeleženi URL podrobnosti. | Stran sporoči, da zapis ni najden, oziroma prikaže 404. Podatki arhiviranega člana niso dostopni. |
| 6 | Odprite /clani/arhiv in poiščite Vid Arhivnik, TC04-ARH-001. | Arhiv članov vsebuje zapis z izkaznico, časom arhiviranja in gumbom Obnovi. |
| 7 | V tej vrstici kliknite Obnovi. | Prikaže se Član je obnovljen. Vrstica izgine iz arhiva. |
| 8 | Na /clani znova poiščite TC04-ARH-001 in odprite podrobnosti. | Najden je en član. ID je prvotni; vsi navedeni podatki so ohranjeni, datum statusa je 1. 10. 2026. |

**Končni pričakovani rezultat:** Test je uspešen, če arhiviranega člana ni niti na običajnem seznamu niti v podrobnostih, obnovitev pa vrne isti ID in podatke. Vsi koraki ustrezajo pričakovanjem.

**Stanje po testu:** Član je obnovljen. Status članstva ostane Drugo; arhiviranje ga ne spremeni.

**Čiščenje:** Odjavite se. Za ponovitev stalni nabor pustite obnovljen. Začasni zapis administrator ponovno arhivira s polnim imenom; pred ponovitvijo ga obnovi. Revizijski dogodki ostanejo.

**Dejanski rezultat:** Ni izvedeno

**Status izvedbe:** Ni izvedeno

**Izvajalec:** Za vnos ob izvedbi

**Datum izvedbe:** Za vnos ob izvedbi

**Okolje in različica aplikacije:** Za vnos ob izvedbi

**Povezava na napako:** Za vnos ob izvedbi

**Viri:** docs/FUNKCIONALNOSTI.md; src/components/member-delete-button.tsx; src/components/restore-member-button.tsx; src/lib/members/actions.ts; src/app/(app)/clani/arhiv/page.tsx; src/app/(app)/clani/[id]/page.tsx

### TC-05 Uvoz novega podvojenega in neveljavnega zapisa

**Cilj:** Preveriti uvoz enega novega člana, preskok podvojitve s pravilom SKIP, zavrnitev neveljavne vrstice in pravilnost poročila.

**Funkcionalnosti:** K-08; K-09; K-05

**Vloga:** ADMIN

**Vrsta:** Pozitivni z negativnim vhodom

**Prioriteta:** Visoka P1

**Avtor:** OpenAI Codex – glavni agent

**Datum nastanka:** 12. 10. 2026

**Različica:** 1.1

**Predpogoji:** Aplikacija deluje. Neodvisno se prijavite kot aktiven ADMIN admin@example.test z <VELJAVNO_GESLO_ADMIN>, brez zahteve po menjavi gesla.; Pripravljen je en ne-arhiviran Borut Primer z izkaznico TC05-DUP-001, e-pošto borut.tc05@example.test in opombo Original TC05. Status je Drugo; druga neobvezna polja so prazna oziroma Ni podatka.; TC05-NOV-001 in TC05-ERR-001 ne obstajata niti v arhivu. E-pošta novega člana je enkratna. Ni sočasnih sprememb. Pripravite pravo datoteko .xlsx s spodnjo vsebino, brez praznih dodatnih vrstic, znotraj omejitve velikosti.

**Testni podatki:** Datoteka tc05-skip-v1.xlsx, en list Clani_TC05. Glave A:E v vrstici 1: Št. izkaznice | Priimek | Ime | E-pošta | Opombe. Celice so besedilne.; Vrstica 2: TC05-NOV-001 | Vzorčnik | Tjaša | tjasa.tc05@example.test | Nov zapis TC05.; Vrstica 3: [presledek]tc05-dup-001[presledek] | Primer | Borut | borut.sprememba.tc05@example.test | Tega ne shrani TC05. Oznaki [presledek] zamenjajte z dejanskima presledkoma.; Vrstica 4: TC05-ERR-001 | Neveljavnik | Petra | petra.tc05.example.test | Neveljavna vrstica TC05.; Pravilo: Preskoči podvojene (SKIP). Dovoli opozorila poštnih številk: nepotrjeno. Nenavedena polja: Ne uvozi.

| Korak | Dejanje | Pričakovani rezultat |
| --- | --- | --- |
| 1 | Na /clani odprite Boruta po izkaznici TC05-DUP-001. Zabeležite ID, e-pošto in opombo. Nato odprite Uvoz podatkov. | Borut ustreza izhodiščnim podatkom. Odpre se /uvoz. |
| 2 | Izberite tc05-skip-v1.xlsx. Preverite preslikavo petih glav na istoimenska polja in tri podatkovne vrstice v predogledu. | Datoteka se prebere. Vse preslikave in tri vrstice ustrezajo podatkom. Pri enem listu izbirnik lista ni prikazan. |
| 3 | Izberite Preskoči podvojene, pustite poštna opozorila nepotrjena in kliknite Preveri vrstice. | Za uvoz 1, Za posodobitev 0, Preskočeno 1, Neveljavno 1. Vrstica 3 je SKIP; vrstica 4 INVALID z Vnesite veljaven e-poštni naslov. Potrdi in uvozi je omogočen. |
| 4 | Pred potrditvijo v drugem zavihku iste seje na /clani brez dodatnih filtrov poiščite TC05-NOV-001. Vrnite se v čarovnik. | Iskanje vrne 0 rezultatov. Preverjanje vrstic še ni ustvarilo novega člana. |
| 5 | Kliknite Potrdi in uvozi. | Odpre se Poročilo uvoza: Skupaj vrstic 3, Uvoženo 1, Posodobljeno 0, Preskočeno 1, Neveljavno 1; datoteka tc05-skip-v1.xlsx, list Clani_TC05, Podvojeni SKIP in prijavljeni administrator. Napaka e-pošte je povezana z vrstico 4. |
| 6 | Na /clani brez dodatnih filtrov poiščite TC05-NOV-001 in odprite podrobnosti. | Najdena je samo Tjaša Vzorčnik z izkaznico, e-pošto in opombo iz vrstice 2; status je Drugo. |
| 7 | Poiščite TC05-DUP-001 in odprite Borutove podrobnosti. | Najden je en prvotni Borut z istim ID, e-pošto borut.tc05@example.test in opombo Original TC05. Spremembe iz vrstice 3 niso shranjene. |
| 8 | Poiščite TC05-ERR-001 brez dodatnih filtrov. | Prikazano je 0 rezultatov. Neveljaven zapis ni ustvarjen. |
| 9 | Odprite Zgodovina uvozov. Pri najnovejšem uvozu te datoteke kliknite povezavo v stolpcu Datum. | Zgodovina kaže enake števce, datoteko in administratorja. Povezava znova odpre isto poročilo. |

**Končni pričakovani rezultat:** Test je uspešen, če je ustvarjena samo Tjaša, Borut ostane nespremenjen, Petra ne nastane in so števci ter vsi drugi pričakovani rezultati pravilni.

**Stanje po testu:** Ustvarjen je en nov član in poročilo uvoza; obstoječi član je nespremenjen. Neveljavna vrstica ni shranjena med člane.

**Čiščenje:** Arhivirajte začasnega novega člana in po potrebi Boruta; odjavite se. Poročilo in revizijski zapis ostaneta. Za ponovitev obnovite Boruta ter v vseh podatkih in datoteki usklajeno uporabite nove enkratne izkaznice in e-pošte nove ter neveljavne vrstice. Arhiviranje novega člana ne odpravi njegove podvojitve.

**Dejanski rezultat:** Ni izvedeno

**Status izvedbe:** Ni izvedeno

**Izvajalec:** Za vnos ob izvedbi

**Datum izvedbe:** Za vnos ob izvedbi

**Okolje in različica aplikacije:** Za vnos ob izvedbi

**Povezava na napako:** Za vnos ob izvedbi

**Viri:** docs/FUNKCIONALNOSTI.md; src/components/import-wizard.tsx; src/lib/import/service.ts; src/lib/import/duplicates.ts; src/lib/members/validation.ts; src/app/(app)/uvozi/page.tsx; src/app/(app)/uvozi/[id]/page.tsx; src/app/(app)/clani/[id]/page.tsx

## Matrika sledljivosti

| Oznaka | Funkcionalnost | TC-01 | TC-02 | TC-03 | TC-04 | TC-05 |
| --- | --- | --- | --- | --- | --- | --- |
| K-01 | Prijava seja in odjava | X | — | — | — | — |
| K-04 | Iskanje in filtriranje članov | — | X | — | — | — |
| K-05 | Podrobnosti člana | — | — | — | X | X |
| K-06 | Dodajanje in validacija člana | — | — | X | — | — |
| K-07 | Arhiviranje in obnovitev | — | — | — | X | — |
| K-08 | Uvoz Excela in podvojitve | — | — | — | — | X |
| K-09 | Poročilo uvoza | — | — | — | — | X |

## Uporabljena orodja UI

OpenAI Codex: podagent testni_primeri za začetne primere, glavni agent za pregled, dopolnitev ukaza, generiranje končnih primerov in pripravo oddaje. Drugih generativnih orodij pri tej nalogi nismo uporabili.
