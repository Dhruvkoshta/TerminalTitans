import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

// Prefer monorepo root .env (e.g. Neon), fallback to apps/web/.env for local
dotenv.config({ path: "../../.env" });
if (!process.env.DATABASE_URL) {
	dotenv.config({ path: "../../apps/web/.env" });
}

export default defineConfig({
	schema: "./src/schema",
	out: "./src/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL || "",
	},
});

