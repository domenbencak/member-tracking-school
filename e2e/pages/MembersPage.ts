import { expect, type Page } from "@playwright/test";
import { HEADINGS } from "../support/texts";
import { TIMEOUT, selectedOption, waitForHydration, clickWhenReady } from "../support/ui";

/** Seznam članov (/clani): iskanje, filtri, tabela zadetkov. */
export class MembersPage {
  get heading() {
    return this.page.getByRole("heading", { level: 1, name: HEADINGS.members });
  }
  get search() {
    return this.page.getByRole("searchbox", { name: "Iskanje članov" });
  }
  get addMemberLink() {
    return this.page.getByRole("link", { name: "Dodaj člana" });
  }
  get table() {
    return this.page.getByRole("main").getByRole("table");
  }
  get filters() {
    return this.page.getByRole("region", { name: "Filtri" });
  }
  get municipality() {
    return this.filters.getByRole("combobox", { name: "Občina" });
  }
  get fee() {
    return this.filters.getByRole("combobox", { name: "Plačilo članarine" });
  }
  get applyFiltersButton() {
    return this.filters.getByRole("button", { name: "Uporabi filtre" });
  }
  get clearFiltersLink() {
    return this.filters.getByRole("link", { name: "Počisti filtre" });
  }

  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/clani");
    await this.waitUntilReady();
  }

  async waitUntilReady(): Promise<void> {
    await waitForHydration(this.search);
  }

  /** Vrstice tabele, ki vsebujejo besedilo (npr. številko izkaznice). */
  rows(text?: string) {
    const rows = this.table.getByRole("row");
    return text ? rows.filter({ hasText: text }) : rows;
  }

  /** Število zadetkov, ki ga aplikacija izpiše nad seznamom (»N rezultatov«). */
  resultCount(n: number) {
    return this.page.getByRole("main").getByText(new RegExp(`^${n} rezultat`));
  }

  async expectResultCount(n: number): Promise<void> {
    await expect(this.resultCount(n)).toBeVisible({ timeout: TIMEOUT.list });
  }

  /** Vnese iskalni niz in počaka, da se zapiše v naslov (seznam se osveži). */
  async searchFor(query: string): Promise<void> {
    if (!/\/clani(\?|$)/.test(this.page.url())) await this.goto();
    await this.waitUntilReady();
    await this.search.fill(query);
    await expect(this.page).toHaveURL((url) => url.pathname === "/clani" && url.searchParams.get("q") === query, {
      timeout: TIMEOUT.list,
    });
  }

  async expandFilters(): Promise<void> {
    if (!(await this.municipality.isVisible())) {
      await this.filters.getByText("Filtri", { exact: true }).click();
    }
    await waitForHydration(this.municipality);
  }

  async setFilters(values: { municipality?: string; fee?: string }): Promise<void> {
    await this.expandFilters();
    if (values.municipality !== undefined) await this.municipality.selectOption({ label: values.municipality });
    if (values.fee !== undefined) await this.fee.selectOption({ label: values.fee });
  }

  async applyFilters(): Promise<void> {
    await clickWhenReady(this.applyFiltersButton);
  }

  async clearFilters(): Promise<void> {
    await this.clearFiltersLink.click();
  }

  selectedMunicipality() {
    return selectedOption(this.municipality);
  }

  selectedFee() {
    return selectedOption(this.fee);
  }

  /** Odpre podrobnosti člana iz vrstice z dano izkaznico. */
  async openMember(card: string): Promise<void> {
    await this.rows(card).getByRole("link", { name: "Odpri" }).click();
    await expect(this.page).toHaveURL(/\/clani\/[0-9a-f-]{36}$/, { timeout: TIMEOUT.page });
  }
}
