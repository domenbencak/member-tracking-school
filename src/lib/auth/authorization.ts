import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/enums";
import { authOptions } from "@/lib/auth/options";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
};

export function assertAdmin(user: Pick<AuthenticatedUser, "role">) {
  if (user.role !== "ADMIN") throw new AppError("FORBIDDEN", "Nimate dovoljenja za to dejanje.", 403);
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, isActive: true, sessionVersion: true, mustChangePassword: true },
  });
  if (!user?.isActive || user.sessionVersion !== session.user.sessionVersion) return null;
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new AppError("UNAUTHORIZED", "Prijava je potekla.", 401);
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  assertAdmin(user);
  return user;
}

export async function requirePageUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/prijava");
  return user;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    throw new AppError("BAD_ORIGIN", "Zahteva ni bila poslana iz dovoljene strani.", 403);
  }
}
