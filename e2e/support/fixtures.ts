import { test as base, type Browser, type Page } from "@playwright/test";
import { AppShell } from "../pages/AppShell";
import { ArchivePage } from "../pages/ArchivePage";
import { ImportHistoryPage, ImportPage, ImportReportPage } from "../pages/ImportPages";
import { LoginPage } from "../pages/LoginPage";
import { MemberDetailPage } from "../pages/MemberDetailPage";
import { MemberFormPage } from "../pages/MemberFormPage";
import { MembersPage } from "../pages/MembersPage";
import { makeRunId } from "./env";

/** Vsi objekti strani za eno stran brskalnika. */
export function pagesFor(page: Page) {
  return {
    login: new LoginPage(page),
    shell: new AppShell(page),
    members: new MembersPage(page),
    memberForm: new MemberFormPage(page),
    memberDetail: new MemberDetailPage(page),
    archive: new ArchivePage(page),
    importWizard: new ImportPage(page),
    importReport: new ImportReportPage(page),
    importHistory: new ImportHistoryPage(page),
  };
}

export type Pages = ReturnType<typeof pagesFor>;

/**
 * Predpogoj, ki ga pripravi administrator v ločenem kontekstu brskalnika, da seja testirane vloge ostane nedotaknjena.
 */
export async function asAdmin(browser: Browser, fn: (pages: Pages) => Promise<void>): Promise<void> {
  const context = await browser.newContext();
  try {
    const pages = pagesFor(await context.newPage());
    await pages.login.login("admin");
    await fn(pages);
  } finally {
    await context.close();
  }
}

/** Razširjen »test« z objekti strani in pripono zagona. */
export const test = base.extend<{ app: Pages; runId: string }>({
  app: async ({ page }, provide) => {
    await provide(pagesFor(page));
  },
  runId: async ({}, provide) => {
    await provide(makeRunId());
  },
});

export { expect } from "@playwright/test";
