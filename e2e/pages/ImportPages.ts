import { expect, type Page } from "@playwright/test";
import { HEADINGS, IMPORT_REPORT_COUNTERS, IMPORT_RESULT_COUNTERS } from "../support/texts";
import { TIMEOUT, readCounters, readTermDefinitions, rowByColumn, selectedOption, waitForHydration, clickWhenReady } from "../support/ui";

export type DuplicateRule = "SKIP" | "UPDATE" | "CREATE_NEW";

/** Čarovnik uvoza (/uvoz): izbira datoteke, preslikava, pravilo podvojitev, preverjanje in potrditev. */
export class ImportPage {
  get heading() {
    return this.page.getByRole("heading", { level: 1, name: HEADINGS.import });
  }
  get fileInput() {
    // Izbirnik datoteke je (vizualno skrito) vnosno polje z vlogo »button«.
    return this.page.getByRole("button", { name: /Izberite ali povlecite Excelovo datoteko/ });
  }
  get mappingHeading() {
    return this.page.getByRole("heading", { name: HEADINGS.importMapping });
  }
  get previewTable() {
    return this.page.getByRole("table").filter({ has: this.page.getByRole("columnheader", { name: "E mail" }) });
  }
  get duplicateRule() {
    return this.page.getByLabel("Podvojeni člani");
  }
  get validateButton() {
    return this.page.getByRole("button", { name: "Preveri vrstice" });
  }
  get resultHeading() {
    return this.page.getByRole("heading", { name: HEADINGS.importResult });
  }
  get resultTable() {
    return this.page.getByRole("table").filter({ has: this.page.getByRole("columnheader", { name: "Podrobnosti" }) });
  }
  get confirmButton() {
    return this.page.getByRole("button", { name: "Potrdi in uvozi" });
  }

  constructor(readonly page: Page) {}

  async waitUntilReady(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: TIMEOUT.page });
    await waitForHydration(this.fileInput);
  }

  async upload(filePath: string, fileName: string): Promise<void> {
    await this.waitUntilReady();
    await this.fileInput.setInputFiles(filePath);
    await expect(this.page.getByText(fileName, { exact: true })).toBeVisible({ timeout: TIMEOUT.page });
    await expect(this.mappingHeading).toBeVisible();
  }

  /** Spustni seznam preslikave za polje aplikacije (npr. »Opombe«); vrednost je naslov stolpca iz datoteke. */
  mappedColumn(field: string) {
    return selectedOption(this.page.getByRole("combobox", { name: field, exact: true }));
  }

  async chooseRule(rule: DuplicateRule): Promise<void> {
    await this.duplicateRule.selectOption(rule);
  }

  async validate(): Promise<void> {
    await clickWhenReady(this.validateButton);
    await expect(this.resultHeading).toBeVisible({ timeout: TIMEOUT.page });
  }

  async resultCounters(): Promise<Record<string, number>> {
    return readCounters(this.page.getByRole("main"), IMPORT_RESULT_COUNTERS);
  }

  /** Vrstica rezultata preverjanja za vrstico datoteke n. */
  resultRow(n: number) {
    return this.resultTable.getByRole("row").filter({ has: this.page.getByRole("cell", { name: String(n), exact: true }) });
  }

  async confirm(): Promise<void> {
    await clickWhenReady(this.confirmButton);
  }
}

/** Poročilo uvoza (/uvozi/<id>). */
export class ImportReportPage {
  get heading() {
    return this.page.getByRole("heading", { level: 1, name: HEADINGS.importReport });
  }
  get main() {
    return this.page.getByRole("main");
  }

  constructor(readonly page: Page) {}

  async waitUntilReady(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: TIMEOUT.page });
    await expect(this.page).toHaveURL(/\/uvozi\/[0-9a-f-]{36}$/);
  }

  async counters(): Promise<Record<string, number>> {
    return readCounters(this.main, IMPORT_REPORT_COUNTERS);
  }

  /** Pari »Delovni list«, »Administrator«, »Podvojeni« … */
  async details(): Promise<Record<string, string>> {
    return readTermDefinitions(this.main);
  }
}

/** Zgodovina uvozov (/uvozi). */
export class ImportHistoryPage {
  get heading() {
    return this.page.getByRole("heading", { level: 1, name: HEADINGS.importHistory });
  }
  get table() {
    return this.page.getByRole("main").getByRole("table");
  }

  constructor(readonly page: Page) {}

  async waitUntilReady(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: TIMEOUT.page });
  }

  /** Povezava na poročilo z danim naslovom (trajni ID poročila). */
  reportLink(reportPath: string) {
    return this.table.locator(`a[href="${reportPath}"]`);
  }

  entry(reportPath: string) {
    // Notranji lokator v »has« se išče znotraj vrstice, zato je zapisan relativno (page.locator), ne prek tabele.
    return this.table.getByRole("row").filter({ has: this.page.locator(`a[href="${reportPath}"]`) });
  }

  /** Vrednosti vnosa po naslovih stolpcev (Datoteka, Administrator, Uvoženo …). */
  async entryValues(reportPath: string): Promise<Record<string, string>> {
    return rowByColumn(this.table, this.entry(reportPath));
  }
}
