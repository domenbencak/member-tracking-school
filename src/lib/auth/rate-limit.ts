import { createHmac } from "node:crypto";
import { db } from "@/lib/db";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;

function attemptKey(email: string, ip: string) {
  const secret = process.env.AUTH_SECRET || "development-auth-secret";
  return createHmac("sha256", secret)
    .update(`${email.toLocaleLowerCase("sl-SI")}|${ip}`)
    .digest("hex");
}

export async function isLoginBlocked(email: string, ip: string) {
  const attempt = await db.loginAttempt.findUnique({ where: { key: attemptKey(email, ip) } });
  return Boolean(attempt?.blockedUntil && attempt.blockedUntil > new Date());
}

export async function recordLoginFailure(email: string, ip: string) {
  const key = attemptKey(email, ip);
  const now = new Date();
  const current = await db.loginAttempt.findUnique({ where: { key } });
  const expired = !current || now.getTime() - current.windowStart.getTime() > WINDOW_MS;
  const failureCount = expired ? 1 : current.failureCount + 1;
  const blockedUntil =
    failureCount >= MAX_FAILURES ? new Date(now.getTime() + WINDOW_MS) : null;
  await db.loginAttempt.upsert({
    where: { key },
    create: { key, failureCount, windowStart: now, blockedUntil },
    update: {
      failureCount,
      windowStart: expired ? now : current.windowStart,
      blockedUntil,
    },
  });
}

export async function clearLoginFailures(email: string, ip: string) {
  await db.loginAttempt.deleteMany({ where: { key: attemptKey(email, ip) } });
}
