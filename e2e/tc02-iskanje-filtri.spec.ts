import { tc02 } from "./data/testni-podatki";
import { hasCredentials } from "./support/env";
import { asAdmin, expect, test } from "./support/fixtures";
import { FILTER_ANY } from "./support/texts";

test("TC-02 Združevanje iskanja ter filtrov Občina in Plačilo članarine", async ({ page, browser, app, runId }) => {
  test.skip(!hasCredentials("user", "admin"), "Nastavite poverilnice USER in ADMIN.");
  test.setTimeout(180_000);
  const data = tc02(runId);
  const { A, B, C } = data.members;
  const { members } = app;

  await test.step("Predpogoj: administrator pripravi tri ne-arhivirane člane (K-06)", async () => {
    await asAdmin(browser, async (admin) => {
      for (const member of [A, B, C]) await admin.memberForm.create(member);
    });
  });

  await test.step("Korak 1: prijava kot USER in odpri seznam članov", async () => {
    await app.login.login("user");
    await app.shell.navigateTo("Člani");
    await expect(page).toHaveURL(/\/clani(\?|$)/);
    await expect(members.heading).toBeVisible({ timeout: 30_000 });
    await expect(members.table).toBeVisible();
  });

  await test.step(`Korak 2: v iskanje vnesi »${data.search}«`, async () => {
    await members.searchFor(data.search);
    await members.expectResultCount(3);
    await expect(members.rows()).toHaveCount(4); // glava + 3 zapisi
    for (const m of [A, B, C]) await expect(members.rows(m.card)).toHaveCount(1);
  });

  await test.step("Korak 3: ohrani iskanje, nastavi Občina = Maribor, Plačilo članarine = Da, »Uporabi filtre«", async () => {
    await members.setFilters(data.filterMariborPaid);
    await members.applyFilters();
    await expect(page).toHaveURL((url) => url.searchParams.get("municipality") === "Maribor" && url.searchParams.get("q") === data.search);
    await members.expectResultCount(1);
    await expect(members.rows(A.card)).toHaveCount(1);
    await expect(members.rows(B.card)).toHaveCount(0);
    await expect(members.rows(C.card)).toHaveCount(0);
  });

  await test.step("Korak 4: osveži stran (F5)", async () => {
    await page.reload();
    await members.waitUntilReady();
    await expect(members.search).toHaveValue(data.search);
    await members.expandFilters();
    await expect(members.selectedMunicipality()).toHaveText(data.filterMariborPaid.municipality);
    await expect(members.selectedFee()).toHaveText(data.filterMariborPaid.fee);
    await members.expectResultCount(1);
    await expect(members.rows(A.card)).toHaveCount(1);
    const url = new URL(page.url());
    expect(url.searchParams.get("q")).toBe(data.search);
    expect(url.searchParams.get("municipality")).toBe("Maribor");
    expect(url.searchParams.get("fee")).not.toBe("all");
  });

  await test.step("Korak 5: spremeni Občina = Ptuj in Plačilo članarine = Ne, »Uporabi filtre«", async () => {
    await members.setFilters(data.filterPtujUnpaid);
    await members.applyFilters();
    await expect(page).toHaveURL((url) => url.searchParams.get("municipality") === "Ptuj");
    await members.expectResultCount(0);
    await expect(members.rows(data.search)).toHaveCount(0);
  });

  await test.step("Korak 6: klikni »Počisti filtre« (brez osveževanja) in razširi razdelek Filtri", async () => {
    await members.clearFilters();
    await expect(page).toHaveURL((url) => url.pathname === "/clani" && url.searchParams.get("municipality") !== "Ptuj");
    await members.expandFilters();
    // Mehke trditve: ob razhajanju se izvede še korak 7, da je posledica vidna v poročilu.
    await expect.soft(members.search, "Iskalno polje je po »Počisti filtre« prazno").toHaveValue("");
    await expect.soft(members.selectedMunicipality(), "Filter Občina je po »Počisti filtre« prazen").toHaveText(FILTER_ANY);
    await expect.soft(members.selectedFee(), "Filter Plačilo članarine je po »Počisti filtre« prazen").toHaveText(FILTER_ANY);
    await expect.soft(members.resultCount(0), "Seznam ni več omejen s pogoji").toHaveCount(0);
  });

  await test.step(`Korak 7: vnesi samo »${data.search}« brez filtrov`, async () => {
    await members.searchFor(data.search);
    await members.expectResultCount(3);
    await expect(members.rows()).toHaveCount(4);
    for (const m of [A, B, C]) await expect(members.rows(m.card)).toHaveCount(1);
  });
});
