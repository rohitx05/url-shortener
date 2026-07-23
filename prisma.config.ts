import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    // Use DIRECT_URL for migrations (bypasses PgBouncer)
    url: process.env.DIRECT_URL!,
  },
});
