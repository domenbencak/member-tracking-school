import { nullableText } from "@/lib/utils";
import type { MemberStatusValue } from "@/lib/members/status";

export const IMPORT_FIELDS = [
  "sequenceNumber",
  "membershipCardNumber",
  "surname",
  "firstName",
  "dateOfBirth",
  "memberStatus",
  "statusChangedAt",
  "notes",
  "street",
  "settlement",
  "postalCode",
  "postOffice",
  "warVeteranStatus",
  "email",
  "municipality",
  "subcommittee",
  "membershipFeePaid",
  "vpo",
] as const;

export type ImportField = (typeof IMPORT_FIELDS)[number];

export const importFieldLabels: Record<ImportField, string> = {
  sequenceNumber: "Zap. št.",
  membershipCardNumber: "Št. izkaznice",
  surname: "Priimek",
  firstName: "Ime",
  dateOfBirth: "Rojstni datum",
  memberStatus: "Status člana",
  statusChangedAt: "Datum spremembe statusa",
  notes: "Opombe",
  street: "Ulica",
  settlement: "Naselje",
  postalCode: "Poštna številka",
  postOffice: "Pošta",
  warVeteranStatus: "Status vojnega veterana",
  email: "E-pošta",
  municipality: "Občina",
  subcommittee: "Pododbor",
  membershipFeePaid: "Plačilo članarine",
  vpo: "VPO",
};

export function normalizeHeader(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("sl-SI")
    .replace(/e[\s._-]*mail/g, "email")
    .replace(/stevilka/g, "st")
    .replace(/\bst\b/g, "st")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const headerAliases: Record<ImportField, string[]> = {
  sequenceNumber: ["zap st", "zaporedna st", "zaporedna stevilka"],
  membershipCardNumber: ["st izkaznice", "stevilka izkaznice", "clanska izkaznica"],
  surname: ["priimek"],
  firstName: ["ime"],
  dateOfBirth: ["rojstni datum", "datum rojstva"],
  memberStatus: ["status clana", "clanski status", "status"],
  statusChangedAt: ["datum spremembe statusa", "datum statusa", "status od"],
  notes: ["opombe", "opomba", "zapiski"],
  street: ["ulica", "naslov"],
  settlement: ["naselje", "kraj"],
  postalCode: ["postna st", "postna stevilka"],
  postOffice: ["posta", "postni kraj"],
  warVeteranStatus: ["status vojni veteran", "status vojnega veterana", "vojni veteran"],
  email: ["email", "e posta", "elektronska posta"],
  municipality: ["obcina"],
  subcommittee: ["pododbor"],
  membershipFeePaid: ["placilo clanarine", "clanarina", "placana clanarina"],
  vpo: ["vpo"],
};

const aliasLookup = new Map<string, ImportField>();
for (const field of IMPORT_FIELDS) {
  for (const alias of headerAliases[field]) aliasLookup.set(normalizeHeader(alias), field);
}

export function matchHeader(value: unknown) {
  return aliasLookup.get(normalizeHeader(value)) ?? null;
}

export type ParseResult<T> = { value: T | null; error?: string };

export function parseBoolean(value: unknown): ParseResult<boolean> {
  const text = nullableText(value);
  if (text === null) return { value: null };
  const normalized = text.toLocaleUpperCase("sl-SI");
  if (["DA", "YES", "TRUE", "1"].includes(normalized)) return { value: true };
  if (["NE", "NO", "FALSE", "0"].includes(normalized)) return { value: false };
  return { value: null, error: `Vrednost »${text}« ni veljavna logična vrednost.` };
}

export function parseMemberStatus(value: unknown): ParseResult<MemberStatusValue> {
  const text = nullableText(value);
  if (text === null) return { value: null };
  const normalized = normalizeHeader(text);
  if (["deceased", "dead", "pokojen", "pokojna", "preminul", "preminula"].includes(normalized)) {
    return { value: "DECEASED" };
  }
  if (["resigned", "quit", "izstopil", "izstopila", "odstopil", "odstopila"].includes(normalized)) {
    return { value: "RESIGNED" };
  }
  if (["other", "drugo", "drug", "druga", "ostalo"].includes(normalized)) {
    return { value: "OTHER" };
  }
  return { value: null, error: `Vrednost »${text}« ni veljaven status člana.` };
}

function validUtcDate(year: number, month: number, day: number): Date | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? date
    : null;
}

export function parseDate(value: unknown): ParseResult<Date> {
  if (value === null || value === undefined || value === "") return { value: null };
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return { value: validUtcDate(value.getFullYear(), value.getMonth() + 1, value.getDate()) };
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const serial = Math.floor(value);
    const offset = serial < 60 ? serial : serial - 1;
    const date = new Date(Date.UTC(1899, 11, 31 + offset));
    return { value: date };
  }
  const text = nullableText(value);
  if (!text) return { value: null };
  let match = text.match(/^(\d{1,2})\s*[./]\s*(\d{1,2})\s*[./]\s*(\d{4})$/);
  if (match) {
    const date = validUtcDate(Number(match[3]), Number(match[2]), Number(match[1]));
    return date ? { value: date } : { value: null, error: `Datum »${text}« ne obstaja.` };
  }
  match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const date = validUtcDate(Number(match[1]), Number(match[2]), Number(match[3]));
    return date ? { value: date } : { value: null, error: `Datum »${text}« ne obstaja.` };
  }
  return { value: null, error: `Datum »${text}« ni v podprti obliki.` };
}
