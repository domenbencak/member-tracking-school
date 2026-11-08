import { tc03 } from "./data/testni-podatki";
import { hasCredentials } from "./support/env";
import { expect, test, type Pages } from "./support/fixtures";
import { MESSAGES } from "./support/texts";

/** Član z izkaznico ni ne na običajnem seznamu ne v arhivu. */
async function expectNotInListOrArchive(app: Pages, card: string) {
  await app.members.searchFor(card);
  await app.members.expectResultCount(0);
  await expect(app.members.rows(card)).toHaveCount(0);
  await app.archive.goto();
  await expect(app.archive.row(card)).toHaveCount(0);
}

test("TC-03 Zavrnitev novega člana z e-pošto brez znaka @", async ({ page, app, runId }) => {
  test.skip(!hasCredentials("admin"), "Nastavite INITIAL_ADMIN_EMAIL/INITIAL_ADMIN_PASSWORD (ali E2E_ADMIN_*).");
  test.setTimeout(120_000);
  const { member } = tc03(runId);
  const { members, memberForm } = app;

  await test.step("Korak 1: prijava kot ADMIN", async () => {
    await app.login.login("admin");
    await expect(app.shell.banner).toContainText("Administrator");
    await members.goto();
    await expect(members.addMemberLink).toBeVisible();
  });

  await test.step(`Korak 2: na seznamu in v arhivu poišči »${member.card}«`, async () => {
    await expectNotInListOrArchive(app, member.card);
  });

  await test.step("Korak 3: odpri obrazec za novega člana in vnesi vse testne podatke", async () => {
    await members.goto();
    await members.addMemberLink.click();
    await expect(page).toHaveURL(/\/clani\/nov$/);
    await memberForm.fill(member);
    await memberForm.expectValues(member);
  });

  await test.step("Korak 4: shrani", async () => {
    await memberForm.save();
    await expect(memberForm.fieldError("E-pošta")).toHaveText(MESSAGES.invalidEmail, { timeout: 15_000 });
    // Član ni ustvarjen: ostanemo na obrazcu, stran podrobnosti se ne odpre (dokončno preverjeno v koraku 5).
    await expect(page).toHaveURL(/\/clani\/nov$/);
    await expect(memberForm.heading).toBeVisible();
  });

  await test.step(`Korak 5: zapusti obrazec brez popravka; na seznamu in v arhivu poišči »${member.card}«`, async () => {
    await memberForm.cancelLink.click();
    await expect(page).toHaveURL(/\/clani(\?|$)/);
    await expectNotInListOrArchive(app, member.card);
  });
});
