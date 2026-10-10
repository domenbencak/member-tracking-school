import "dotenv/config";
import { defineConfig } from "prisma/config";
import { getSchoolDatabaseUrl } from "./src/lib/school-database";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: getSchoolDatabaseUrl(process.env.DIRECT_URL || process.env.DATABASE_URL),
  },
});
