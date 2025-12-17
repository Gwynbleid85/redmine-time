# Implementation Reference Documentation

This directory contains comprehensive reference documentation for the Redmine Time Tracking Calendar application.

## Quick Navigation

### Getting Started
- **[01 - Architecture Overview](./01-architecture-overview.md)** - Project structure, tech stack, and architectural patterns
- **[06 - Development Guide](./06-development-guide.md)** - Quick start, essential commands, and workflows

### Core Systems
- **[02 - Routing System](./02-routing-system.md)** - File-based routing, navigation, and SSR
- **[03 - Data Fetching](./03-data-fetching.md)** - TanStack Query, server functions, and state management
- **[04 - Components](./04-components.md)** - UI components, application components, and patterns
- **[05 - Redmine Integration](./05-redmine-integration.md)** - API integration, types, and data transformation

## Document Summaries

### 01 - Architecture Overview
**Purpose:** High-level project architecture and technology stack overview

**Key Topics:**
- Technology stack (TanStack Start, React 19, Tailwind CSS v4)
- Three-layer architecture (Presentation, Data, API)
- Project structure and file organization
- Configuration files
- Build and deployment

**When to Read:** First time working with the project, understanding overall architecture

---

### 02 - Routing System
**Purpose:** Understand TanStack Router file-based routing

**Key Topics:**
- File-based route discovery
- Root route and shell component
- Route configuration and context
- Navigation patterns
- SSR integration
- Server functions vs routes

**When to Read:** Adding new pages, working with navigation, debugging route issues

---

### 03 - Data Fetching
**Purpose:** Master TanStack Query patterns and server functions

**Key Topics:**
- Query setup and configuration
- useQuery and useMutation patterns
- Query keys and invalidation
- Server functions (CORS proxy)
- SSR data prefetching
- Cache management

**When to Read:** Fetching data, creating mutations, working with Redmine API

---

### 04 - Components
**Purpose:** Understand component architecture and UI library

**Key Topics:**
- shadcn/ui component system
- Application components (Calendar, Task)
- Component patterns and best practices
- Styling with Tailwind CSS
- Type definitions
- Custom hooks

**When to Read:** Building UI, adding components, styling interfaces

---

### 05 - Redmine Integration
**Purpose:** Work with Redmine API integration

**Key Topics:**
- Server function architecture
- API endpoints (CRUD operations)
- Type definitions (Redmine and application)
- Data transformation
- Error handling
- Environment configuration

**When to Read:** Working with Redmine API, debugging API issues, adding API features

---

### 06 - Development Guide
**Purpose:** Day-to-day development workflows and best practices

**Key Topics:**
- Quick start and setup
- Essential commands
- Development workflows (Ping-Pong Check Technique)
- Adding features (pages, components, hooks)
- Configuration
- Debugging
- Troubleshooting

**When to Read:** Daily development, adding features, debugging issues

## Quick Reference

### Essential Commands

```bash
# Development
bun --bun run start          # Start dev server
bun check                    # Run all checks (use frequently!)

# Code Quality
bun lint                     # Lint code
bun format                   # Format code
tsc --noEmit                 # Type check

# Testing
bun test                     # Run tests
bun test --watch            # Watch mode

# Build
bun build                    # Production build
```

### Common Patterns

#### Fetch Data with Query
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['timeEntries', from, to],
  queryFn: () => getTimeEntries({ data: { from, to } }),
});
```

#### Mutate Data
```tsx
const mutation = useMutation({
  mutationFn: (params) => updateTimeEntry({ data: params }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
  },
});
```

#### Create New Route
```tsx
// src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  return <div>About</div>;
}
```

#### Add shadcn Component
```bash
pnpx shadcn@latest add button
```

## File Locations Quick Reference

| What | Where |
|------|-------|
| Pages | `src/routes/*.tsx` |
| Components | `src/components/*.tsx` |
| UI Components | `src/components/ui/*.tsx` |
| Server Functions | `src/lib/api.redmine.ts` |
| Types | `src/lib/types.ts` |
| Utilities | `src/lib/utils.ts` |
| Hooks | `src/hooks/*.ts` |
| Styles | `src/styles.css` |
| Config | `vite.config.ts`, `tsconfig.json`, `biome.json` |

## Workflow Quick Reference

### Adding a New Feature

1. Create new route file in `src/routes/`
2. Create components in `src/components/`
3. Add server functions if needed in `src/lib/api.redmine.ts`
4. Add types in `src/lib/types.ts`
5. Run `bun check` frequently
6. Test locally
7. Commit with conventional commit message

### Debugging Issues

1. Check console logs (browser and terminal)
2. Use TanStack Devtools (Router + Query panels)
3. Run `tsc --noEmit` for type errors
4. Check Network tab for API requests
5. Verify environment variables in `.env`

### Before Committing

```bash
bun check    # Lint, format, and type check
bun test     # Run tests
```

## Additional Resources

- **CLAUDE.md** - Main project documentation (in project root)
- **TanStack Router Docs** - https://tanstack.com/router/latest
- **TanStack Query Docs** - https://tanstack.com/query/latest
- **shadcn/ui Docs** - https://ui.shadcn.com
- **Redmine API Docs** - https://www.redmine.org/projects/redmine/wiki/Rest_api

## Document Maintenance

These documents should be updated when:
- Architecture changes significantly
- New patterns are introduced
- Core dependencies are upgraded
- Best practices evolve

Last Updated: 2025-10-10
