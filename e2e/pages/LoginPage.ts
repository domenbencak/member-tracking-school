import { expect, type Page } from "@playwright/test";
import { credentials, type Role } from "../support/env";
import { HEADINGS } from "../support/texts";
import { TIMEOUT, waitForHydration } from "../support/ui";

export class LoginPage {
  get email() {
    return this.page.getByLabel("E-pošta");
  }
  get password() {
    return this.page.getByLabel("Geslo", { exact: true });
  }
  get submit() {
    return this.page.getByRole("button", { name: "Prijava" });
  }

  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/prijava");
    await this.waitUntilReady();
  }

  /** Obrazec je uporaben šele, ko ga React prevzame (glej waitForHydration). */
  async waitUntilReady(): Promise<void> {
    await waitForHydration(this.submit);
  }

  async fillAndSubmit(email: string, password: string): Promise<void> {
    await this.waitUntilReady();
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }

  /** Prijava z vlogo iz okolja; uspeh = prikazana nadzorna plošča. */
  async login(role: Role): Promise<void> {
    const { email, password } = credentials(role);
    await this.goto();
    await this.fillAndSubmit(email!, password!);
    await expect(this.page.getByRole("heading", { name: HEADINGS.dashboard })).toBeVisible({ timeout: TIMEOUT.page });
  }
}
