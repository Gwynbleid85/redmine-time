# TanStack Start - Redmine Time Tracker Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      ROUTES LAYER                           │
│  - Minimal orchestration logic                             │
│  - Route definitions and loaders                           │
│  - Compose hooks and components                            │
├─────────────────────────────────────────────────────────────┤
│  /index.tsx (Login) - 56 lines                             │
│  /calendar.tsx (Calendar) - 193 lines                      │
└─────────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   CUSTOM HOOKS LAYER                        │
│  - State management                                         │
│  - Data fetching logic                                      │
│  - Business logic                                           │
├─────────────────────────────────────────────────────────────┤
│  useCalendarNavigation - Calendar date state (28 lines)     │
│  useTimeEntries - Data fetching & enrichment (73 lines)     │
│  useTimeEntryMutations - CRUD operations (134 lines)        │
│  useApiKeyManagement - API key lifecycle (100 lines)        │
└─────────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            ↓              ↓              ↓
┌──────────────────┐ ┌─────────────┐ ┌──────────────────┐
│ FEATURE          │ │   SERVER    │ │   COMPONENTS     │
│ COMPONENTS       │ │   FUNCTIONS │ │   LAYER          │
│                  │ │             │ │                  │
│ auth/            │ │ auth.ts     │ │ Presentation     │
│ api-key/         │ │ api-key.ts  │ │ UI logic only    │
│ calendar/        │ │             │ │ Pure components  │
│ time-entries/    │ │             │ │                  │
└──────────────────┘ └─────────────┘ └──────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA ACCESS LAYER                         │
│  - Redmine API integration                                  │
│  - Type definitions                                         │
│  - Utilities                                                │
├─────────────────────────────────────────────────────────────┤
│  api.redmine.ts - TanStack Start server functions          │
│  types.ts - TypeScript type definitions                     │
│  utils.ts - Shared utilities                                │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### Login Page (`/index.tsx`)

```
App
├── LoginLogo (large) - Clickable to show login
└── LoginForm
    ├── LoginLogo (small)
    ├── Input (username)
    ├── Input (password)
    └── Button (submit)
```

### Calendar Page (`/calendar.tsx`)

```
CalendarPage
├── Header
│   ├── Title
│   └── ApiKeyButton
│
├── ApiKeyWarning (conditional)
│
├── CalendarHeader
│   ├── Navigation buttons
│   ├── Current month/year display
│   └── Add task button
│
├── CalendarLoading (conditional)
│
├── CalendarError (conditional)
│
├── CalendarSummary
│   ├── Total entries count
│   └── Total hours
│
├── CalendarGrid
│   └── CalendarDay (× ~35 days)
│       └── TaskItem (× n tasks per day)
│           └── DropdownMenu (edit, duplicate, delete)
│
├── TaskDetailDialog (modal)
│   ├── Task details
│   └── Action buttons
│
├── TaskDialog (modal - create/edit)
│   └── Form fields
│
└── ApiKeyDialog (modal)
    ├── Input (API key)
    └── Buttons (save, logout, cancel)
```

## Data Flow

### Authentication Flow

```
1. User clicks logo 3 times
   ↓
2. LoginForm appears
   ↓
3. User enters credentials
   ↓
4. App validates against hardcoded values
   ↓
5. cookieSettingServerFn sets auth cookie
   ↓
6. Navigate to /calendar
```

### API Key Management Flow

```
1. User opens ApiKeyDialog
   ↓
2. User enters API key
   ↓
3. validateAndSetApiKeyFn validates with Redmine API
   ↓
4. If valid: setCookie, fetch user info, refresh data
   ↓
5. If invalid: show error message
```

### Time Entry CRUD Flow

```
┌─────────────────┐
│  User Action    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Component      │
│  Event Handler  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Custom Hook    │
│  (useTimeEntry  │
│   Mutations)    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  TanStack Query │
│  Mutation       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Server         │
│  Function       │
│  (api.redmine)  │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Redmine API    │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Invalidate     │
│  Queries &      │
│  Refresh UI     │
└─────────────────┘
```

## File Organization Principles

### 1. Feature-Based Organization

Components are organized by feature, not by type:

```
✅ GOOD: Feature-based
components/features/
├── auth/
│   ├── login-form.tsx
│   └── login-logo.tsx
├── calendar/
│   ├── calendar-grid.tsx
│   └── calendar-summary.tsx

❌ BAD: Type-based
components/
├── forms/
│   └── login-form.tsx
├── logos/
│   └── login-logo.tsx
```

**Why?** Related code stays together, making it easier to understand and modify features.

### 2. Custom Hooks for Logic

Business logic lives in hooks, not components:

```
✅ GOOD: Logic in hooks
// hooks/useCalendarNavigation.ts
export function useCalendarNavigation() {
  const [currentDate, setCurrentDate] = useState(new Date());
  // ... navigation logic
  return { currentDate, handleNext, handlePrev };
}

// Component uses the hook
function CalendarPage() {
  const { currentDate, handleNext, handlePrev } = useCalendarNavigation();
  return <Calendar date={currentDate} />;
}

❌ BAD: Logic in components
function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const handleNext = () => { /* logic */ };
  const handlePrev = () => { /* logic */ };
  // ... lots of logic in component
}
```

**Why?** Hooks are reusable, testable, and keep components focused on presentation.

### 3. Server Functions by Domain

Server functions are organized by domain, not mixed together:

```
✅ GOOD: Domain-based
lib/server/
├── auth.ts          (authentication)
├── api-key.ts       (API key management)
└── time-entries.ts  (time entry operations)

❌ BAD: Mixed together
lib/
└── server-functions.ts  (all server functions)
```

**Why?** Clear boundaries, easier to find related functions, better for code splitting.

### 4. Index Files for Clean Imports

Each feature folder has an index file:

```typescript
// components/features/calendar/index.ts
export { CalendarGrid } from "./calendar-grid";
export { CalendarSummary } from "./calendar-summary";

// Usage
import { CalendarGrid, CalendarSummary } from "@/components/features/calendar";
```

**Why?** Cleaner imports, easier refactoring, better developer experience.

## State Management Strategy

### 1. Server State (TanStack Query)
- **What**: Data from Redmine API
- **Where**: Custom hooks (`useTimeEntries`, `useTimeEntryMutations`)
- **Why**: Automatic caching, revalidation, optimistic updates

### 2. UI State (React useState)
- **What**: Dialog open/close, selected items, form inputs
- **Where**: Route components and feature components
- **Why**: Simple, local state doesn't need global management

### 3. Navigation State (TanStack Router)
- **What**: Current route, route params
- **Where**: Route definitions and `useNavigate`
- **Why**: URL as source of truth for navigation

### 4. Form State (Controlled Components)
- **What**: Input values, validation
- **Where**: Form components (`LoginForm`, `TaskDialog`)
- **Why**: React-controlled inputs for consistency

## Testing Strategy

### Unit Tests

```typescript
// hooks/__tests__/useCalendarNavigation.test.ts
test("should navigate to next month", () => {
  const { result } = renderHook(() => useCalendarNavigation());
  act(() => result.current.handleNextMonth());
  expect(result.current.currentDate.getMonth()).toBe(nextMonth);
});

// components/features/calendar/__tests__/calendar-summary.test.tsx
test("should display correct stats", () => {
  const { getByText } = render(<CalendarSummary tasks={mockTasks} />);
  expect(getByText("10")).toBeInTheDocument(); // task count
});
```

### Integration Tests

```typescript
// routes/__tests__/calendar.test.tsx
test("should load calendar with tasks", async () => {
  render(<CalendarPage />);
  await waitFor(() => {
    expect(screen.getByText(/time entries/i)).toBeInTheDocument();
  });
});
```

### E2E Tests

```typescript
// e2e/calendar.spec.ts
test("should create new time entry", async ({ page }) => {
  await page.goto("/calendar");
  await page.click('[data-testid="add-task"]');
  await page.fill('[data-testid="task-title"]', "New task");
  await page.click('[data-testid="submit"]');
  await expect(page.locator("text=New task")).toBeVisible();
});
```

## Performance Considerations

### 1. Code Splitting
- Route-based splitting (automatic with TanStack Router)
- Feature-based splitting (lazy load dialogs)

### 2. Memoization
- Hooks return memoized values
- Components use `useMemo` for expensive calculations

### 3. Query Optimization
- Appropriate `staleTime` settings
- Selective query invalidation
- Batch API requests where possible

### 4. Component Optimization
- Small, focused components load faster
- Conditional rendering for dialogs
- Virtual scrolling for large lists (if needed)

## Security Considerations

### 1. API Key Storage
- Stored in HTTP-only cookies
- Not accessible from JavaScript
- Secure flag in production

### 2. Server Functions
- All API calls go through server functions
- No direct API access from client
- Server-side validation

### 3. Authentication
- Simple cookie-based auth
- Route guards prevent unauthorized access
- Server-side verification

## Deployment Considerations

### Environment Variables
```bash
REDMINE_BASE_URL=https://your-redmine-instance.com
NODE_ENV=production
```

### Build Command
```bash
bun run build
```

### Server Requirements
- Bun runtime
- HTTPS recommended
- Cookie support required

## Future Enhancements

### Short Term
1. Add loading skeletons
2. Implement error boundaries
3. Add toast notifications
4. Improve keyboard navigation

### Medium Term
1. Add offline support (PWA)
2. Implement optimistic UI updates
3. Add drag-and-drop for time entries
4. Weekly/daily view options

### Long Term
1. Real-time updates (WebSockets)
2. Team collaboration features
3. Advanced filtering and search
4. Export to PDF/Excel
5. Mobile app (React Native)

## Contributing Guidelines

### Adding New Features

1. **Create feature folder**:
   ```bash
   mkdir -p src/components/features/my-feature
   ```

2. **Create components**:
   ```typescript
   // src/components/features/my-feature/my-component.tsx
   export function MyComponent() { ... }
   ```

3. **Create hook if needed**:
   ```typescript
   // src/hooks/useMyFeature.ts
   export function useMyFeature() { ... }
   ```

4. **Update index files**:
   ```typescript
   // src/components/features/my-feature/index.ts
   export { MyComponent } from "./my-component";

   // src/hooks/index.ts
   export { useMyFeature } from "./useMyFeature";
   ```

5. **Use in route**:
   ```typescript
   // src/routes/my-page.tsx
   import { MyComponent } from "@/components/features/my-feature";
   import { useMyFeature } from "@/hooks";
   ```

### Code Style

- Follow existing patterns
- Use TypeScript strict mode
- Format with Biome: `bun run format`
- Lint with oxlint: `bun run lint`
- Check types: `bun run check`

### Git Workflow

1. Create feature branch from `main`
2. Make changes following architecture patterns
3. Run `bun run check` before committing
4. Create PR with clear description
5. Request review from team

---

**Last Updated**: October 2025
**Version**: 2.0.0 (Post-Refactoring)
