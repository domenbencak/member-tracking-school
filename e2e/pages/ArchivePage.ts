import { expect, type Page } from "@playwright/test";
import { HEADINGS } from "../support/texts";
import { TIMEOUT, waitForHydration } from "../support/ui";

/** Arhiv članov (/clani/arhiv). Arhiv nima iskanja, člana poiščemo v tabeli po izkaznici. */
export class ArchivePage {
  get heading() {
    return this.page.getByRole("heading", { level: 1, name: HEADINGS.archive });
  }

  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/clani/arhiv");
    await expect(this.heading).toBeVisible({ timeout: TIMEOUT.page });
  }

  row(card: string) {
    return this.page.getByRole("main").getByRole("row").filter({ hasText: card });
  }

  async restore(card: string): Promise<void> {
    const button = this.row(card).getByRole("button", { name: "Obnovi" });
    await waitForHydration(button);
    await button.click();
  }
}
