/// <reference lib="webworker" />
import { read, utils, type WorkBook } from "xlsx";

let workbook: WorkBook | null = null;
let maxRows = 50_000;

function sheetPayload(sheetName: string) {
  if (!workbook) throw new Error("Delovni zvezek ni naložen.");
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) throw new Error("Izbrani delovni list ne obstaja.");
  const rows = utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null, raw: false, dateNF: "dd/mm/yyyy" });
  const maxColumns = rows.reduce((maximum, row) => Math.max(maximum, row.length), 0);
  if (rows.length > maxRows) throw new Error(`Delovni list vsebuje več kot ${maxRows} vrstic.`);
  if (maxColumns > 100) throw new Error("Delovni list vsebuje več kot 100 stolpcev.");
  return { sheetName, rows };
}

self.onmessage = (event: MessageEvent<{ type: string; buffer?: ArrayBuffer; sheetName?: string; maxRows?: number }>) => {
  try {
    if (event.data.type === "parse" && event.data.buffer) {
      maxRows = event.data.maxRows ?? maxRows;
      workbook = read(event.data.buffer, { type: "array", dense: true, cellFormula: false, cellHTML: false, cellText: true });
      const sheets = workbook.SheetNames;
      if (!sheets.length) throw new Error("Datoteka ne vsebuje delovnih listov.");
      self.postMessage({ type: "parsed", sheets, ...sheetPayload(sheets[0]) });
    } else if (event.data.type === "sheet" && event.data.sheetName) {
      self.postMessage({ type: "sheet", sheets: workbook?.SheetNames ?? [], ...sheetPayload(event.data.sheetName) });
    }
  } catch (error) {
    self.postMessage({ type: "error", message: error instanceof Error ? error.message : "Datoteke ni mogoče prebrati." });
  }
};
