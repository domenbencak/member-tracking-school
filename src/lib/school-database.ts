/**
 * The school edition only uses its dedicated local database.
 * Apply this check to runtime, seeding, and migration connections.
 */
export function getSchoolDatabaseUrl(value: string | undefined): string {
  const message =
    "School edition requires member_tracking_school on 127.0.0.1 or localhost, port 5433. Run npm run school:env; never use production credentials.";
  if (!value) throw new Error(message);

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(message);
  }

  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    url.port !== "5433" ||
    url.pathname !== "/member_tracking_school" ||
    url.username !== "member_tracking_school" ||
    !url.password ||
    url.search
  ) {
    throw new Error(message);
  }

  return value;
}
