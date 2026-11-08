import type { Page } from "@playwright/test";
import { waitForHydration, clickWhenReady } from "../support/ui";

/** Skupni deli vseh zaščitenih strani: glava in glavna navigacija. */
export class AppShell {
  get banner() {
    return this.page.getByRole("banner");
  }
  get navigation() {
    return this.page.getByRole("navigation", { name: "Glavna navigacija" });
  }
  get logoutButton() {
    return this.page.getByRole("button", { name: "Odjava" });
  }

  constructor(readonly page: Page) {}

  navLink(name: "Člani" | "Uvoz podatkov" | "Zgodovina uvozov" | "Arhiv članov") {
    return this.navigation.getByRole("link", { name });
  }

  async navigateTo(name: Parameters<AppShell["navLink"]>[0]): Promise<void> {
    await waitForHydration(this.navLink(name));
    await this.navLink(name).click();
  }

  /** Gumb »Odjava« deluje šele, ko ga React prevzame (npr. takoj po ponovnem nalaganju strani). */
  async logout(): Promise<void> {
    await clickWhenReady(this.logoutButton);
  }
}
