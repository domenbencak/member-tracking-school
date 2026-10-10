"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@/generated/prisma/client";
import { actionError, type ActionState } from "@/lib/action-state";
import { requireAdmin, requireUser } from "@/lib/auth/authorization";
import { writeAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

const passwordSchema = z.string().min(12, "Geslo mora vsebovati najmanj 12 znakov.").max(200);
const createUserSchema = z.object({
  email: z.email("Vnesite veljaven e-poštni naslov.").transform((value) => value.trim().toLocaleLowerCase("sl-SI")),
  password: passwordSchema,
  role: z.enum(["ADMIN", "USER"]),
});

async function assertNotLastActiveAdmin(transaction: Prisma.TransactionClient, targetId: string) {
  const target = await transaction.user.findUnique({ where: { id: targetId } });
  if (target?.role === "ADMIN" && target.isActive) {
    const count = await transaction.user.count({ where: { role: "ADMIN", isActive: true } });
    if (count <= 1) throw new AppError("LAST_ADMIN", "Zadnjega aktivnega administratorja ni mogoče spremeniti.");
  }
  return target;
}

export async function createUserAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const actor = await requireAdmin();
    const input = createUserSchema.parse(Object.fromEntries(formData));
    const exists = await db.user.findUnique({ where: { email: input.email } });
    if (exists) throw new AppError("EMAIL_EXISTS", "Uporabnik s tem naslovom že obstaja.");
    const user = await db.user.create({
      data: { email: input.email, role: input.role, passwordHash: await bcrypt.hash(input.password, 12), mustChangePassword: true },
    });
    await writeAudit(actor, "USER_CREATED", "User", user.id, { fields: ["email", "role"] });
    revalidatePath("/uporabniki");
    return { success: "Uporabnik je ustvarjen." };
  } catch (error) {
    return actionError(error);
  }
}

export async function setUserRoleAction(id: string, role: "ADMIN" | "USER") {
  const actor = await requireAdmin();
  await db.$transaction(async (transaction) => {
    const target = await transaction.user.findUnique({ where: { id } });
    if (!target) throw new AppError("NOT_FOUND", "Uporabnik ne obstaja.", 404);
    if (target.role === "ADMIN" && role === "USER") await assertNotLastActiveAdmin(transaction, id);
    await transaction.user.update({ where: { id }, data: { role, sessionVersion: { increment: 1 } } });
    await transaction.auditLog.create({ data: { actorId: actor.id, actorEmailSnapshot: actor.email, action: "USER_ROLE_CHANGED", entityType: "User", entityId: id, changedFields: { role: { from: target.role, to: role } } } });
  }, { isolationLevel: "Serializable" });
  revalidatePath("/uporabniki");
}

export async function setUserActiveAction(id: string, isActive: boolean) {
  const actor = await requireAdmin();
  await db.$transaction(async (transaction) => {
    const target = await transaction.user.findUnique({ where: { id } });
    if (!target) throw new AppError("NOT_FOUND", "Uporabnik ne obstaja.", 404);
    if (!isActive) await assertNotLastActiveAdmin(transaction, id);
    await transaction.user.update({ where: { id }, data: { isActive, sessionVersion: { increment: 1 } } });
    await transaction.auditLog.create({ data: { actorId: actor.id, actorEmailSnapshot: actor.email, action: isActive ? "USER_ENABLED" : "USER_DISABLED", entityType: "User", entityId: id, changedFields: { fields: ["isActive"] } } });
  }, { isolationLevel: "Serializable" });
  revalidatePath("/uporabniki");
}

export async function resetPasswordAction(id: string, _: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const actor = await requireAdmin();
    const password = passwordSchema.parse(formData.get("password"));
    const target = await db.user.findUnique({ where: { id } });
    if (!target) throw new AppError("NOT_FOUND", "Uporabnik ne obstaja.", 404);
    await db.user.update({
      where: { id },
      data: { passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true, sessionVersion: { increment: 1 } },
    });
    await writeAudit(actor, "PASSWORD_RESET", "User", id, { fields: ["password"] });
    return { success: "Začasno geslo je nastavljeno." };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteUserAction(id: string) {
  const actor = await requireAdmin();
  await db.$transaction(async (transaction) => {
    const target = await assertNotLastActiveAdmin(transaction, id);
    if (!target) throw new AppError("NOT_FOUND", "Uporabnik ne obstaja.", 404);
    await transaction.auditLog.create({ data: { actorId: actor.id, actorEmailSnapshot: actor.email, action: "USER_DELETED", entityType: "User", entityId: id, changedFields: { fields: ["id"] } } });
    await transaction.user.delete({ where: { id } });
  }, { isolationLevel: "Serializable" });
  revalidatePath("/uporabniki");
}

export async function changeOwnPasswordAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const actor = await requireUser();
    const currentPassword = z.string().min(1).parse(formData.get("currentPassword"));
    const newPassword = passwordSchema.parse(formData.get("newPassword"));
    const user = await db.user.findUniqueOrThrow({ where: { id: actor.id } });
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      throw new AppError("PASSWORD", "Trenutno geslo ni pravilno.");
    }
    await db.user.update({
      where: { id: actor.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 12), mustChangePassword: false, sessionVersion: { increment: 1 } },
    });
    await writeAudit(actor, "PASSWORD_CHANGED", "User", actor.id, { fields: ["password"] });
    return { success: "Geslo je spremenjeno. Ponovno se prijavite." };
  } catch (error) {
    return actionError(error);
  }
}
