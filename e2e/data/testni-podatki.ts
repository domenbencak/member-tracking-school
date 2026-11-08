/**
 * Testni podatki testnih primerov TC-01 do TC-05 (docs/avtomatizacija/testni_primeri_koncni.md, polje »Testni podatki«).
 * Če se testni podatki v testnem primeru spremenijo, se popravijo samo tu.
 *
 * Prilagoditev: baza med zagoni ostane, zato enolične vrednosti (izkaznice, e-pošte, iskalni niz) dobijo
 * pripono zagona runId, npr. TC02-A -> TC02-<runId>-A.
 */
import type { MemberInput } from "../pages/MemberFormPage";

export function tc02(runId: string) {
  const prefix = `TC02-${runId}-`;
  return {
    /** iskalni niz »TC02-« */
    search: prefix,
    members: {
      A: { card: `${prefix}A`, firstName: "Ana", surname: "Testna", municipality: "Maribor", feePaid: "Da" },
      B: { card: `${prefix}B`, firstName: "Bojan", surname: "Testni", municipality: "Maribor", feePaid: "Ne" },
      C: { card: `${prefix}C`, firstName: "Cvetka", surname: "Testna", municipality: "Ptuj", feePaid: "Da" },
    } satisfies Record<string, MemberInput>,
    /** korak 3 */
    filterMariborPaid: { municipality: "Maribor", fee: "Da" },
    /** korak 5 */
    filterPtujUnpaid: { municipality: "Ptuj", fee: "Ne" },
  };
}

export function tc03(runId: string) {
  return {
    member: {
      card: `TC03-${runId}-001`,
      firstName: "Neža",
      surname: "Zavrnjena",
      email: "neza.zavrnjena.example.test", // neveljavna: brez znaka @
      street: "Testna ulica 3",
      postalCode: "3000",
      postOffice: "Celje",
      municipality: "Celje",
      feePaid: "Da",
    } satisfies MemberInput,
  };
}

export function tc04(runId: string) {
  return {
    member: {
      card: `TC04-${runId}-001`,
      firstName: "Marko",
      surname: "Arhivski",
      email: `marko.arhivski.${runId.toLowerCase()}@example.test`,
      municipality: "Kranj",
      feePaid: "Da",
      notes: "TC04 opomba",
    } satisfies MemberInput,
    fullName: "Marko Arhivski",
  };
}

export function tc05(runId: string) {
  const rid = runId.toLowerCase();
  const cards = {
    new: `TC05-${runId}-NOV-01`,
    invalid: `TC05-${runId}-NEV-01`,
    existing: `TC05-${runId}-OBST-01`,
  };
  const existing = {
    card: cards.existing,
    firstName: "Petra",
    surname: "Obstoječa",
    email: `petra.obstojeca.${rid}@example.test`,
    municipality: "Koper",
    notes: "Izvorna opomba TC05",
  } satisfies MemberInput;
  const newMember = { surname: "Novak", firstName: "Nina", email: `nina.novak.tc05.${rid}@example.test`, municipality: "Celje" };
  return {
    cards,
    existing,
    newMember,
    file: {
      name: "tc05-skip-v1.xlsx",
      sheet: "Clani",
      header: ["Št. Izkaznice", "Priimek", "Ime", "E mail", "Občina", "Opombe"],
      rows: [
        // vrstica 2: nov veljaven član
        [cards.new, newMember.surname, newMember.firstName, newMember.email, newMember.municipality, ""],
        // vrstica 3: podvojitev po izkaznici, zapisana z malimi črkami, s spremenjeno e-pošto in opombo
        [cards.existing.toLowerCase(), "Obstoječa", "Petra", `petra.spremenjena.${rid}@example.test`, "Koper", "Spremenjena opomba TC05"],
        // vrstica 4: neveljavna e-pošta
        [cards.invalid, "Neveljavna", "Vera", "vera.neveljavna.example.test", "Celje", ""],
      ],
    },
    /** preslikava polje aplikacije -> stolpec datoteke (korak 4) */
    mapping: {
      "Št. izkaznice": "Št. Izkaznice",
      "Priimek *": "Priimek",
      "Ime *": "Ime",
      "E-pošta": "E mail",
      Občina: "Občina",
      Opombe: "Opombe",
    },
    rule: "SKIP" as const,
    expectedValidation: { "Za uvoz": 1, "Za posodobitev": 0, Preskočeno: 1, Neveljavno: 1 },
    expectedReport: { Uvoženo: 1, Posodobljeno: 0, Preskočeno: 1, Neveljavno: 1 },
  };
}
