import { and, eq, inArray } from "drizzle-orm";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const url = process.env.DATABASE_URL || "";
export const db = (() => {
	
	const sql = neon(url);
	return drizzleNeon(sql);
})();

export { eq, and, inArray };

