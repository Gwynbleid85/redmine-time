# Context Findings

## Codebase Analysis

### Architecture Overview
- **Framework**: TanStack Start with React 19
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack Query for server state
- **Authentication**: Better Auth with per-user data

### Existing Patterns to Follow

#### 1. Database Schema Pattern (from `custom_issue`)
```typescript
// src/lib/db/schema.ts
export const customIssue = redmineTimeSchema.table("custom_issue", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  issueId: integer("issue_id").notNull(),
  subject: text("subject").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

#### 2. Server Functions Pattern (from `custom-issues.ts`)
- Use `createServerFn` from TanStack React Start
- Get session via `auth.api.getSession({ headers })`
- Return typed responses with success/error handling
- Use Drizzle ORM for database operations

#### 3. Task Type Pattern (from `types.ts`)
```typescript
export type TaskType = "Epic" | "Task" | "Bug" | "Feature";
export interface Task {
  id: string;
  title: string;
  description: string;
  date: Date;
  duration: number; // in hours
  type: TaskType;
  // ... other fields
}
```

#### 4. UI Component Pattern (from `daily-entry-card.tsx`)
- Uses `taskTypeColors` object for type-based styling
- Badge component for type display
- Card component for entry container
- formatDuration utility for time display

### Files That Need Modification

#### New Files to Create:
1. `src/lib/db/schema.ts` - Add `timePlaceholder` table
2. `src/lib/server/time-placeholders.ts` - CRUD server functions
3. `src/components/features/time-placeholders/placeholder-dialog.tsx` - Add/edit dialog
4. `src/components/features/time-placeholders/placeholder-card.tsx` - Display card (similar to daily-entry-card)

#### Files to Modify:
1. `src/lib/types.ts` - Add PlaceholderType and TimePlaceholder types
2. `src/hooks/useTimeEntries.ts` - Merge placeholders with time entries
3. `src/components/features/daily/daily-entry-card.tsx` - Support placeholder styling
4. `src/components/features/calendar/calendar-day.tsx` - Include placeholders in task list
5. `src/components/features/calendar/calendar-header.tsx` - Add hover tooltip for breakdown
6. `src/components/features/daily/daily-header.tsx` - Add hover tooltip for breakdown
7. `src/routes/calendar.tsx` - Add placeholder dialog state
8. `src/routes/daily.tsx` - Add placeholder dialog state

### Technical Constraints

1. **Placeholder Types are Fixed**: Doctor, Vacation, Holiday (no custom types)
2. **Default Durations**:
   - Doctor: 4 hours
   - Vacation: 8 hours
   - Holiday: 8 hours
3. **Visual Distinction Required**: Different colors/badges for placeholders
4. **No Redmine Sync**: Placeholders are local-only, never sent to Redmine API
5. **Per-User Storage**: Each user has their own placeholders

### Integration Points

1. **useTimeEntries Hook**: Must merge Redmine entries + local placeholders
2. **Calendar Views**: Must display both types unified but visually distinct
3. **Total Hours**: Must include both types in calculations
4. **Hover Breakdown**: Headers need to show Redmine vs Placeholder split on hover

### Suggested Placeholder Colors (following existing pattern)
```typescript
const placeholderTypeColors = {
  Doctor: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  Vacation: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  Holiday: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
};
```
