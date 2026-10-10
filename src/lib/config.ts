import { z } from "zod";

const serverConfigSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(16),
  DATA_CONTROLLER_NAME: z.string().optional().default(""),
  DATA_RETENTION_NOTICE: z.string().optional().default(""),
  MAX_IMPORT_FILE_SIZE_MB: z.coerce.number().int().min(1).max(50).default(10),
  MAX_IMPORT_ROWS: z.coerce.number().int().min(100).max(100_000).default(50_000),
});

export function getServerConfig() {
  return serverConfigSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATA_CONTROLLER_NAME: process.env.DATA_CONTROLLER_NAME,
    DATA_RETENTION_NOTICE: process.env.DATA_RETENTION_NOTICE,
    MAX_IMPORT_FILE_SIZE_MB: process.env.MAX_IMPORT_FILE_SIZE_MB,
    MAX_IMPORT_ROWS: process.env.MAX_IMPORT_ROWS,
  });
}

export const publicConfig = {
  organizationName:
    process.env.NEXT_PUBLIC_ORGANIZATION_NAME?.trim() || "Evidenca članov",
};
