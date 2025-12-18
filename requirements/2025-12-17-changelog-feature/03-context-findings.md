# Context Findings

## Codebase Architecture Summary

### Technology Stack
- **Framework**: TanStack Start (SSR-enabled React meta-framework)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Better Auth with session management
- **UI**: shadcn/ui components with Dialog, Button, etc.
- **State**: TanStack Query for server state

### Key Files for This Feature

#### Database Layer
- `src/lib/db/schema.ts` - Drizzle schema definitions (need to add `changelogView` table)
- `src/lib/db/index.ts` - Database client and auto-migrations

#### Server Functions Pattern
- `src/lib/server/custom-issues.ts` - Example of CRUD server functions
  - Uses `createServerFn()` from `@tanstack/react-start`
  - Gets session via `auth.api.getSession({ headers })`
  - Uses `crypto.randomUUID()` for IDs

#### UI Patterns
- `src/components/ui/dialog.tsx` - shadcn Dialog component
- `src/components/features/api-key/api-key-dialog.tsx` - Example dialog implementation

#### Root Layout
- `src/routes/__root.tsx` - Contains footer (line 58-64), where version should be displayed

#### Build Script
- `build_and_push.sh` - Currently takes VERSION as parameter, needs to update package.json and commit

### Implementation Patterns Identified

1. **Database Tables**: Follow existing pattern in `schema.ts`:
   ```typescript
   export const tableNam = redmineTimeSchema.table("table_name", {
     id: text("id").primaryKey(),
     userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
     // ... other fields
     createdAt: timestamp("created_at").notNull().defaultNow(),
   });
   ```

2. **Server Functions**: Follow pattern in `custom-issues.ts`:
   ```typescript
   export const getFn = createServerFn({ method: "GET" }).handler(async () => {
     const session = await getSession();
     // ... database operations
   });
   ```

3. **Dialogs**: Props pattern with `open`, `onOpenChange` callbacks

4. **Auth Access**:
   - Server: `auth.api.getSession({ headers })`
   - Client: `useSession()` hook from `@/lib/auth-client`

### New Files to Create
- `src/lib/server/changelog.ts` - Server functions for changelog
- `src/components/features/changelog/changelog-dialog.tsx` - Changelog dialog
- `src/hooks/useChangelog.ts` - Hook for changelog state management
- `CHANGELOG.md` - Changelog content file

### Files to Modify
- `src/lib/db/schema.ts` - Add `changelogView` table
- `src/routes/__root.tsx` - Add version to footer, integrate changelog dialog
- `package.json` - Add `version` field
- `build_and_push.sh` - Update to modify package.json and commit

### Database Migration
Will need to run `bun run db:generate` after schema changes
