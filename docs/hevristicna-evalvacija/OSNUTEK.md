# Hevristična evalvacija evidence članov

Member Tracking School Edition · strokovni osnutek · 23. oktober 2026

## Namen in obseg

Pregled obravnava uporabnost slovenske aplikacije za evidenco članov po vseh desetih Nielsenovih hevristikah. Glavne prednosti so slovenska poimenovanja, označena obvezna polja, predogled uvoza in možnost obnovitve arhiviranih članov. Prednostno je treba obravnavati zastarel rezultat preverjanja uvoza, varovanje neshranjenega vnosa in razumljivost napak.

**Podlaga pregleda:** izvorna koda različice `036a084` in lokalno preverjanje validacije praznega imena in priimka. To je strokovni osnutek, pripravljen s pomočjo Codexa, ne zapis dveh neodvisnih študentskih opazovanj. Interakcije, prikaz na različnih zaslonih in odzivi delujočega sistema niso bili preizkušeni. Resnosti so predhodne ocene za razpravo.

**Uporabniki:** administrator, ki ureja evidenco in uvaža člane, ter običajni uporabnik, ki išče člane in pripravlja nalepke. **Predvidene naprave za dopolnitev:** namizni računalnik in telefon. **Scenariji:** prijava, iskanje in filtriranje, dodajanje in urejanje člana, arhiviranje in obnova, preverjanje Excelovega uvoza ter izbor prejemnikov in tisk nalepk.

## Postopek za člana para

Vsak član naj najprej zase izpolni vseh deset postavk v predlogi `predloga-za-par.docx`. Pred koncem svoje analize naj ne bere ugotovitev drugega člana ali nadaljevanja tega osnutka. Pri vsaki težavi zapiše lokacijo, sprožilec, posledico in izboljšavo; če težave ne najde, navede ustrezno delovanje in kaj je preveril. Dodata dejanske posnetke zaslona ali opis ponovljivih korakov.

Po obeh pregledih naj ugotovitve primerjata, združita podvojene težave ter ohranita razlike v ocenah. Skupni sklep in prioritete v predlogi izpolnita šele nato. Gradivo sledi razporeditvi težav in priporočil iz delovnega zvezka NN/g [V1, V2].

## Lestvica resnosti

0 pomeni, da težave ni; 1 je kozmetična težava; 2 manjša ovira; 3 večja ovira z visoko prednostjo odprave; 4 kritična ovira pred uporabo sistema. Pri oceni upoštevamo pričakovano pogostost, vpliv in ponavljanje težave [V3]. Ocena ni enaka oceni študijske naloge.

**Oddaja:** združen dokument obeh članov do torka, 27. oktobra 2026, ob 17.00. Predstavitev na vajah traja tri minute.

<!-- pagebreak -->

## H1 Vidnost stanja sistema

**Ocena: delno ustrezno · resnost 2.** Dobro: shranjevanje kaže »Shranjujem …«, iskanje prikazuje dejavnost, seznam pa število rezultatov.

**Težava:** povezave glavne navigacije nimajo oznake trenutne strani. Vse dobijo isti razred; slog razlikuje le prehod kazalca in fokus. Uporabnik na podstrani težje prepozna, kateremu razdelku pripada.

**Izboljšava:** trenutni razdelek trajno poudariti in označiti z `aria-current="page"`; na podstraneh prikazati pot, npr. »Člani / Podrobnosti / Urejanje«.

**Podlaga in preverjanje:** `src/components/app-shell.tsx`, `src/app/globals.css`. Odpreti seznam in nato urejanje člana ter preveriti označbo razdelka tudi brez kazalca nad menijem.

## H2 Ujemanje sistema z resničnim svetom

**Ocena: delno ustrezno · resnost 2.** Dobro: pojmi »Članarina«, »Izkaznica« in »Pododbor« sledijo vsebini evidence.

**Težava:** rezultat preverjanja uvoza izpiše interno vrednost dejanja, npr. `UPDATE` ali `SKIP`. Končno poročilo neposredno izpiše strategijo, npr. `CREATE_NEW`. Polje »VPO« nima razlage. Za novega uporabnika pomen teh oznak ni nujno razviden.

**Izboljšava:** dejanja prevesti v »Posodobitev«, »Preskok« in »Nov zapis«, strategije opisati z istimi besedami kot v izbiri pravil. Kratico VPO pojasniti z izrazom, ki ga potrdi domenski uporabnik, in dodati primer vnosa.

**Podlaga in preverjanje:** `src/components/import-wizard.tsx`, `src/app/(app)/uvozi/[id]/page.tsx`, `src/components/member-form.tsx`. Preveriti uvoz z dvojnikom in razumevanje oznak pri novem uporabniku.

## H3 Uporabnikov nadzor in svoboda

**Ocena: delno ustrezno · resnost 3.** Dobro: obrazec ponuja »Prekliči«, arhivirane člane pa je mogoče obnoviti.

**Težava:** obrazec člana nima zaznavanja spremenjenih podatkov ali opozorila ob odhodu. Povezava »Prekliči« in navigacija omogočata zapustitev urejanja brez potrditve. Daljši neshranjen vnos se lahko izgubi.

**Izboljšava:** spremljati spremembe in pred odhodom ponuditi »Nadaljuj urejanje« ali »Zavrzi spremembe«. Po potrebi ohraniti začasni osnutek. Opozorilo prikazati samo pri dejansko spremenjenem vnosu.

**Podlaga in preverjanje:** `src/components/member-form.tsx`; v pregledani kodi ni varovanja neshranjenih sprememb. V obrazec vnesti opombo in odpreti drug razdelek; preveriti tudi gumb Nazaj in osvežitev strani.

<!-- pagebreak -->

## H4 Doslednost in standardi

**Ocena: delno ustrezno · resnost 2.** Dobro: aplikacija uporablja skupne gradnike gumbov in obrazcev.

**Težava:** isto dejanje ima oznake »Izbriši«, »Arhiviraj člana«, »Potrdi brisanje« in nato »Član je arhiviran«. Uporabnik ne more iz poimenovanja zanesljivo sklepati, ali je poseg trajen in ali ga lahko razveljavi.

**Izboljšava:** povsod uporabiti »Arhiviraj« in »Potrdi arhiviranje« ter po dejanju ponuditi povezavo v arhiv. Izraz »Izbriši« rezervirati za dejansko trajno odstranitev.

**Podlaga in preverjanje:** `src/components/member-delete-button.tsx`, `src/lib/members/actions.ts`. Odpreti potrditveno okno in ga preklicati; primerjati besedilo z arhivom in obvestilom po dejanju na testnem članu.

## H5 Preprečevanje napak

**Ocena: neustrezno v opisanem toku · resnost 3.** Dobro: uvoz ima predogled, zaznavanje dvojnikov in ločen korak potrditve.

**Težava:** po »Preveri vrstice« sprememba preslikave, strategije dvojnikov ali dovoljenja za poštna opozorila ne razveljavi rezultata `report`. »Potrdi in uvozi« še vedno potrjuje prej preverjeni osnutek. Uporabnik lahko pričakuje novo izbrana pravila, potrdi pa stare podatke in pravila.

**Izboljšava:** ob vsaki taki spremembi razveljaviti rezultat in onemogočiti potrditev do ponovnega preverjanja. Ob potrditvi prikazati povzetek pravil, vezan na preverjeni osnutek.

**Podlaga in preverjanje:** `src/components/import-wizard.tsx`, `src/lib/import/service.ts`. Z dvojniki izvesti preverjanje pri »Preskoči podvojene«, nato izbrati posodobitev. Potrditev mora zahtevati novo preverjanje. Gre za sklep iz kode; tok še ni interaktivno potrjen.

## H6 Prepoznavanje namesto pomnjenja

**Ocena: delno ustrezno · resnost 2.** Dobro: filtri imajo stalne oznake in prikažejo seznam aktivnih pogojev.

**Težava:** značke nekaterih aktivnih filtrov kažejo samo »Status«, »Članarina« ali »Starost«, brez izbrane vrednosti. Pri starostnem razponu se lahko pojavita dve enaki znački »Starost«. Po zaprtju filtrov mora uporabnik pogoje pomniti ali jih znova odpreti.

**Izboljšava:** prikazati »Članarina: Ne«, »Status: Izstopil« in »Starost: 60–75 let«. Omogočiti odstranitev posameznega pogoja neposredno na znački.

**Podlaga in preverjanje:** `src/components/member-filters.tsx`. Nastaviti članarino in obe meji starosti, zapreti filtre ter preveriti, ali značke same pojasnijo uporabljene pogoje.

<!-- pagebreak -->

## H7 Prilagodljivost in učinkovitost uporabe

**Ocena: delno ustrezno · resnost 2.** Dobro: iskanje se sproži samodejno, izbor za nalepke pa se ohranja med stranmi.

**Težava:** prejemnike je mogoče označevati samo posamično. V glavi tabele ni možnosti »Izberi vse na strani«, prav tako ni skupnega čiščenja izbora. Pri več deset prejemnikih je potrebnih veliko ponovitev.

**Izboljšava:** dodati »Izberi vse na strani« in »Počisti izbor«, oboje z jasnim obsegom. Ohraniti števec izbranih članov in upoštevati omejitev 140 prejemnikov.

**Podlaga in preverjanje:** `src/components/member-results.tsx`. Preveriti izbor 25 prejemnikov in njegovo čiščenje; ločeno preveriti ohranitev izbora ob menjavi strani.

## H8 Estetsko in minimalistično oblikovanje

**Ocena: delno ustrezno · resnost 2.** Dobro: aplikacija uporablja omejeno barvno paleto; podrobnosti člana so razdeljene v vsebinske skupine.

**Težava:** obrazec za dodajanje oziroma urejanje predstavlja osebne, naslovne, organizacijske in članske podatke v eni mreži brez naslovov skupin. Na telefonu se polja razporedijo v en dolg stolpec. Struktura lahko oteži hitro iskanje želenega polja; dejanski vizualni učinek je treba še preveriti.

**Izboljšava:** polja smiselno združiti v razdelke »Osebni podatki«, »Kontakt in naslov« ter »Članstvo«. Manj pogosto uporabljena dodatna polja po potrebi postopno razkriti.

**Podlaga in preverjanje:** `src/components/member-form.tsx`, `src/app/globals.css`. Na namizju in telefonu preveriti iskanje polja za pododbor in vračanje na polje z napako.

## H9 Prepoznavanje in odpravljanje napak

**Ocena: neustrezno pri praznih obveznih poljih · resnost 3.** Dobro: obrazec vrne splošno opozorilo in napake ob posameznih poljih.

**Težava:** lokalni klic validatorja s praznim imenom in priimkom vrne »Invalid input: expected string, received null«. Pretvorba praznega vnosa v `null` sproži privzeto napako tipa pred predvidenim slovenskim besedilom. Polja nimajo povezave z napako prek `aria-describedby` ali oznake `aria-invalid`; fokus se ne prenese na prvo napako.

**Izboljšava:** za prazni vrednosti vrniti »Ime je obvezno« in »Priimek je obvezen«. Napake povezati s polji, jih vidno označiti in usmeriti fokus na prvo neveljavno polje.

**Podlaga in preverjanje:** `src/lib/members/validation.ts`, `src/lib/action-state.ts`, `src/components/member-form.tsx`. Validator je bil preverjen; prikaz napak po oddaji praznega obrazca je treba še potrditi v vmesniku.

## H10 Pomoč in dokumentacija

**Ocena: delno ustrezno · resnost 2.** Dobro: priprava nalepk vsebuje navodila za izbor in nastavitve tiskanja.

**Težava:** v navigaciji ni pomoči. Začetni zaslon uvoza ne ponuja povezave do vzorčne datoteke ali kratkih navodil za stolpce in dvojnike, čeprav vzorec v projektu obstaja. Uporabnik mora strukturo datoteke ugibati ali jo poiskati zunaj aplikacije.

**Izboljšava:** na strani uvoza ponuditi »Prenesi vzorec Excel« in kratka navodila ob preslikavi ter pravilih dvojnikov. Dodati dostopno pomoč za pogoste naloge.

**Podlaga in preverjanje:** `src/app/(app)/uvoz/page.tsx`, `src/components/import-wizard.tsx`, `public/examples/clani-vzorec.xlsx`. Preveriti, ali nov uporabnik brez razvijalske dokumentacije pripravi prvo datoteko.

<!-- pagebreak -->

## Predlog prednostnih izboljšav

**Najprej H5:** sprememba pravil mora zahtevati novo preverjanje uvoza. Posledica napačnega pričakovanja lahko zajame več zapisov. Uspeh: nobene potrditve zastarelega rezultata po spremembi nastavitev.

**Nato H3 in H9:** zavarovati neshranjene spremembe ter zagotoviti slovenska, dostopna sporočila o napakah. Uspeh: odhod s spremenjenega obrazca zahteva odločitev, prazni obvezni polji pa dobita konkretni slovenski napaki.

**Naslednje izboljšave:** poenotiti arhiviranje (H4), prevesti oznake uvoza (H2), izpisati vrednosti filtrov (H6), označiti trenutno stran (H1), poenostaviti izbor nalepk (H7), urediti skupine obrazca (H8) in pomoč (H10). To je predlog na podlagi enega pregleda, ki ga člana primerjata s svojimi ugotovitvami.

## Okvir triminutne predstavitve

**0.00–0.25:** predstavita aplikacijo, uporabnike, obseg in postopek dveh ločenih pregledov. Povejta samo, kar sta dejansko izvedla.

**0.25–1.55:** pokažita tri najpomembnejše potrjene težave. Za vsako namenita približno 30 sekund: zaslon ali sprožilec, posledica in izboljšava. Kandidati iz osnutka so H5, H3 in H9.

**1.55–2.30:** povzemita preostale hevristike in dobre rešitve. Pokažita, kje sta se neodvisni oceni ujemali in kje razlikovali.

**2.30–3.00:** predstavita dogovorjene prioritete in kako bi preverila izboljšave. Časovnica je predloga, ne trditev o že izvedenem delu para.

## Viri

**V1:** Moran, K., in Gordon, K. (2023). How to Conduct a Heuristic Evaluation. NN/g. https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/

**V2:** Nielsen Norman Group. Heuristic Evaluation Workbook. Predloga za zapis težav in priporočil po vseh desetih hevristikah. https://media.nngroup.com/media/articles/attachments/Heuristic_Evaluation_Workbook_1_Fillable.pdf

**V3:** Nielsen, J. (1994). Severity Ratings for Usability Problems. NN/g. https://www.nngroup.com/articles/how-to-rate-the-severity-of-usability-problems/

**V4:** Nielsen, J. 10 Usability Heuristics for User Interface Design. NN/g, pregledana spletna različica. https://www.nngroup.com/articles/ten-usability-heuristics/

**Projektni dokazi:** datoteke ob posameznih postavkah H1–H10; repozitorij Member Tracking School Edition, različica `036a084`. Spletni viri pregledani 23. oktobra 2026.
