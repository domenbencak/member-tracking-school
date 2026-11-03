# Govor za približno tri minute

Šest glavnih diapozitivov, skupaj 180 sekund. Govorno besedilo vsebuje 341 besed. Sedmi diapozitiv z viri je dodaten. Časi so okvirni; med vajo prilagodi premore.

## 1 Hevristična evalvacija evidence članov
Čas 0.00–0.25, približno 25 sekund.

Predstavljam samostojno hevristično evalvacijo aplikacije za evidenco članov. Administrator ureja podatke in uvaža Excelove datoteke, uporabnik pa išče člane in pripravlja nalepke. Pregled po vseh desetih Nielsenovih hevristikah združuje izvorno kodo in preverjanje delujoče aplikacije s testnimi podatki. V nadaljevanju izpostavljam tri težave z največjim vplivom.

## 2 H5 Zastarel rezultat uvoza
Čas 0.25–0.55, približno 30 sekund.

Največji vpliv ima napaka pri uvozu. Levi posnetek kaže preverjanje, ki vrne deset posodobitev. Na desnem izbira že določa preskok dvojnikov, rezultat pa še vedno kaže deset posodobitev. Gumb za potrditev ostane omogočen. Uporabnik zato lahko potrdi nekaj drugega, kot pričakuje. Rešitev je razveljavitev starega rezultata in obvezno ponovno preverjanje po spremembi pravil. Preizkus ni izvedel končnega uvoza.

## 3 H3 Izguba neshranjenega vnosa
Čas 0.55–1.25, približno 30 sekund.

Druga težava je uporabnikov nadzor nad vnosom. Scenarij vključuje vpis opombe, odhod na seznam članov in ponovno odprtje obrazca. Aplikacija ne opozori na neshranjene spremembe, polje pa je ob vrnitvi prazno. Pri daljšem vnosu to pomeni ponavljanje dela. Pred odhodom naj zato ponudi nadaljevanje urejanja ali opustitev sprememb. Opozorilo naj se pojavi samo, kadar uporabnik dejansko spremeni podatke.

## 4 H9 Nerazumljiva sporočila o napakah
Čas 1.25–1.55, približno 30 sekund.

Tretja težava so sporočila o napakah. Po shranjevanju praznega obrazca se pri imenu in priimku pojavi angleško tehnično besedilo. Uporabniku ne pove neposredno, kaj mora popraviti. Namesto tega predlagam sporočili Ime je obvezno in Priimek je obvezen. Polji naj dobita tudi jasno oznako napake, fokus pa naj se prestavi na prvo neveljavno polje. Tako uporabnik hitreje nadaljuje delo.

## 5 Pregled vseh 10 hevristik
Čas 1.55–2.30, približno 35 sekund.

Tabela povzema vseh deset hevristik in izboljšavo za vsako. Tri predstavljene težave imajo resnost tri, ostalih sedem pa resnost dve. Med manjšimi ovirami izstopajo mešanje izrazov Izbriši in Arhiviraj, tehnične oznake pri uvozu ter filtri, ki ne pokažejo izbranih vrednosti. Predlagam še skupni izbor prejemnikov, skupine polj in vzorec Excela. Dobre rešitve so predogled uvoza, možnost preklica in ohranitev izbora za nalepke med stranmi.

## 6 Prednostne izboljšave
Čas 2.30–3.00, približno 30 sekund.

Najprej bi popravil uvoz, saj napačno pričakovanje lahko vpliva na več zapisov hkrati. Nato bi zavaroval neshranjeni vnos in popravil sporočila o napakah. Uspeh izboljšav preverim z istimi scenariji: sprememba pravil mora zahtevati novo preverjanje, odhod s spremenjenega obrazca mora zahtevati odločitev, prazni obvezni polji pa morata dobiti slovenski napaki. Preostale izboljšave sledijo glede na pogostost uporabe.
