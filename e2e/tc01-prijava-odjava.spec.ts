import { credentials, hasCredentials } from "./support/env";
import { expect, test } from "./support/fixtures";
import { HEADINGS } from "./support/texts";

test("TC-01 Veljavna prijava uporabnika USER, dostop do zaščitene strani in odjava", async ({ page, context, app }) => {
  test.skip(!hasCredentials("user"), "Nastavite SAMPLE_USER_EMAIL/SAMPLE_USER_PASSWORD (ali E2E_USER_*).");
  test.setTimeout(90_000);
  const { email, password } = credentials("user");
  const dashboard = page.getByRole("heading", { name: HEADINGS.dashboard });
  let protectedUrl = "";

  await test.step("Predpogoj: brskalnik nima aktivne seje aplikacije", async () => {
    // Vsak test dobi nov, prazen kontekst brskalnika (enako kot zasebno okno).
    expect(await context.cookies()).toHaveLength(0);
  });

  await test.step("Korak 1: odpri http://localhost:3001/prijava", async () => {
    await app.login.goto();
    await expect(page).toHaveURL("http://localhost:3001/prijava");
    await expect(app.login.email).toBeVisible();
    await expect(app.login.password).toBeVisible();
    await expect(app.login.submit).toBeVisible();
  });

  await test.step("Korak 2: vnesi testne podatke in potrdi prijavo", async () => {
    await app.login.fillAndSubmit(email!, password!);
    await expect(dashboard).toBeVisible({ timeout: 30_000 });
    await expect(app.shell.banner).toContainText(email!);
  });

  await test.step("Korak 3: zabeleži URL prikazane zaščitene strani", async () => {
    protectedUrl = page.url();
    expect(new URL(protectedUrl).pathname).not.toBe("/prijava");
    // Vsebina je prikazana brez ponovne prijave: ponovno naloži in preveri, da obrazca za prijavo ni.
    await page.reload();
    await expect(page).toHaveURL(protectedUrl);
    await expect(dashboard).toBeVisible();
    await expect(app.login.submit).toHaveCount(0);
  });

  await test.step("Korak 4: izvedi odjavo", async () => {
    await app.shell.logout();
    await expect(dashboard).toHaveCount(0, { timeout: 15_000 });
    await expect(app.shell.logoutButton).toHaveCount(0);
    await expect(app.login.email).toBeVisible();
  });

  await test.step("Korak 5: v isti zavihek vnesi URL iz koraka 3, nato še /clani", async () => {
    for (const url of [protectedUrl, "http://localhost:3001/clani"]) {
      await page.goto(url);
      await expect(page).toHaveURL(/\/prijava(\?|$)/);
      await expect(app.login.submit).toBeVisible();
      await expect(dashboard).toHaveCount(0);
      await expect(app.members.search).toHaveCount(0);
    }
  });
});
