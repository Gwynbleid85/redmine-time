import {
	boolean,
	integer,
	pgSchema,
	real,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

/**
 * Better Auth database schema for Drizzle ORM (PostgreSQL)
 * Schema name: redmine_time
 * Based on: https://www.better-auth.com/docs/concepts/database
 */

export const redmineTimeSchema = pgSchema("redmine_time");

export const user = redmineTimeSchema.table("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	image: text("image"),
	redmineApiKey: text("redmine_api_key"),
	lastSeenVersion: text("last_seen_version"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = redmineTimeSchema.table("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const account = redmineTimeSchema.table("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	expiresAt: timestamp("expires_at"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = redmineTimeSchema.table("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const customIssue = redmineTimeSchema.table("custom_issue", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	issueId: integer("issue_id").notNull(),
	subject: text("subject").notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const timePlaceholder = redmineTimeSchema.table("time_placeholder", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	type: text("type").notNull(), // "Doctor" | "Vacation" | "Holiday"
	date: timestamp("date").notNull(),
	duration: real("duration").notNull(), // hours as decimal
	note: text("note"), // optional note/comment
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
