# Ukaz agentu UI – avtomatizacija funkcionalnih testnih primerov

Deluj kot inženir za avtomatizacijo testiranja. Za projekt Evidenca članov – šolska različica (Next.js, TypeScript) z ogrodjem **Playwright Test** (že nameščeno, `@playwright/test` 1.62) avtomatiziraj natanko pet ročnih testnih primerov TC-01 do TC-05 iz datoteke `testni_primeri_koncni.md`. To so testni primeri iz 2. naloge s popravki, ki jih je ob pregledu vnesla druga ekipa.

## Vir pričakovanega delovanja
- Pričakovani rezultati izhajajo **izključno iz testnih primerov**. Vsak korak testnega primera mora imeti v skripti svoje dejanje in preverjanje (`expect`), ki ustreza stolpcu »Pričakovani rezultat«. Ne preverjaj le, da se je stran naložila.
- **Izvorne kode aplikacije (`src/`, `prisma/`) ne beri.** Napise gumbov, polj in povezav poišči z raziskovanjem delujoče aplikacije (Playwright `ariaSnapshot()` ali `page.accessibility`) in iz obstoječih testov v `e2e/`. Če aplikacija dela drugače od testnega primera, skripte ne prilagodi aplikaciji: test mora pasti, razhajanje pa zapiši v povzetek.
- Kjer testni primer navaja predpostavko, preveri vedenje, ki ga opisuje pričakovani rezultat. Ko točnega besedila ni, uporabi najbližje preverljivo dejstvo (npr. sporočilo ob polju E-pošta je vidno).

## Zahteve za skripte
1. Ena datoteka na testni primer: `e2e/tc01-prijava-odjava.spec.ts`, `e2e/tc02-iskanje-filtri.spec.ts`, `e2e/tc03-neveljavna-eposta.spec.ts`, `e2e/tc04-arhiv-obnovitev.spec.ts`, `e2e/tc05-uvoz-skip.spec.ts`. Skupne pomožne funkcije (prijava, priprava člana) daj v `e2e/helpers.ts`.
2. Naslov testa naj vsebuje ID (npr. `TC-02 …`). Vsak korak testnega primera zapiši kot `test.step("Korak N: …")`, predpogoje kot `test.step("Predpogoj: …")`.
3. **Predpogoji in testni podatki**: vsak test sam pripravi vse podatke prek uporabniškega vmesnika (kot administrator), z vrednostmi iz testnega primera. Ker baza med zagoni ostane, dodaj vrednostim, ki morajo biti enolične (izkaznice, e-pošte, iskalni niz), pripono zagona, npr. `TC02-<runId>-A`; iskalni niz v TC-02 je potem `TC02-<runId>-`. Vse prilagoditve podatkov na kratko komentiraj v kodi.
4. **Robustnost**: lokatorji po vlogi, oznaki ali besedilu (`getByRole`, `getByLabel`, `getByText`); CSS ali `nth()` le, ko drugače ne gre. Brez `waitForTimeout` in fiksnih pavz; uporabi samodejno čakanje in spletne trditve (`await expect(...).toBeVisible()`, `toHaveURL`, `toHaveCount`). Testi morajo biti neodvisni in uspešni v poljubnem vrstnem redu in ob ponovnem zagonu.
5. TC-05: datoteko `tc05-skip-v1.xlsx` (en list, glava v 1. vrstici, tri podatkovne vrstice, stolpci iz testnega primera, vključno z Opombe) ustvari v testu s knjižnico `xlsx` (že nameščena) v `testInfo.outputPath()`. Korak 6 (drugi zavihek) izvedi z novo stranjo v istem kontekstu (`context.newPage()`), stran z uvozom pa pusti odprto.
6. TC-04, korak 8: sistemskega časa »Posodobljeno« ne primerjaj; primerjaj URL, ID in vse ostale prikazane podatke člana.
7. Poverilnice beri iz okolja kot obstoječi testi (`INITIAL_ADMIN_EMAIL`/`INITIAL_ADMIN_PASSWORD`, `SAMPLE_USER_EMAIL`/`SAMPLE_USER_PASSWORD`, z možnostjo `E2E_*`). Nikoli jih ne zapiši v kodo.
8. Ne spreminjaj aplikacije, obstoječih testov, `package.json` ali `playwright.config.ts`.

## Izhod
- Datoteke testov v `e2e/`.
- Zaženi jih in jih popravljaj, dokler niso izvedljive; neuspešne smejo ostati samo zaradi dejanskega razhajanja z aplikacijo.
- Kratek povzetek: za vsak TC tabela *korak testnega primera → `test.step` → trditev*, rezultat zagona in morebitna razhajanja.
