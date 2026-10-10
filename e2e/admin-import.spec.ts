import { expect, test } from "@playwright/test";
import path from "node:path";

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? process.env.INITIAL_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? process.env.INITIAL_ADMIN_PASSWORD;
const userEmail = process.env.E2E_USER_EMAIL ?? process.env.SAMPLE_USER_EMAIL;
const userPassword = process.env.E2E_USER_PASSWORD ?? process.env.SAMPLE_USER_PASSWORD;

async function login(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/prijava");
  await page.getByLabel("E-pošta").fill(email);
  await page.getByLabel("Geslo", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Prijava" }).click();
  await expect(page.getByRole("heading", { name: "Nadzorna plošča" })).toBeVisible();
}

test("administrator imports, edits, and previews a member label", async ({ page }, testInfo) => {
  test.skip(!adminEmail || !adminPassword, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD.");
  await login(page, adminEmail!, adminPassword!);
  await page.goto("/uvoz");
  await page.locator('input[type="file"]').setInputFiles(path.resolve("public/examples/clani-vzorec.xlsx"));
  await expect(page.getByRole("heading", { name: "2. Delovni list in preslikava" })).toBeVisible();
  await page.getByLabel("Podvojeni člani").selectOption("CREATE_NEW");
  await page.getByRole("button", { name: "Preveri vrstice" }).click();
  await expect(page.getByRole("heading", { name: "5. Rezultat preverjanja" })).toBeVisible();
  await page.getByRole("button", { name: "Potrdi in uvozi" }).click();
  await expect(page.getByRole("heading", { name: "Poročilo uvoza" })).toBeVisible();
  await page.goto("/clani?q=Vzorec%20opombe");
  await Promise.all([
    page.waitForURL(/\/clani\/[0-9a-f-]+$/),
    page.locator(".desktop-member-table").getByRole("link", { name: "Zupan" }).first().click(),
  ]);
  await expect(page.getByText("Izstopil", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("1. 1. 2024", { exact: true })).toBeVisible();
  await expect(page.getByText("Vzorec opombe", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Uredi" }).click();
  await page.getByLabel("VPO").fill("E2E");
  await page.getByRole("button", { name: "Shrani" }).click();
  await expect(page.getByText("E2E", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Natisni nalepko" }).click();
  await expect(page.getByRole("heading", { name: "Nalepka za kuverto" })).toBeVisible();
  await expect(page.getByTestId("single-label")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("single-label-preview.png"), fullPage: true });
  const memberId = page.url().match(/\/clani\/([0-9a-f-]+)\/nalepka$/)?.[1];
  expect(memberId).toBeTruthy();
  await page.emulateMedia({ media: "print" });
  const singleSize = await page.getByTestId("single-label").evaluate((element) => {
    const style = getComputedStyle(element);
    return { width: Number.parseFloat(style.width), height: Number.parseFloat(style.height) };
  });
  expect(singleSize.width).toBeCloseTo((99.1 * 96) / 25.4, 0);
  expect(singleSize.height).toBeCloseTo((38.1 * 96) / 25.4, 0);
  await page.goto(`/nalepke/a4?ids=${memberId}&start=2`);
  const sheetSize = await page.getByTestId("a4-sheet").evaluate((element) => {
    const style = getComputedStyle(element);
    return { width: Number.parseFloat(style.width), height: Number.parseFloat(style.height) };
  });
  expect(sheetSize.width).toBeCloseTo((210 * 96) / 25.4, 0);
  expect(sheetSize.height).toBeCloseTo((297 * 96) / 25.4, 0);
  await page.emulateMedia({ media: "screen" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/clani");
  await expect(page.locator(".mobile-member-list")).toBeVisible();
  await expect(page.locator(".desktop-member-table")).toBeHidden();
  await page.screenshot({ path: testInfo.outputPath("members-mobile.png"), fullPage: true });
});

test("normal user cannot invoke an administrator import endpoint", async ({ page }) => {
  test.skip(!userEmail || !userPassword, "Set E2E_USER_EMAIL and E2E_USER_PASSWORD.");
  await login(page, userEmail!, userPassword!);
  const response = await page.request.post("/api/imports/drafts", {
    headers: { Origin: new URL(page.url()).origin },
    data: { fileName: "blocked.xlsx", sheetName: "Člani", columnMapping: {}, duplicateStrategy: "SKIP", approvePostalWarnings: false },
  });
  expect(response.status()).toBe(403);
});
