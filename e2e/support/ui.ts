import { expect, type Locator } from "@playwright/test";

/** Časovne omejitve na enem mestu. Razvojni strežnik ob prvem obisku stran šele prevede. */
export const TIMEOUT = {
  /** prvo nalaganje strani in prijava */
  page: 30_000,
  /** osvežitev seznama po spremembi pogojev */
  list: 15_000,
} as const;

/**
 * Počaka, da React prevzame element (hidracija). Prej je HTML že viden, dogodki pa še ne delujejo:
 * klik na »Prijava« bi obrazec oddal kot navaden GET zahtevek in stran le osvežil.
 * React ob hidraciji elementu doda lastnost »__reactProps$…«, zato preverimo njen obstoj.
 */
export async function waitForHydration(element: Locator): Promise<void> {
  await expect(element).toBeVisible({ timeout: TIMEOUT.page });
  await expect
    .poll(() => element.evaluate((node) => Object.keys(node).some((key) => key.startsWith("__reactProps"))), {
      timeout: TIMEOUT.page,
      message: "Stran ni pripravljena (React še ni prevzel elementa).",
    })
    .toBe(true);
}

/** Klik na gumb šele, ko ga React prevzame (pred tem klik nima učinka ali obrazec odda kot navaden zahtevek). */
export async function clickWhenReady(element: Locator): Promise<void> {
  await waitForHydration(element);
  await element.click();
}

/** Prebere izbrano možnost elementa <select> (option:checked je edini zanesljiv način). */
export function selectedOption(select: Locator): Locator {
  return select.locator("option:checked");
}

/** Prebere števce oblike »Oznaka N« iz besedila vsebnika (npr. »Za uvoz 1«), neodvisno od postavitve. */
export async function readCounters(container: Locator, labels: readonly string[]): Promise<Record<string, number>> {
  const text = (await container.innerText()).replace(/\s+/g, " ");
  const result: Record<string, number> = {};
  for (const label of labels) {
    const match = text.match(new RegExp(`${label}\\s*(\\d+)`));
    if (match) result[label] = Number(match[1]);
  }
  return result;
}

/** Vrstico tabele vrne kot slovar »naslov stolpca → besedilo celice« (neodvisno od vrstnega reda stolpcev). */
export async function rowByColumn(table: Locator, row: Locator): Promise<Record<string, string>> {
  const headers = await table.getByRole("columnheader").allInnerTexts();
  const cells = await row.getByRole("cell").allInnerTexts();
  const result: Record<string, string> = {};
  headers.forEach((header, i) => {
    result[header.trim()] = (cells[i] ?? "").trim();
  });
  return result;
}

/** Pari »oznaka – vrednost« (term/definition) na strani, npr. podrobnosti člana ali poročila. */
export async function readTermDefinitions(container: Locator): Promise<Record<string, string>> {
  await expect(container.getByRole("term").first()).toBeVisible();
  const terms = await container.getByRole("term").allInnerTexts();
  const values = await container.getByRole("definition").allInnerTexts();
  expect(values.length).toBe(terms.length);
  return Object.fromEntries(terms.map((term, i) => [term.trim(), values[i].trim()]));
}
