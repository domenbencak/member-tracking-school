import fs from "node:fs";
import * as XLSX from "xlsx";
import { tc05 } from "./data/testni-podatki";
import { credentials, hasCredentials } from "./support/env";
import { expect, pagesFor, test, type Pages } from "./support/fixtures";
import { MESSAGES } from "./support/texts";

async function expectNoMember(app: Pages, card: string) {
  await app.members.searchFor(card);
  await app.members.expectResultCount(0);
  await expect(app.members.rows(card)).toHaveCount(0);
}

test("TC-05 Uvoz Excela s pravilom SKIP: nov član, podvojitev in neveljavna vrstica", async ({ page, context, app, runId }, testInfo) => {
  test.skip(!hasCredentials("admin"), "Nastavite INITIAL_ADMIN_EMAIL/INITIAL_ADMIN_PASSWORD (ali E2E_ADMIN_*).");
  test.setTimeout(180_000);
  const data = tc05(runId);
  const { cards } = data;
  const { members, memberDetail, importWizard, importReport, importHistory } = app;
  // Izvajalec uvoza (administrator) se bere iz okolja.
  const adminEmail = credentials("admin").email!;
  const filePath = testInfo.outputPath(data.file.name);
  let recorded: Record<string, string> = {};
  let reportUrl = "";

  await test.step("Predpogoj: administrator prek obrazca pripravi obstoječega člana (K-06)", async () => {
    await app.login.login("admin");
    await app.memberForm.create(data.existing);
  });

  await test.step(`Predpogoj: pripravi datoteko ${data.file.name} (list »${data.file.sheet}«, glava + 3 vrstice)`, async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([data.file.header, ...data.file.rows]), data.file.sheet);
    fs.writeFileSync(filePath, XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
    expect(fs.existsSync(filePath)).toBe(true);
  });

  await test.step("Korak 1: prijava kot ADMIN; na voljo je uvoz", async () => {
    // Prijava je bila izvedena v predpogoju (ista seja administratorja).
    await expect(app.shell.banner).toContainText("Administrator");
    await expect(app.shell.navLink("Uvoz podatkov")).toBeVisible();
  });

  await test.step(`Korak 2: poišči ${cards.new} in ${cards.invalid}; odpri podrobnosti ${cards.existing}`, async () => {
    await members.goto();
    await expectNoMember(app, cards.new);
    await expectNoMember(app, cards.invalid);
    await members.searchFor(cards.existing);
    await expect(members.rows(cards.existing)).toHaveCount(1);
    await members.openMember(cards.existing);
    recorded = await memberDetail.read();
    expect(recorded).toMatchObject({
      Ime: data.existing.firstName,
      Priimek: data.existing.surname,
      "Št. izkaznice": cards.existing,
      "E-pošta": data.existing.email,
      Občina: data.existing.municipality,
      Opombe: data.existing.notes,
    });
  });

  await test.step(`Korak 3: odpri uvoz in izberi ${data.file.name}`, async () => {
    await app.shell.navigateTo("Uvoz podatkov");
    await importWizard.upload(filePath, data.file.name);
    await expect(importWizard.previewTable.getByRole("row")).toHaveCount(4); // glava + 3 podatkovne vrstice
    for (const card of [cards.new, cards.existing.toLowerCase(), cards.invalid]) {
      await expect(importWizard.previewTable.getByRole("row").filter({ hasText: card })).toHaveCount(1);
    }
  });

  await test.step("Korak 4: preveri preslikavo šestih stolpcev", async () => {
    for (const [field, column] of Object.entries(data.mapping)) {
      await expect(importWizard.mappedColumn(field), `Polje ${field}`).toHaveText(column);
    }
  });

  await test.step("Korak 5: izberi pravilo SKIP in nadaljuj na pregled", async () => {
    await importWizard.chooseRule(data.rule);
    await importWizard.validate();
    expect(await importWizard.resultCounters()).toEqual(data.expectedValidation);
    // Vrstica 3: preskočena podvojitev obstoječega člana (aplikacija jo označi s kodo pravila SKIP).
    await expect(importWizard.resultRow(3)).toHaveCount(1);
    await expect(importWizard.resultRow(3)).toContainText(data.rule);
    await expect(importWizard.resultRow(3)).toContainText(`${data.existing.firstName} ${data.existing.surname}`);
    // Vrstica 4: neveljavna z opisom napake e-pošte.
    await expect(importWizard.resultRow(4)).toHaveCount(1);
    await expect(importWizard.resultRow(4)).toContainText(MESSAGES.invalidEmail);
    await expect(importWizard.confirmButton).toBeEnabled();
  });

  await test.step(`Korak 6: pred potrditvijo v drugem zavihku poišči ${cards.new}`, async () => {
    const importUrl = page.url();
    const second = await context.newPage();
    const { members: secondMembers } = pagesFor(second);
    await secondMembers.goto();
    await secondMembers.searchFor(cards.new);
    await secondMembers.expectResultCount(0);
    await second.close();
    // Zavihek z uvozom ni bil zapuščen ali osvežen.
    expect(page.url()).toBe(importUrl);
    await expect(importWizard.resultHeading).toBeVisible();
  });

  await test.step("Korak 7: potrdi uvoz", async () => {
    await importWizard.confirm();
    await importReport.waitUntilReady();
    reportUrl = page.url();
    expect(await importReport.counters()).toEqual(data.expectedReport);
  });

  await test.step(`Korak 8: poišči ${cards.new}`, async () => {
    await members.goto();
    await members.searchFor(cards.new);
    await members.expectResultCount(1);
    const row = members.rows(cards.new);
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(`${data.newMember.surname}, ${data.newMember.firstName}`);
    await expect(row).toContainText(data.newMember.municipality);
    await expect(row).toContainText(data.newMember.email);
  });

  await test.step(`Korak 9: poišči ${cards.existing} in odpri podrobnosti`, async () => {
    await members.searchFor(cards.existing);
    await members.expectResultCount(1);
    await members.openMember(cards.existing);
    const now = await memberDetail.read();
    for (const field of ["E-pošta", "Občina", "Opombe"]) expect(now[field], field).toBe(recorded[field]);
  });

  await test.step(`Korak 10: poišči ${cards.invalid}`, async () => {
    await members.goto();
    await expectNoMember(app, cards.invalid);
  });

  await test.step("Korak 11: odpri zgodovino uvozov in poročilo tega uvoza", async () => {
    await app.shell.navigateTo("Zgodovina uvozov");
    await importHistory.waitUntilReady();
    // Vnos tega uvoza prepoznamo po povezavi na poročilo (trajni ID), ker je datotek z istim imenom lahko več.
    const reportPath = new URL(reportUrl).pathname;
    await expect(importHistory.entry(reportPath)).toHaveCount(1);
    const entry = await importHistory.entryValues(reportPath);
    expect(entry.Datoteka).toContain(data.file.name);
    expect(entry.Datoteka).toContain(data.file.sheet);
    expect(entry.Administrator).toBe(adminEmail);
    expect({ Uvoženo: +entry.Uvoženo, Posodobljeno: +entry.Posodobljeno, Preskočeno: +entry.Preskočeno, Neveljavno: +entry.Neveljavno }).toEqual(
      data.expectedReport,
    );

    await importHistory.reportLink(reportPath).click();
    await expect(page).toHaveURL(reportUrl);
    await importReport.waitUntilReady();
    await expect(importReport.main).toContainText(data.file.name);
    expect(await importReport.counters()).toEqual(data.expectedReport);
    const details = await importReport.details();
    expect(details["Delovni list"]).toBe(data.file.sheet);
    expect(details.Administrator).toBe(adminEmail);
    // Vrstica 4 je navedena z napako e-pošte. Trditev ni vezana na trenutni prikaz v surovem JSON (N-03).
    await expect(importReport.main).toContainText(/vrstic\w*\s*4\b|"row":\s*4\b/i);
    await expect(importReport.main).toContainText(MESSAGES.invalidEmail);
  });
});
