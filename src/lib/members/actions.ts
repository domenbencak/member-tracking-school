"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actionError, type ActionState } from "@/lib/action-state";
import { requireAdmin } from "@/lib/auth/authorization";
import { writeAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import {
  memberInputFromFormData,
  memberInputSchema,
  memberPersistenceData,
  postalCodeWarning,
} from "@/lib/members/validation";
import { collapseWhitespace } from "@/lib/utils";

function parseMemberForm(formData: FormData) {
  const parsed = memberInputSchema.parse(memberInputFromFormData(formData));
  if (postalCodeWarning(parsed.postalCode) && formData.get("postalOverride") !== "on") {
    throw new AppError("POSTAL_WARNING", "Potrdite uporabo nestandardne poštne številke.");
  }
  return parsed;
}

export async function createMemberAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const actor = await requireAdmin();
    const input = parseMemberForm(formData);
    const member = await db.member.create({ data: memberPersistenceData(input) });
    await writeAudit(actor, "MEMBER_CREATED", "Member", member.id, { fields: Object.keys(input) });
    revalidatePath("/clani");
    redirect(`/clani/${member.id}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return actionError(error);
  }
}

export async function updateMemberAction(id: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const actor = await requireAdmin();
    const input = parseMemberForm(formData);
    const current = await db.member.findFirst({ where: { id, deletedAt: null } });
    if (!current) throw new AppError("NOT_FOUND", "Član ne obstaja.", 404);
    const data = memberPersistenceData(input, current, {
      statusChangedAtExplicit: formData.get("statusChangedAtExplicit") === "true",
    });
    const fields = Object.keys(data).filter((key) => {
      const before = current[key as keyof typeof current];
      const after = data[key as keyof typeof data];
      if (before instanceof Date && after instanceof Date) return before.valueOf() !== after.valueOf();
      return before !== after;
    });
    await db.member.update({ where: { id }, data });
    await writeAudit(actor, "MEMBER_UPDATED", "Member", id, { fields });
    revalidatePath(`/clani/${id}`);
    revalidatePath("/clani");
    redirect(`/clani/${id}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return actionError(error);
  }
}

export async function archiveMemberAction(id: string, confirmation: string) {
  const actor = await requireAdmin();
  const member = await db.member.findFirst({ where: { id, deletedAt: null } });
  if (!member) throw new AppError("NOT_FOUND", "Član ne obstaja.", 404);
  const expected = collapseWhitespace(`${member.firstName} ${member.surname}`).toLocaleLowerCase("sl-SI");
  if (collapseWhitespace(confirmation).toLocaleLowerCase("sl-SI") !== expected) {
    throw new AppError("CONFIRMATION", "Vneseno ime se ne ujema.");
  }
  await db.member.update({ where: { id }, data: { deletedAt: new Date(), deletedById: actor.id } });
  await writeAudit(actor, "MEMBER_DELETED", "Member", id, { fields: ["deletedAt"] });
  revalidatePath("/clani");
  revalidatePath("/clani/arhiv");
}

export async function restoreMemberAction(id: string) {
  const actor = await requireAdmin();
  const member = await db.member.findFirst({ where: { id, deletedAt: { not: null } } });
  if (!member) throw new AppError("NOT_FOUND", "Arhivirani član ne obstaja.", 404);
  await db.member.update({ where: { id }, data: { deletedAt: null, deletedById: null } });
  await writeAudit(actor, "MEMBER_RESTORED", "Member", id, { fields: ["deletedAt"] });
  revalidatePath("/clani");
  revalidatePath("/clani/arhiv");
}

function isRedirectError(error: unknown) {
  return typeof error === "object" && error !== null && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT");
}
