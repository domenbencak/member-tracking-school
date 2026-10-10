import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const environmentFile = fileURLToPath(new URL("../.env", import.meta.url));
const localOverride = fileURLToPath(new URL("../.env.local", import.meta.url));

if (existsSync(localOverride)) {
  throw new Error("Remove or review .env.local before setup; it can override school configuration.");
}

if (existsSync(environmentFile)) {
  console.log("Existing .env kept. School database checks still apply.");
} else {
  const databasePassword = randomBytes(24).toString("base64url");
  const databaseUrl = `postgresql://member_tracking_school:${databasePassword}@127.0.0.1:5433/member_tracking_school`;
  const replacements = {
    SCHOOL_DB_PASSWORD: databasePassword,
    DATABASE_URL: databaseUrl,
    DIRECT_URL: databaseUrl,
    AUTH_SECRET: randomBytes(32).toString("base64"),
    INITIAL_ADMIN_PASSWORD: randomBytes(18).toString("base64url"),
    SAMPLE_USER_PASSWORD: randomBytes(18).toString("base64url"),
  };
  const template = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
  const contents = template.replace(/^([A-Z_]+)=.*$/gm, (line, key) =>
    Object.hasOwn(replacements, key) ? `${key}=${replacements[key]}` : line,
  );
  writeFileSync(environmentFile, contents, { flag: "wx", mode: 0o600 });
  console.log("Created private .env with random school-only credentials.");
  console.log("Login emails: admin@example.test and user@example.test. Passwords are in .env.");
}
