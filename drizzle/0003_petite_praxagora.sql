CREATE TABLE "redmine_time"."time_placeholder" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"date" timestamp NOT NULL,
	"duration" real NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "redmine_time"."time_placeholder" ADD CONSTRAINT "time_placeholder_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "redmine_time"."user"("id") ON DELETE cascade ON UPDATE no action;