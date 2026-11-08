/**
 * Besedila vmesnika, ki jih testi preverjajo (sporočila, naslovi strani). Če se besedilo v aplikaciji spremeni,
 * se popravi samo tu. Napisi gumbov in polj so v objektih strani (e2e/pages).
 */
export const HEADINGS = {
  dashboard: "Nadzorna plošča",
  members: "Člani",
  newMember: "Dodaj člana",
  archive: "Arhiv članov",
  import: "Uvoz podatkov",
  importMapping: "2. Delovni list in preslikava",
  importResult: "5. Rezultat preverjanja",
  importReport: "Poročilo uvoza",
  importHistory: "Zgodovina uvozov",
} as const;

export const MESSAGES = {
  archived: "Član je arhiviran.",
  restored: "Član je obnovljen.",
  /** Testni primer zahteva sporočilo, da e-pošta ni veljavna; točno besedilo ni določeno. */
  invalidEmail: /veljav\w*\s+e-poštn\w*\s+naslov/i,
} as const;

/** Vrednost spustnega seznama filtra, ko pogoj ni nastavljen. */
export const FILTER_ANY = "Vse";

export const IMPORT_RESULT_COUNTERS = ["Za uvoz", "Za posodobitev", "Preskočeno", "Neveljavno"] as const;
export const IMPORT_REPORT_COUNTERS = ["Uvoženo", "Posodobljeno", "Preskočeno", "Neveljavno"] as const;
