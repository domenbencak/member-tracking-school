import type { Prisma } from "@/generated/prisma/client";
import type { AuthenticatedUser } from "@/lib/auth/authorization";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { findDuplicate, type DuplicateCandidate } from "@/lib/import/duplicates";
import { IMPORT_FIELDS, parseBoolean, parseDate, parseMemberStatus, type ImportField } from "@/lib/import/parser";
import {
  memberInputSchema,
  memberPersistenceData,
  postalCodeWarning,
  type MemberInput,
} from "@/lib/members/validation";
import { nullableText } from "@/lib/utils";

export type StagedSourceRow = { sourceRowNumber: number; values: Partial<Record<ImportField, unknown>> };
type Diagnostic = { field?: ImportField; message: string };
type StoredMemberData = Omit<MemberInput, "dateOfBirth" | "statusChangedAt"> & {
  dateOfBirth: string | null;
  statusChangedAt: string | null;
};

function toStoredData(input: MemberInput): StoredMemberData {
  return {
    ...input,
    dateOfBirth: input.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    statusChangedAt: input.statusChangedAt?.toISOString().slice(0, 10) ?? null,
  };
}

function fromStoredData(value: Prisma.JsonValue): MemberInput {
  return memberInputSchema.parse(value);
}

export function validateImportRow(source: StagedSourceRow) {
  const nonEmptyFields = IMPORT_FIELDS.filter((field) => nullableText(source.values[field]) !== null);
  if (nonEmptyFields.length === 0) {
    return { status: "SKIPPED" as const, action: "SKIP" as const, data: {}, nonEmptyFields, diagnostics: [] };
  }
  const raw = { ...source.values };
  const diagnostics: Diagnostic[] = [];
  for (const field of ["dateOfBirth", "statusChangedAt"] as const) {
    const date = parseDate(raw[field]);
    if (date.error) diagnostics.push({ field, message: date.error });
    raw[field] = date.value;
  }
  const memberStatus = parseMemberStatus(raw.memberStatus);
  if (memberStatus.error) diagnostics.push({ field: "memberStatus", message: memberStatus.error });
  if (memberStatus.value === null) delete raw.memberStatus;
  else raw.memberStatus = memberStatus.value;
  for (const field of ["warVeteranStatus", "membershipFeePaid"] as const) {
    const parsed = parseBoolean(raw[field]);
    if (parsed.error) diagnostics.push({ field, message: parsed.error });
    raw[field] = parsed.value;
  }
  const parsed = memberInputSchema.safeParse(raw);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      diagnostics.push({ field: issue.path[0] as ImportField, message: issue.message });
    }
  }
  if (!parsed.success || diagnostics.length) {
    return { status: "INVALID" as const, action: "INVALID" as const, data: {}, nonEmptyFields, diagnostics };
  }
  const warning = postalCodeWarning(parsed.data.postalCode);
  if (warning) diagnostics.push({ field: "postalCode", message: warning });
  return {
    status: warning ? ("WARNING" as const) : ("VALID" as const),
    action: warning ? ("INVALID" as const) : ("IMPORT" as const),
    data: toStoredData(parsed.data),
    nonEmptyFields,
    diagnostics,
  };
}

export async function createImportDraft(
  actor: AuthenticatedUser,
  input: {
    fileName: string;
    sheetName: string;
    columnMapping: Record<string, number>;
    duplicateStrategy: "SKIP" | "UPDATE" | "CREATE_NEW";
    approvePostalWarnings: boolean;
  },
) {
  await db.importDraft.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return db.importDraft.create({
    data: {
      ...input,
      preserveBlankValues: true,
      createdById: actor.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
}

async function ownedDraft(id: string, actor: AuthenticatedUser) {
  const draft = await db.importDraft.findFirst({ where: { id, createdById: actor.id } });
  if (!draft || draft.expiresAt < new Date()) throw new AppError("IMPORT_DRAFT", "Osnutek uvoza ne obstaja ali je potekel.", 404);
  return draft;
}

export async function stageImportRows(id: string, actor: AuthenticatedUser, rows: StagedSourceRow[]) {
  const draft = await ownedDraft(id, actor);
  if (draft.status !== "UPLOADING") throw new AppError("IMPORT_STATE", "Uvoza ni več mogoče spreminjati.");
  if (rows.length > 250) throw new AppError("IMPORT_CHUNK", "Posamezen paket lahko vsebuje največ 250 vrstic.");
  const maxRows = Number(process.env.MAX_IMPORT_ROWS) || 50_000;
  if (draft.totalRows + rows.length > maxRows) throw new AppError("IMPORT_ROWS", `Uvoz lahko vsebuje največ ${maxRows} vrstic.`);
  const validated = rows.map((row) => ({ source: row, result: validateImportRow(row) }));
  await db.importDraftRow.createMany({
    data: validated.map(({ source, result }) => ({
      draftId: id,
      sourceRowNumber: source.sourceRowNumber,
      data: result.data as Prisma.InputJsonValue,
      nonEmptyFields: result.nonEmptyFields,
      diagnostics: result.diagnostics as unknown as Prisma.InputJsonValue,
      status: result.status,
      action: result.action,
    })),
    skipDuplicates: true,
  });
  await db.importDraft.update({ where: { id }, data: { totalRows: { increment: validated.length } } });
  return { accepted: validated.length };
}

function candidateFromInput(id: string, input: MemberInput): DuplicateCandidate {
  return {
    id,
    membershipCardNumber: input.membershipCardNumber,
    email: input.email,
    firstName: input.firstName,
    surname: input.surname,
    dateOfBirth: input.dateOfBirth,
    postalCode: input.postalCode,
  };
}

export async function analyzeImportDraft(id: string, actor: AuthenticatedUser) {
  const draft = await ownedDraft(id, actor);
  if (draft.status === "COMMITTED") throw new AppError("IMPORT_STATE", "Uvoz je že zaključen.");
  const [rows, members] = await Promise.all([
    db.importDraftRow.findMany({ where: { draftId: id }, orderBy: { sourceRowNumber: "asc" } }),
    db.member.findMany({
      select: { id: true, membershipCardNumber: true, email: true, firstName: true, surname: true, dateOfBirth: true, postalCode: true, deletedAt: true },
    }),
  ]);
  const candidates: DuplicateCandidate[] = members;
  const archivedIds = new Set(members.filter((member) => member.deletedAt).map((member) => member.id));
  for (const row of rows) {
    if (row.status === "INVALID" || row.status === "SKIPPED") continue;
    if (row.status === "WARNING" && !draft.approvePostalWarnings) {
      await db.importDraftRow.update({ where: { id: row.id }, data: { action: "INVALID" } });
      continue;
    }
    const input = fromStoredData(row.data);
    const duplicate = findDuplicate(input, candidates);
    let action: "IMPORT" | "UPDATE" | "SKIP" | "INVALID" = "IMPORT";
    let duplicateMemberId: string | null = null;
    if (duplicate) {
      duplicateMemberId = duplicate.candidate.id.startsWith("draft:") ? null : duplicate.candidate.id;
      if (draft.duplicateStrategy === "SKIP") action = "SKIP";
      else if (draft.duplicateStrategy === "CREATE_NEW") action = "IMPORT";
      else if (duplicate.candidate.id.startsWith("draft:") || archivedIds.has(duplicate.candidate.id)) action = "INVALID";
      else action = "UPDATE";
    }
    await db.importDraftRow.update({ where: { id: row.id }, data: { action, duplicateMemberId } });
    if (action === "IMPORT") candidates.push(candidateFromInput(`draft:${row.id}`, input));
  }
  await db.importDraft.update({ where: { id }, data: { status: "READY" } });
  return getImportDraftReport(id, actor);
}

export async function getImportDraftReport(id: string, actor: AuthenticatedUser) {
  const draft = await ownedDraft(id, actor);
  const rows = await db.importDraftRow.findMany({
    where: { draftId: id },
    orderBy: { sourceRowNumber: "asc" },
  });
  const targetIds = rows.map((row) => row.duplicateMemberId).filter((value): value is string => Boolean(value));
  const targets = await db.member.findMany({
    where: { id: { in: targetIds } },
    select: { id: true, firstName: true, surname: true, membershipCardNumber: true },
  });
  const targetMap = new Map(targets.map((target) => [target.id, target]));
  return {
    draft: { id: draft.id, fileName: draft.fileName, sheetName: draft.sheetName, status: draft.status, duplicateStrategy: draft.duplicateStrategy },
    counts: {
      total: rows.length,
      valid: rows.filter((row) => row.status === "VALID").length,
      warnings: rows.filter((row) => row.status === "WARNING").length,
      invalid: rows.filter((row) => row.status === "INVALID" || row.action === "INVALID").length,
      skipped: rows.filter((row) => row.action === "SKIP").length,
      imported: rows.filter((row) => row.action === "IMPORT").length,
      updated: rows.filter((row) => row.action === "UPDATE").length,
    },
    rows: rows.map((row) => ({
      sourceRowNumber: row.sourceRowNumber,
      status: row.status,
      action: row.action,
      diagnostics: row.diagnostics,
      target: row.duplicateMemberId ? targetMap.get(row.duplicateMemberId) ?? null : null,
    })),
  };
}

export async function commitImportDraft(id: string, actor: AuthenticatedUser) {
  await analyzeImportDraft(id, actor);
  const draft = await ownedDraft(id, actor);
  const rows = await db.importDraftRow.findMany({ where: { draftId: id }, orderBy: { sourceRowNumber: "asc" } });
  const imported = rows.filter((row) => row.action === "IMPORT");
  const updated = rows.filter((row) => row.action === "UPDATE");
  const skipped = rows.filter((row) => row.action === "SKIP");
  const invalid = rows.filter((row) => row.action === "INVALID");
  const result = await db.$transaction(async (transaction) => {
    for (let index = 0; index < imported.length; index += 500) {
      await transaction.member.createMany({
        data: imported.slice(index, index + 500).map((row) => memberPersistenceData(fromStoredData(row.data))),
      });
    }
    for (const row of updated) {
      if (!row.duplicateMemberId) throw new AppError("IMPORT_TARGET", "Ciljni član za posodobitev manjka.");
      const current = await transaction.member.findUniqueOrThrow({ where: { id: row.duplicateMemberId } });
      const incoming = fromStoredData(row.data);
      const fields = new Set(row.nonEmptyFields as string[]);
      const merged = memberInputSchema.parse(Object.fromEntries(
        Object.keys(incoming).map((key) => [key, fields.has(key) ? incoming[key as keyof MemberInput] : current[key as keyof typeof current]]),
      ));
      await transaction.member.update({
        where: { id: current.id },
        data: memberPersistenceData(merged, current, { statusChangedAtExplicit: fields.has("statusChangedAt") }),
      });
    }
    const errorSummary = invalid.map((row) => ({ row: row.sourceRowNumber, diagnostics: row.diagnostics }));
    const batch = await transaction.importBatch.create({
      data: {
        fileName: draft.fileName,
        sheetName: draft.sheetName,
        administratorId: actor.id,
        administratorEmailSnapshot: actor.email,
        totalRows: rows.length,
        importedRows: imported.length,
        updatedRows: updated.length,
        skippedRows: skipped.length,
        invalidRows: invalid.length,
        duplicateStrategy: draft.duplicateStrategy,
        preserveBlankValues: true,
        errorSummary,
      },
    });
    await transaction.auditLog.create({
      data: {
        actorId: actor.id,
        actorEmailSnapshot: actor.email,
        action: "EXCEL_IMPORT",
        entityType: "ImportBatch",
        entityId: batch.id,
        changedFields: { imported: imported.length, updated: updated.length, skipped: skipped.length },
      },
    });
    await transaction.importDraft.delete({ where: { id } });
    return batch;
  }, { isolationLevel: "Serializable", timeout: 120_000, maxWait: 10_000 });
  return result;
}
