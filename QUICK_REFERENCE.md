# Quick Reference Guide - Redmine Time Tracker

## Import Cheat Sheet

### Custom Hooks
```typescript
// All hooks from one location
import {
  useCalendarNavigation,
  useTimeEntries,
  useTimeEntryMutations,
  useApiKeyManagement
} from "@/hooks";

// Or individually
import { useCalendarNavigation } from "@/hooks/useCalendarNavigation";
```

### Feature Components
```typescript
// Auth components
import { LoginForm, LoginLogo } from "@/components/features/auth";

// API Key components
import {
  ApiKeyButton,
  ApiKeyDialog,
  ApiKeyWarning
} from "@/components/features/api-key";

// Calendar components
import {
  CalendarGrid,
  CalendarSummary,
  CalendarLoading,
  CalendarError
} from "@/components/features/calendar";

// Time entry components
import {
  TaskDialog,
  TaskDetailDialog,
  TaskItem
} from "@/components/features/time-entries";
```

### Server Functions
```typescript
// All server functions
import {
  checkApiKeyServerFn,
  validateAndSetApiKeyFn,
  getCurrentUserFn,
  clearApiKeyFn
} from "@/lib/server";

// Or by domain
import {
  checkApiKeyServerFn,
  validateAndSetApiKeyFn,
  getCurrentUserFn,
  clearApiKeyFn
} from "@/lib/server/api-key";
```

### UI Components (shadcn/ui)
```typescript
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
// ... etc
```

## File Locations Quick Reference

| What | Where |
|------|-------|
| Login page | `/Users/miloshegr/Documents/Playgound/redmine_time/src/routes/index.tsx` |
| Calendar page | `/Users/miloshegr/Documents/Playgound/redmine_time/src/routes/calendar.tsx` |
| Auth components | `/Users/miloshegr/Documents/Playgound/redmine_time/src/components/features/auth/` |
| API key components | `/Users/miloshegr/Documents/Playgound/redmine_time/src/components/features/api-key/` |
| Calendar components | `/Users/miloshegr/Documents/Playgound/redmine_time/src/components/features/calendar/` |
| Time entry components | `/Users/miloshegr/Documents/Playgound/redmine_time/src/components/features/time-entries/` |
| Custom hooks | `/Users/miloshegr/Documents/Playgound/redmine_time/src/hooks/` |
| Server functions | `/Users/miloshegr/Documents/Playgound/redmine_time/src/lib/server/` |
| Types | `/Users/miloshegr/Documents/Playgound/redmine_time/src/lib/types.ts` |

## Common Tasks

### Adding a New Feature Component
```bash
# 1. Create component file
touch src/components/features/my-feature/my-component.tsx

# 2. Write component
cat > src/components/features/my-feature/my-component.tsx << 'EOF'
export function MyComponent() {
  return <div>My Component</div>;
}
EOF

# 3. Create/update index file
cat > src/components/features/my-feature/index.ts << 'EOF'
export { MyComponent } from "./my-component";
EOF

# 4. Use in route
# import { MyComponent } from "@/components/features/my-feature";
```

### Adding a New Custom Hook
```bash
# 1. Create hook file
touch src/hooks/useMyFeature.ts

# 2. Write hook
cat > src/hooks/useMyFeature.ts << 'EOF'
import { useState } from "react";

export function useMyFeature() {
  const [state, setState] = useState();
  return { state, setState };
}
EOF

# 3. Export from index
echo 'export { useMyFeature } from "./useMyFeature";' >> src/hooks/index.ts

# 4. Use in component
# import { useMyFeature } from "@/hooks";
```

### Adding a New Server Function
```typescript
// In src/lib/server/appropriate-domain.ts
export const myNewServerFn = createServerFn({ method: "POST" })
  .handler(async () => {
    // Server-side logic
    return { success: true };
  });

// Export from index.ts
export { myNewServerFn } from "./appropriate-domain";

// Use with useServerFn
const myFn = useServerFn(myNewServerFn);
```

## Hook Usage Patterns

### useCalendarNavigation
```typescript
const {
  currentDate,           // Current date state
  handlePreviousMonth,   // Go to previous month
  handleNextMonth,       // Go to next month
  handleToday            // Go to today
} = useCalendarNavigation();
```

### useTimeEntries
```typescript
const {
  tasks,        // Array of enriched time entry tasks
  isLoading,    // Loading state
  error         // Error state (if any)
} = useTimeEntries(currentDate);
```

### useTimeEntryMutations
```typescript
const {
  handleUpdate,      // (task, taskToEdit) => void
  handleCreate,      // (task) => void
  handleDelete,      // (taskId) => void
  handleDuplicate,   // (task) => void
} = useTimeEntryMutations();
```

### useApiKeyManagement
```typescript
const {
  hasApiKey,              // boolean
  userLogin,              // string | null
  isApiKeyDialogOpen,     // boolean
  setIsApiKeyDialogOpen,  // (open: boolean) => void
  apiKey,                 // string
  setApiKey,              // (key: string) => void
  apiKeyError,            // string
  setApiKeyError,         // (error: string) => void
  isValidating,           // boolean
  handleApiKeySubmit,     // (e: FormEvent) => Promise<void>
  handleLogout,           // () => Promise<void>
} = useApiKeyManagement();
```

## Common Component Patterns

### Feature Component Template
```typescript
interface MyComponentProps {
  data: SomeType;
  onAction: (item: SomeType) => void;
}

/**
 * Brief description of what this component does
 */
export function MyComponent({ data, onAction }: MyComponentProps) {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### Route Component Template
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { MyComponent } from "@/components/features/my-feature";
import { useMyHook } from "@/hooks";

export const Route = createFileRoute("/my-route")({
  component: MyPage,
  // Optional: loader for SSR data
  loader: async () => {
    const data = await fetchData();
    return data;
  },
});

function MyPage() {
  const { state } = useMyHook();

  return (
    <div>
      <MyComponent data={state} />
    </div>
  );
}
```

## Development Commands

```bash
# Install dependencies
bun install

# Start dev server
bun --bun run dev

# Type check
bun x tsc --noEmit --skipLibCheck

# Format code
bun x biome format --write src/

# Lint code
bun run lint

# Run all checks (type + format + lint)
bun run check

# Build for production
bun --bun run build
```

## Troubleshooting

### Import not found
- Check if you're using the correct path alias `@/`
- Verify the component is exported from its index file
- Run `bun install` to ensure dependencies are up to date

### TypeScript errors
- Run `bun x tsc --noEmit --skipLibCheck` to see all errors
- Check that types are properly exported from `@/lib/types`
- Ensure server function inputs use proper validation schemas

### Formatting issues
- Run `bun x biome format --write src/` to auto-fix
- Check `biome.json` for configuration
- Ensure you're using tabs (not spaces) for indentation

### Hook re-render issues
- Check hook dependencies in useEffect/useMemo
- Verify hooks are being called at the top level
- Use React DevTools to inspect component renders

## Best Practices Checklist

When creating new code, ensure:

- [ ] Component is < 100 lines
- [ ] Business logic is in a custom hook
- [ ] Server-side code is in a server function
- [ ] Component has clear, typed props
- [ ] Component has a brief JSDoc comment
- [ ] Related code is in the same feature folder
- [ ] Index file exports the component
- [ ] TypeScript checks pass
- [ ] Code is formatted with Biome

## Testing Checklist

Before committing:

- [ ] Run `bun run check` (type + format + lint)
- [ ] Test in browser manually
- [ ] Check network tab for API calls
- [ ] Verify error handling works
- [ ] Check responsive design (mobile/tablet)
- [ ] Test keyboard navigation
- [ ] Verify no console errors

## File Size Guidelines

| File Type | Target Size | Max Size | Action if Exceeded |
|-----------|-------------|----------|-------------------|
| Route | 50-150 lines | 200 lines | Extract hooks/components |
| Component | 30-80 lines | 100 lines | Split into smaller components |
| Hook | 40-100 lines | 150 lines | Split into multiple hooks |
| Server Function | 20-60 lines | 80 lines | Split by domain |

## Common Gotchas

1. **Server Functions**: Always use `createServerFn`, never export regular functions from route files
2. **Hooks**: Must start with `use` and follow React hooks rules
3. **Imports**: Use `@/` alias, not relative paths like `../../`
4. **Types**: Import types from `@/lib/types`, not inline definitions
5. **Formatting**: Use tabs (project uses Biome with tabs)
6. **Bun**: Use `bun` commands, not npm/yarn/pnpm

## Useful Resources

- [REFACTORING_SUMMARY.md](./REFACTORING_SUMMARY.md) - Detailed refactoring report
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Complete architecture documentation
- [TanStack Router Docs](https://tanstack.com/router/latest)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Biome Docs](https://biomejs.dev)

---

**Quick Links:**
- Login: `src/routes/index.tsx`
- Calendar: `src/routes/calendar.tsx`
- Hooks: `src/hooks/`
- Components: `src/components/features/`
- Server: `src/lib/server/`
