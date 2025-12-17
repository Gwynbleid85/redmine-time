/**
 * Initialize Better Auth database schema using Drizzle
 * Run with: bun scripts/init-auth-db.ts
 *
 * This script generates migration files and applies them to PostgreSQL.
 * Make sure DATABASE_URL environment variable is set.
 *
 * For development, you can also use:
 * - bun run db:generate - Generate migration files from schema changes
 * - bun run db:migrate  - Apply pending migrations
 * - bun run db:push     - Push schema directly (no migration files)
 * - bun run db:studio   - Open Drizzle Studio to browse database
 */
import { execSync } from "node:child_process";

console.log("Initializing Better Auth database schema...");

if (!process.env.DATABASE_URL) {
	console.error("❌ DATABASE_URL environment variable is not set");
	console.error("   Please set it in your .env file or environment");
	console.error(
		"   Example: DATABASE_URL=postgresql://user:password@localhost:5432/database",
	);
	process.exit(1);
}

try {
	// Generate migration files from schema
	console.log("\n📝 Generating migration files...");
	execSync("bunx drizzle-kit generate", { stdio: "inherit" });

	// Apply migrations
	console.log("\n🚀 Applying migrations...");
	execSync("bunx drizzle-kit migrate", { stdio: "inherit" });

	console.log("");
	console.log("✅ Better Auth database schema created successfully!");
	console.log("   Schema: redmine_time");
	console.log("   Schema defined in: src/lib/db/schema.ts");
	console.log("   Migration files in: ./drizzle/");
	console.log("");
	console.log("💡 Tip: Migrations will also run automatically when the app starts.");
} catch (error) {
	console.error("❌ Failed to initialize database:", error);
	process.exit(1);
}
