import { existsSync } from "node:fs";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * PostgreSQL database client
 * Connection URL is provided via DATABASE_URL environment variable
 */
if (!process.env.DATABASE_URL) {
	console.error("❌ DATABASE_URL environment variable is not set");
}

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	// Add connection error handling
	connectionTimeoutMillis: 10000,
});

// Handle pool errors to prevent crashes
pool.on("error", (err) => {
	console.error("Unexpected database pool error:", err);
});

export const db = drizzle(pool, { schema });

/**
 * Track migration status to ensure migrations only run once
 */
let migrationPromise: Promise<void> | null = null;

/**
 * Run database migrations automatically
 * This function is idempotent - it will only run migrations once
 */
export async function ensureMigrations(): Promise<void> {
	if (migrationPromise) {
		return migrationPromise;
	}

	migrationPromise = (async () => {
		// Check if migrations folder exists
		const migrationsFolder = "./drizzle";
		const journalPath = `${migrationsFolder}/meta/_journal.json`;

		if (!existsSync(journalPath)) {
			console.log(
				"⚠️  No migration files found. Run 'bun run db:generate' to create them.",
			);
			return;
		}

		try {
			console.log("🔄 Running database migrations...");
			await migrate(db, { migrationsFolder });
			console.log("✅ Database migrations completed successfully");
		} catch (error) {
			console.error("❌ Database migration failed:", error);
			// Reset promise so migrations can be retried
			migrationPromise = null;
			throw error;
		}
	})();

	return migrationPromise;
}

// Auto-run migrations on module load (server-side only)
if (process?.env.DATABASE_URL) {
	ensureMigrations().catch((err) => {
		console.error("Failed to run migrations on startup:", err);
	});
}
