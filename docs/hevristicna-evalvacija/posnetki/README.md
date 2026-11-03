# Posnetki za samostojno hevristično evalvacijo

Dejanski zajem lokalne šolske aplikacije 27. oktobra 2026. Datoteke S01–S08 so vključene v poročilo; S09 je dodatni mobilni posnetek. Uvoz in arhiviranje nista bila potrjena.

| Posnetek | Hevristika | Kako ponoviš zajem |
| --- | --- | --- |
| [S01 Seznam članov](S01-seznam-clanov.png) | H1, H7 | Prijavi se kot administrator in odpri `/clani`; zajemi meni in glavo tabele. |
| [S02 Aktivni filtri](S02-aktivni-filtri.png) | H6 | Odpri `/clani?fee=no&ageMin=60&ageMax=75` in zapri razdelek Filtri. Zajemi značke nad rezultati. |
| [S03 Obrazec člana](S03-obrazec-clana.png) | H2, H8 | Odpri `/clani/nov`; zajemi celoten obrazec, tudi VPO, opombe in gumba na koncu. |
| [S04 Napake obveznih polj](S04-napake-obveznih-polj.png) | H9 | Na `/clani/nov` pusti polja prazna in izberi Shrani. Zajemi opozorilo ter napaki pod imenom in priimkom. |
| [S05 Arhiviranje](S05-arhiviranje.png) | H4 | Odpri podrobnosti testnega člana in izberi Izbriši. Zajemi naslov in gumbe potrditvenega okna; nato izberi Prekliči. |
| [S06 Začetek uvoza](S06-zacetek-uvoza.png) | H10 | Odpri `/uvoz` pred izbiro datoteke. Zajemi naslov, izbor datoteke in razpoložljiva navodila. |
| [S07 Pred spremembo pravil](S07-uvoz-pred-spremembo.png) | H2, H5 | Izberi `public/examples/clani-vzorec.xlsx`, strategijo Posodobi ujemajoče člane in Preveri vrstice. Zajemi pravila in rezultat. |
| [S08 Po spremembi pravil](S08-uvoz-po-spremembi.png) | H5 | Brez ponovnega preverjanja spremeni strategijo v Preskoči podvojene. Zajemi novo izbiro in nespremenjeni rezultat; končnega uvoza ne potrebuješ. |
| [S09 Mobilni obrazec](S09-obrazec-na-telefonu.png) | H8 | Pri širini 390 pik odpri `/clani/nov`; zajemi začetni pogled obrazca. |

Za H3 preveri prehod: na `/clani/nov` vpiši testno opombo, odpri Člani in znova odpri Dodaj člana. Zabeleži, ali se pojavi opozorilo in ali je opomba ohranjena. Ena slika ne dokazuje odsotnosti opozorila.

Pri ponovnem zajemu ohrani dovolj konteksta, da so vidni naslov zaslona, sporni element in njegovo besedilo. Uporabi šolske testne podatke. Datoteka `preverjanje.json` vsebuje rezultate avtomatiziranega pregleda in čas zajema.
