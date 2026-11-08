import { tc04 } from "./data/testni-podatki";
import { hasCredentials } from "./support/env";
import { expect, test } from "./support/fixtures";
import { MESSAGES } from "./support/texts";

test("TC-04 Arhiviranje in obnovitev istega člana", async ({ page, app, runId }) => {
  test.skip(!hasCredentials("admin"), "Nastavite INITIAL_ADMIN_EMAIL/INITIAL_ADMIN_PASSWORD (ali E2E_ADMIN_*).");
  test.setTimeout(150_000);
  const { member, fullName } = tc04(runId);
  const { members, memberDetail, archive } = app;
  let detailUrl = "";
  let before: Record<string, string> = {};

  await test.step("Predpogoj: administrator pripravi ne-arhiviranega člana (K-06)", async () => {
    await app.login.login("admin");
    await app.memberForm.create(member);
  });

  await test.step(`Korak 1: prijava kot admin in poišči »${member.card}«`, async () => {
    // Prijava je bila izvedena v predpogoju (ista seja administratorja).
    await expect(app.shell.banner).toContainText("Administrator");
    await members.goto();
    await members.searchFor(member.card);
    await members.expectResultCount(1);
    await expect(members.rows(member.card)).toHaveCount(1);
  });

  await test.step("Korak 2: odpri podrobnosti; zabeleži URL in vse prikazane podatke", async () => {
    await members.openMember(member.card);
    await expect(memberDetail.heading(fullName)).toBeVisible();
    detailUrl = page.url();
    before = await memberDetail.read();
    expect(before).toMatchObject({
      Ime: member.firstName,
      Priimek: member.surname,
      "Št. izkaznice": member.card,
      "E-pošta": member.email,
      Občina: member.municipality,
      "Plačilo članarine": member.feePaid,
      Opombe: member.notes,
    });
    expect(detailUrl).toContain(before.ID);
  });

  await test.step("Korak 3: arhiviraj člana in potrdi dejanje (vnos polnega imena)", async () => {
    await memberDetail.openArchiveDialog();
    // Sistem zahteva potrditev: gumb je onemogočen, dokler ni vneseno polno ime.
    await expect(memberDetail.archiveConfirm).toBeDisabled();
    await memberDetail.confirmArchive(fullName);
    await expect(memberDetail.archiveDialog).toBeHidden();
  });

  await test.step(`Korak 4: na običajnem seznamu poišči »${member.card}«`, async () => {
    await members.goto();
    await members.searchFor(member.card);
    await members.expectResultCount(0);
    await expect(members.rows(member.card)).toHaveCount(0);
  });

  await test.step(`Korak 5: odpri arhiv in poišči vrstico z izkaznico ${member.card}`, async () => {
    await archive.goto();
    await expect(archive.row(member.card)).toHaveCount(1);
    await expect(archive.row(member.card)).toContainText(fullName);
  });

  await test.step("Korak 6: obnovi člana", async () => {
    await archive.restore(member.card);
    await expect(page.getByText(MESSAGES.restored)).toBeVisible();
    await expect(archive.row(member.card)).toHaveCount(0);
    await page.reload();
    await expect(archive.heading).toBeVisible();
    await expect(archive.row(member.card)).toHaveCount(0);
  });

  await test.step(`Korak 7: na običajnem seznamu poišči »${member.card}«`, async () => {
    await members.goto();
    await members.searchFor(member.card);
    await members.expectResultCount(1);
    await expect(members.rows(member.card)).toHaveCount(1);
  });

  await test.step("Korak 8: odpri podrobnosti in primerjaj z zapisom iz koraka 2", async () => {
    await members.openMember(member.card);
    await expect(page).toHaveURL(detailUrl);
    await expect(memberDetail.heading(fullName)).toBeVisible();
    const after = await memberDetail.read();
    expect(after.ID).toBe(before.ID);
    // Sistemski čas »Posodobljeno« se sme spremeniti, zato ga ne primerjamo.
    const withoutUpdated = (values: Record<string, string>) => {
      const rest = { ...values };
      delete rest.Posodobljeno;
      return rest;
    };
    expect(withoutUpdated(after)).toEqual(withoutUpdated(before));
  });
});
