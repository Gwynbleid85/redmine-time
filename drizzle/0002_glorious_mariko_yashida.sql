CREATE TABLE "redmine_time"."custom_issue" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"issue_id" integer NOT NULL,
	"subject" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "redmine_time"."custom_issue" ADD CONSTRAINT "custom_issue_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "redmine_time"."user"("id") ON DELETE cascade ON UPDATE no action;