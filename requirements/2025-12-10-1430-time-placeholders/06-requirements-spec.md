# Requirements Specification: Time Placeholders

## Problem Statement

Users need to track their overall monthly time including non-work activities (doctor appointments, vacation, holidays) that don't belong in Redmine. Currently, there's no way to account for these absences, making it difficult to see a complete picture of monthly time allocation.

## Solution Overview

Add a "Time Placeholders" feature that allows users to log non-work time entries locally (per-user, stored in the database) that appear alongside Redmine time entries in the calendar and daily views but are never synced to Redmine.

---

## Functional Requirements

### FR1: Placeholder Types
- **FR1.1**: Support three fixed placeholder types: Doctor, Vacation, Holiday
- **FR1.2**: No custom placeholder types (keep it simple)
- **FR1.3**: Each type has a default duration:
  - Doctor: 4 hours
  - Vacation: 8 hours
  - Holiday: 8 hours

### FR2: Placeholder CRUD Operations
- **FR2.1**: Users can create placeholders via a dedicated "Add Placeholder" button (separate from "Add Task")
- **FR2.2**: Users can edit existing placeholders (change type, date, duration, optional note)
- **FR2.3**: Users can delete placeholders
- **FR2.4**: Each placeholder is for a single day (no date ranges)

### FR3: Display Requirements
- **FR3.1**: Placeholders appear in the same calendar/daily views alongside Redmine time entries
- **FR3.2**: Placeholders are visually distinguished from Redmine entries (different colors/badges)
- **FR3.3**: Placeholder hours count toward daily totals (affects the red/green 8-hour indicator)
- **FR3.4**: Monthly totals show combined time, with breakdown on hover showing:
  - Total: XX:XX
  - Redmine: XX:XX
  - Placeholders: XX:XX

### FR4: Data Storage
- **FR4.1**: Placeholders are stored per-user in the local database
- **FR4.2**: Placeholders are never sent to Redmine API
- **FR4.3**: Placeholders are deleted when user account is deleted (cascade)

---

## Technical Requirements

### TR1: Database Schema

Add new table `time_placeholder` in `src/lib/db/schema.ts`:

```typescript
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
```

### TR2: Type Definitions

Add to `src/lib/types.ts`:

```typescript
export type PlaceholderType = "Doctor" | "Vacation" | "Holiday";

export interface TimePlaceholder {
  id: string;
  type: PlaceholderType;
  date: Date;
  duration: number; // hours
  note?: string;
  isPlaceholder: true; // discriminator field
}

// Update Task type to include discriminator
export interface Task {
  // ... existing fields
  isPlaceholder?: false; // discriminator field
}

// Union type for calendar items
export type CalendarEntry = Task | TimePlaceholder;
```

### TR3: Server Functions

Create `src/lib/server/time-placeholders.ts`:

- `getPlaceholdersFn(from: string, to: string)` - Get placeholders for date range
- `addPlaceholderFn(data: { type, date, duration, note? })` - Create placeholder
- `updatePlaceholderFn(data: { id, type?, date?, duration?, note? })` - Update placeholder
- `deletePlaceholderFn(data: { id })` - Delete placeholder

### TR4: Files to Create

| File | Purpose |
|------|---------|
| `src/lib/server/time-placeholders.ts` | Server functions for CRUD |
| `src/components/features/placeholders/placeholder-dialog.tsx` | Add/edit placeholder dialog |
| `src/components/features/placeholders/placeholder-card.tsx` | Placeholder display card |
| `src/hooks/usePlaceholders.ts` | Hook to fetch placeholders |

### TR5: Files to Modify

| File | Changes |
|------|---------|
| `src/lib/db/schema.ts` | Add `timePlaceholder` table |
| `src/lib/types.ts` | Add `PlaceholderType`, `TimePlaceholder`, `CalendarEntry` types |
| `src/hooks/useTimeEntries.ts` | Merge placeholders with time entries |
| `src/components/features/daily/daily-header.tsx` | Add "Add Placeholder" button, hover tooltip |
| `src/components/features/daily/daily-entry-list.tsx` | Support rendering placeholders |
| `src/components/features/calendar/calendar-header.tsx` | Add hover tooltip for breakdown |
| `src/components/features/calendar/calendar-day.tsx` | Support rendering placeholders |
| `src/routes/calendar.tsx` | Add placeholder dialog state and handlers |
| `src/routes/daily.tsx` | Add placeholder dialog state and handlers |

### TR6: Visual Styling

Placeholder type colors (add to relevant components):

```typescript
const placeholderTypeColors = {
  Doctor: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  Vacation: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20",
  Holiday: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20",
};
```

Default durations constant:

```typescript
export const PLACEHOLDER_DEFAULTS: Record<PlaceholderType, number> = {
  Doctor: 4,
  Vacation: 8,
  Holiday: 8,
};
```

---

## Implementation Hints

### Merging Entries in useTimeEntries

```typescript
// In useTimeEntries.ts
const { data: placeholders = [] } = usePlaceholders(dateRange);

// Merge and sort by date
const allEntries: CalendarEntry[] = [...tasks, ...placeholders].sort(
  (a, b) => a.date.getTime() - b.date.getTime()
);
```

### Hover Tooltip for Breakdown

Use Tooltip component from shadcn/ui to show breakdown on total hours hover:

```tsx
<Tooltip>
  <TooltipTrigger>
    <span>{formatDuration(totalHours)}</span>
  </TooltipTrigger>
  <TooltipContent>
    <div>Redmine: {formatDuration(redmineHours)}</div>
    <div>Placeholders: {formatDuration(placeholderHours)}</div>
  </TooltipContent>
</Tooltip>
```

### Type Guard for Placeholders

```typescript
function isPlaceholder(entry: CalendarEntry): entry is TimePlaceholder {
  return 'isPlaceholder' in entry && entry.isPlaceholder === true;
}
```

---

## Acceptance Criteria

- [ ] User can add a placeholder via "Add Placeholder" button in daily/calendar views
- [ ] Placeholder dialog shows type selector with Doctor, Vacation, Holiday options
- [ ] Type selection auto-fills default duration (Doctor: 4h, Vacation/Holiday: 8h)
- [ ] User can override the default duration
- [ ] User can add an optional note to the placeholder
- [ ] Placeholders appear in calendar day cells with distinct styling
- [ ] Placeholders appear in daily view list with distinct styling
- [ ] Daily totals include placeholder hours
- [ ] Monthly totals include placeholder hours
- [ ] Hovering over total shows breakdown (Redmine vs Placeholders)
- [ ] Days with 8+ hours (including placeholders) show as green, <8 hours as red
- [ ] User can edit existing placeholders
- [ ] User can delete placeholders
- [ ] Placeholders persist across sessions (stored in database)
- [ ] Placeholders are per-user (not shared)
- [ ] Placeholders are NOT synced to Redmine

---

## Assumptions

1. The Tooltip component from shadcn/ui is already available or can be easily added
2. Database migrations will be run via Drizzle Kit
3. The existing patterns for server functions and TanStack Query will be followed
4. No need for bulk placeholder creation (e.g., adding a week of vacation at once)
