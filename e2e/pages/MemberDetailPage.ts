import { expect, type Page } from "@playwright/test";
import { MESSAGES } from "../support/texts";
import { readTermDefinitions, waitForHydration, clickWhenReady } from "../support/ui";

/** Podrobnosti člana (/clani/<id>) in okno za arhiviranje. */
export class MemberDetailPage {
  get archiveButton() {
    return this.page.getByRole("button", { name: "Izbriši" });
  }
  get archiveDialog() {
    return this.page.getByRole("alertdialog", { name: "Arhiviraj člana" });
  }
  get archiveFullName() {
    return this.archiveDialog.getByLabel("Polno ime");
  }
  get archiveConfirm() {
    return this.archiveDialog.getByRole("button", { name: "Potrdi brisanje" });
  }

  constructor(readonly page: Page) {}

  heading(fullName: string) {
    return this.page.getByRole("heading", { level: 1, name: fullName });
  }

  /** Vsi prikazani pari »oznaka – vrednost« (Ime, Priimek, E-pošta, ID …). */
  async read(): Promise<Record<string, string>> {
    return readTermDefinitions(this.page.getByRole("main"));
  }

  async openArchiveDialog(): Promise<void> {
    await waitForHydration(this.archiveButton);
    await this.archiveButton.click();
    await expect(this.archiveDialog).toBeVisible();
  }

  async confirmArchive(fullName: string): Promise<void> {
    await this.archiveFullName.fill(fullName);
    await expect(this.archiveConfirm).toBeEnabled();
    await clickWhenReady(this.archiveConfirm);
    await expect(this.page.getByText(MESSAGES.archived)).toBeVisible();
  }
}
