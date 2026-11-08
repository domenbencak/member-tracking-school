import { expect, type Page } from "@playwright/test";
import { HEADINGS } from "../support/texts";
import { TIMEOUT, selectedOption, waitForHydration, clickWhenReady } from "../support/ui";

export type FeePaid = "Da" | "Ne" | "Ni podatka";

/** Podatki člana, kot jih vnesemo v obrazec (imena polj ustrezajo testnim podatkom testnih primerov). */
export type MemberInput = {
  card?: string;
  firstName: string;
  surname: string;
  email?: string;
  street?: string;
  postalCode?: string;
  postOffice?: string;
  municipality?: string;
  feePaid?: FeePaid;
  notes?: string;
};

/** Obrazec »Dodaj člana« (/clani/nov). */
export class MemberFormPage {
  get heading() {
    return this.page.getByRole("heading", { level: 1, name: HEADINGS.newMember });
  }
  get card() {
    return this.page.getByLabel("Št. izkaznice");
  }
  get surname() {
    return this.page.getByLabel("Priimek *");
  }
  get firstName() {
    return this.page.getByLabel("Ime *");
  }
  get street() {
    return this.page.getByLabel("Ulica");
  }
  get postalCode() {
    return this.page.getByLabel("Poštna številka", { exact: true });
  }
  get postOffice() {
    return this.page.getByLabel("Pošta", { exact: true });
  }
  get email() {
    return this.page.getByLabel("E-pošta");
  }
  get municipality() {
    return this.page.getByLabel("Občina");
  }
  get feePaid() {
    return this.page.getByLabel("Plačilo članarine");
  }
  get notes() {
    return this.page.getByLabel("Opombe");
  }
  get saveButton() {
    return this.page.getByRole("button", { name: "Shrani" });
  }
  get cancelLink() {
    return this.page.getByRole("link", { name: "Prekliči" });
  }

  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/clani/nov");
    await this.waitUntilReady();
  }

  async waitUntilReady(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: TIMEOUT.page });
    await waitForHydration(this.saveButton);
  }

  async fill(m: MemberInput): Promise<void> {
    await this.waitUntilReady();
    if (m.card !== undefined) await this.card.fill(m.card);
    await this.surname.fill(m.surname);
    await this.firstName.fill(m.firstName);
    if (m.street !== undefined) await this.street.fill(m.street);
    if (m.postalCode !== undefined) await this.postalCode.fill(m.postalCode);
    if (m.postOffice !== undefined) await this.postOffice.fill(m.postOffice);
    if (m.email !== undefined) await this.email.fill(m.email);
    if (m.municipality !== undefined) await this.municipality.fill(m.municipality);
    if (m.feePaid !== undefined) await this.feePaid.selectOption({ label: m.feePaid });
    if (m.notes !== undefined) await this.notes.fill(m.notes);
  }

  /** Preveri, da so v obrazcu vnesene dane vrednosti. */
  async expectValues(m: MemberInput): Promise<void> {
    const pairs = [
      [this.card, m.card],
      [this.firstName, m.firstName],
      [this.surname, m.surname],
      [this.email, m.email],
      [this.street, m.street],
      [this.postalCode, m.postalCode],
      [this.postOffice, m.postOffice],
      [this.municipality, m.municipality],
      [this.notes, m.notes],
    ] as const;
    for (const [field, value] of pairs) {
      if (value !== undefined) await expect(field).toHaveValue(value);
    }
    if (m.feePaid !== undefined) await expect(selectedOption(this.feePaid)).toHaveText(m.feePaid);
  }

  async save(): Promise<void> {
    await clickWhenReady(this.saveButton);
  }

  /**
   * Sporočilo o napaki ob polju. Polje nima aria-describedby, zato je vsebnik polja izbran s CSS razredom »field«
   * (edino mesto v testih, kjer je uporabljen CSS).
   */
  fieldError(field: "E-pošta") {
    return this.page.locator(".field").filter({ has: this.page.getByLabel(field) }).getByRole("alert");
  }

  /** Priprava člana (predpogoj): izpolni, shrani in vrne URL strani podrobnosti. */
  async create(m: MemberInput): Promise<string> {
    await this.goto();
    await this.fill(m);
    await this.save();
    await expect(this.page).toHaveURL(/\/clani\/[0-9a-f-]{36}$/, { timeout: TIMEOUT.page });
    await expect(this.page.getByRole("heading", { level: 1, name: `${m.firstName} ${m.surname}` })).toBeVisible();
    return this.page.url();
  }
}
