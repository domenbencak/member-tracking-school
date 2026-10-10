import { createHash } from "node:crypto";
import { z } from "zod";
import { dateInputValueInSlovenia, nullableText } from "@/lib/utils";
import { parseBoolean, parseDate } from "@/lib/import/parser";
import { MEMBER_STATUSES, type MemberStatusValue } from "@/lib/members/status";

const optionalText = (max: number) =>
  z.preprocess(nullableText, z.string().max(max).nullable());

const optionalNotes = z.preprocess((value) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).replace(/\r\n?/g, "\n").trim();
  return normalized === "" ? null : normalized;
}, z.string().max(5_000).nullable());

const optionalEmail = z.preprocess(
  nullableText,
  z.union([z.email("Vnesite veljaven e-poštni naslov."), z.null()]),
);

const optionalInteger = z.preprocess((value) => {
  const text = nullableText(value);
  if (text === null) return null;
  const number = Number(text.replace(/\.$/, ""));
  return Number.isInteger(number) ? number : value;
}, z.number().int().positive("Zaporedna številka mora biti pozitivno celo število.").nullable());

const optionalDate = z.preprocess((value) => {
  const parsed = parseDate(value);
  return parsed.error ? value : parsed.value;
}, z.date({ error: "Vnesite veljaven datum." }).nullable());

const optionalBoolean = z.preprocess((value) => {
  if (typeof value === "boolean" || value === null) return value;
  const parsed = parseBoolean(value);
  return parsed.error ? value : parsed.value;
}, z.boolean({ error: "Izberite veljavno vrednost." }).nullable());

export const memberInputSchema = z.object({
  sequenceNumber: optionalInteger,
  membershipCardNumber: optionalText(100),
  surname: z.preprocess(nullableText, z.string().min(1, "Priimek je obvezen.").max(100)),
  firstName: z.preprocess(nullableText, z.string().min(1, "Ime je obvezno.").max(100)),
  dateOfBirth: optionalDate,
  street: optionalText(200),
  settlement: optionalText(120),
  postalCode: optionalText(20),
  postOffice: optionalText(120),
  warVeteranStatus: optionalBoolean,
  email: optionalEmail,
  municipality: optionalText(120),
  subcommittee: optionalText(120),
  membershipFeePaid: optionalBoolean,
  vpo: optionalText(100),
  memberStatus: z.enum(MEMBER_STATUSES).default("OTHER"),
  statusChangedAt: optionalDate,
  notes: optionalNotes,
});

export type MemberInput = z.infer<typeof memberInputSchema>;

export function postalCodeWarning(postalCode: string | null) {
  return postalCode !== null && !/^\d{4}$/.test(postalCode)
    ? "Slovenska poštna številka ima praviloma štiri števke."
    : null;
}

export function normalizeDuplicateText(value: string) {
  return value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("sl-SI");
}

export function buildIdentityFingerprint(input: Pick<MemberInput, "firstName" | "surname" | "dateOfBirth" | "postalCode">) {
  if (!input.dateOfBirth || !input.postalCode) return null;
  const canonical = [
    normalizeDuplicateText(input.firstName),
    normalizeDuplicateText(input.surname),
    input.dateOfBirth.toISOString().slice(0, 10),
    normalizeDuplicateText(input.postalCode),
  ].join("|");
  return createHash("sha256").update(canonical).digest("hex");
}

type CurrentMemberStatus = {
  memberStatus: MemberStatusValue;
  statusChangedAt: Date | null;
};

function sameDate(left: Date | null, right: Date | null) {
  return left?.valueOf() === right?.valueOf();
}

export function resolveStatusChangedAt(
  input: Pick<MemberInput, "memberStatus" | "statusChangedAt">,
  current?: CurrentMemberStatus,
  now = new Date(),
  statusChangedAtExplicit = false,
) {
  if (!current || current.memberStatus === input.memberStatus) return input.statusChangedAt;
  if (statusChangedAtExplicit || !sameDate(input.statusChangedAt, current.statusChangedAt)) return input.statusChangedAt;
  return new Date(`${dateInputValueInSlovenia(now)}T00:00:00.000Z`);
}

export function memberPersistenceData(
  input: MemberInput,
  current?: CurrentMemberStatus,
  options: { statusChangedAtExplicit?: boolean } = {},
) {
  return {
    ...input,
    statusChangedAt: resolveStatusChangedAt(input, current, new Date(), options.statusChangedAtExplicit),
    membershipCardNormalized: input.membershipCardNumber
      ? normalizeDuplicateText(input.membershipCardNumber)
      : null,
    emailNormalized: input.email ? input.email.toLocaleLowerCase("sl-SI") : null,
    identityFingerprint: buildIdentityFingerprint(input),
  };
}

export function memberInputFromFormData(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return {
    ...raw,
    membershipFeePaid: raw.membershipFeePaid === "UNKNOWN" ? null : raw.membershipFeePaid,
    warVeteranStatus: raw.warVeteranStatus === "UNKNOWN" ? null : raw.warVeteranStatus,
  };
}
