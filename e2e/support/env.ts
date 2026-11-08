/**
 * Poverilnice in pripona zagona. Poverilnice se berejo iz okolja (E2E_* ima prednost pred vrednostmi iz .env),
 * nikoli niso zapisane v kodi.
 */
export type Role = "admin" | "user";

export function credentials(role: Role): { email: string | undefined; password: string | undefined } {
  if (role === "admin") {
    return {
      email: process.env.E2E_ADMIN_EMAIL ?? process.env.INITIAL_ADMIN_EMAIL,
      password: process.env.E2E_ADMIN_PASSWORD ?? process.env.INITIAL_ADMIN_PASSWORD,
    };
  }
  return {
    email: process.env.E2E_USER_EMAIL ?? process.env.SAMPLE_USER_EMAIL,
    password: process.env.E2E_USER_PASSWORD ?? process.env.SAMPLE_USER_PASSWORD,
  };
}

export function hasCredentials(...roles: Role[]): boolean {
  return roles.every((role) => {
    const { email, password } = credentials(role);
    return Boolean(email && password);
  });
}

/** Baza med zagoni ostane, zato enolične vrednosti (izkaznice, e-pošte) dobijo pripono zagona. */
export function makeRunId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`.toUpperCase();
}
