import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? process.env.INITIAL_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? process.env.INITIAL_ADMIN_PASSWORD;

async function login(page: import("@playwright/test").Page) {
  await page.goto("/prijava");
  await page.getByLabel("E-pošta").fill(adminEmail!);
  await page.getByLabel("Geslo", { exact: true }).fill(adminPassword!);
  await page.getByRole("button", { name: "Prijava" }).click();
  await expect(page.getByRole("heading", { name: "Nadzorna plošča" })).toBeVisible();
}

test("member list stays compact and filters return matching members", async ({ page }, testInfo) => {
  test.skip(!adminEmail || !adminPassword, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.");
  await login(page);
  await page.goto("/clani");

  const table = page.locator(".desktop-member-table");
  await expect(table).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Kontakt in naslov" })).toBeVisible();
  await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
  await expect(table.getByText("Drugo", { exact: true }).first()).toBeVisible();
  await expect(table.locator('a[href^="mailto:"]').first()).toBeVisible();

  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(desktopOverflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath("members-desktop.png"), fullPage: true });

  await page.locator("#filters-title").click();
  const municipality = page.getByLabel("Občina");
  const municipalityValue = await municipality.locator("option").nth(1).getAttribute("value");
  expect(municipalityValue).toBeTruthy();
  await municipality.selectOption(municipalityValue!);
  await Promise.all([
    page.waitForURL((url) => url.pathname === "/clani" && url.searchParams.get("municipality") === municipalityValue),
    page.getByRole("button", { name: "Uporabi filtre" }).click(),
  ]);
  await expect(page.getByText(/^0 rezultatov$/)).toHaveCount(0);
  await expect(table.locator("tbody tr").first()).toBeVisible();

  await page.goto("/clani/nov");
  const memberStatus = page.getByLabel("Status člana", { exact: false });
  await expect(memberStatus.locator("option")).toHaveText(["Pokojen", "Izstopil", "Drugo"]);
  await memberStatus.selectOption("DECEASED");
  await expect(page.getByLabel("Datum spremembe statusa")).toHaveValue(/^\d{4}-\d{2}-\d{2}$/);
  await expect(page.getByLabel("Opombe")).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/clani");
  await expect(page.locator(".desktop-member-table")).toBeHidden();
  const mobileList = page.locator(".mobile-member-list");
  await expect(mobileList).toBeVisible();
  await expect(mobileList.locator('a[href^="mailto:"]').first()).toBeVisible();
  const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(mobileOverflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath("members-mobile.png"), fullPage: true });
});
