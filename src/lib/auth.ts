import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "./db";
import * as schema from "./db/schema";

// Parse trusted origins from environment variable (comma-separated)
// Example: BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:3001
const getTrustedOrigins = (): string[] => {
	const originsEnv = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
	if (originsEnv) {
		return originsEnv.split(",").map((origin) => origin.trim());
	}
	// Default to common localhost ports in development
	return ["http://localhost:3000", "http://localhost:3001"];
};

// Parse allowed emails whitelist from environment variable (comma-separated)
// Example: BETTER_AUTH_ALLOWED_EMAILS=user1@example.com,user2@example.com
// If not set, all emails are allowed
const getAllowedEmails = (): string[] | null => {
	const emailsEnv = process.env.BETTER_AUTH_ALLOWED_EMAILS;
	if (emailsEnv) {
		return emailsEnv
			.split(",")
			.map((email) => email.trim().toLowerCase())
			.filter((email) => email.length > 0);
	}
	return null; // null means all emails are allowed
};

const allowedEmails = getAllowedEmails();

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
	trustedOrigins: getTrustedOrigins(),
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 6,
	},
	user: {
		additionalFields: {
			redmineApiKey: {
				type: "string",
				required: false,
				input: false, // don't allow user to set API key during signup
			},
		},
		changeEmail: {
			enabled: false,
		},
	},
	databaseHooks: {
		user: {
			create: {
				before: async (user) => {
					// Check if email whitelist is enabled
					if (allowedEmails && allowedEmails.length > 0) {
						const userEmail = user.email.toLowerCase();
						if (!allowedEmails.includes(userEmail)) {
							throw new Error(
								"Registration is restricted. Your email is not in the allowed list.",
							);
						}
					} else {
						throw new Error(
							"Registration is restricted. Your email is not in the allowed list.",
						);
					}
					return { data: user };
				},
			},
		},
	},
	plugins: [tanstackStartCookies()], // must be the last plugin
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
