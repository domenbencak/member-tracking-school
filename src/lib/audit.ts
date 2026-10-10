import type { AuditAction, Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import type { AuthenticatedUser } from "@/lib/auth/authorization";

export async function writeAudit(
  actor: AuthenticatedUser,
  action: AuditAction,
  entityType: string,
  entityId: string | null,
  changedFields: Prisma.InputJsonValue = {},
) {
  return db.auditLog.create({
    data: {
      actorId: actor.id,
      actorEmailSnapshot: actor.email,
      action,
      entityType,
      entityId,
      changedFields,
    },
  });
}
