# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **TanStack Start** application with **React 19**, using **file-based routing** via TanStack Router. The project includes a calendar/task management interface and is configured with **Tailwind CSS v4**, **shadcn/ui components**, **TanStack Query** for data fetching, and **Biome** for linting/formatting.

## Core Technologies

- **Runtime**: Bun (use `bun` or `bun --bun` for commands)
- **Framework**: TanStack Start (SSR-enabled React meta-framework)
- **Router**: TanStack Router (file-based routing)
- **Data Fetching**: TanStack Query (React Query) with SSR integration
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **Linting/Formatting**: Biome (not ESLint/Prettier)

## Essential Commands

```bash
# Development
bun install                    # Install dependencies
bun --bun run start           # Start dev server on port 3000
bun --bun run dev             # Alternative dev command

# Build & Deploy
bun --bun run build           # Production build

# Quality Checks
bun --bun run check           # Run Biome linter + formatter (use this often!)
bun --bun run lint            # Lint only
bun --bun run format          # Format only

# Testing
bun --bun run test            # Run Vitest tests
```

**IMPORTANT**: Always run `bun check` frequently during development to catch linting and formatting issues early. Use the **Ping-Pong Check Technique** when debugging: run `bun check`, fix first error, repeat.

## File-Based Routing Architecture

Routes live in `src/routes/` and are automatically discovered by TanStack Router:

- `src/routes/__root.tsx` - Root layout with shell component
- `src/routes/index.tsx` - Home route (`/`)
- `src/routes/demo.*.tsx` - Demo routes (can be deleted)
- `src/routes/api.*.ts` - API routes (server functions)
- `src/routeTree.gen.ts` - Auto-generated, do not edit manually

### Creating New Routes

1. Add a new file in `src/routes/` (e.g., `about.tsx`)
2. TanStack Router auto-generates the route configuration
3. Use `<Link to="/about">` for navigation

### Route Context

The router is configured with `QueryClient` in context (see `src/router.tsx`). All routes have access to TanStack Query via `MyRouterContext`.

## Data Fetching Patterns

### Option 1: TanStack Router Loaders

```tsx
export const Route = createFileRoute('/people')({
  loader: async ({ context }) => {
    const data = await fetch('/api/people')
    return data.json()
  },
  component: () => {
    const data = Route.useLoaderData()
    return <div>{data}</div>
  }
})
```

### Option 2: TanStack Query Hooks

```tsx
const { data } = useQuery({
  queryKey: ['people'],
  queryFn: () => fetch('/api/people').then(r => r.json())
})
```

### SSR Integration

Router and Query are integrated via `setupRouterSsrQueryIntegration` in `src/router.tsx`. This enables automatic hydration and SSR data prefetching.

## Component Structure

- `src/components/ui/*` - shadcn/ui components (installed via `pnpx shadcn@latest add <component>`)
- `src/components/*` - Custom application components
- `src/lib/utils.ts` - Contains `cn()` utility for merging Tailwind classes

### Adding shadcn Components

```bash
pnpx shadcn@latest add button     # Add button component
pnpx shadcn@latest add dialog     # Add dialog component
```

Components are added to `src/components/ui/` and can be imported as `@/components/ui/<component>`.

## Path Aliases

The project uses `@/*` for imports mapped to `src/*`:

```tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
```

Configured via:
- `tsconfig.json` - TypeScript path mapping
- `vite.config.ts` - `vite-tsconfig-paths` plugin

## Styling

- **Tailwind CSS v4** via `@tailwindcss/vite` plugin
- Use the `cn()` utility from `@/lib/utils` to merge class names:
  ```tsx
  <div className={cn("base-class", conditionalClass && "conditional")} />
  ```
- Tailwind config is in Tailwind v4 format (CSS-based, not JS config)

## Biome Configuration

**CRITICAL**: This project uses Biome, NOT ESLint or Prettier.

- Config: `biome.json`
- Formatting: Tabs (not spaces), double quotes
- Ignores: `src/routeTree.gen.ts` (auto-generated)
- Always run `bun check` before committing

## TypeScript Configuration

Strict mode enabled with:
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`

Module resolution is set to `bundler` mode (Vite-specific).

## Devtools

The app includes integrated devtools in `src/routes/__root.tsx`:

- **TanStack Devtools** - Unified devtools panel (bottom-left)
  - Router panel (route inspection)
  - Query panel (cache inspection)

Devtools are visible in development mode only.

## Server Functions & API Routes

TanStack Start supports server functions via `createServerFn`:

```tsx
// src/routes/api.demo-names.ts
export const getNames = createServerFn({ method: 'GET' })
  .handler(async () => {
    return ['Alice', 'Bob', 'Charlie']
  })
```

API routes follow the pattern `api.*.ts` in the routes directory.

## Demo Files

Files prefixed with `demo` can be safely deleted:
- `src/routes/demo.*.tsx`
- `src/routes/api.demo-*.ts`

They exist to demonstrate TanStack Start features.

## Key Architectural Notes

1. **SSR-First**: This is a server-rendered app. Routes can have loaders that run on the server.
2. **Query Integration**: TanStack Query is deeply integrated with the router for SSR hydration.
3. **File-Based Routes**: Routes are discovered automatically; no manual route registration.
4. **Context Propagation**: `QueryClient` is available in route context via `MyRouterContext`.
5. **Shell Architecture**: The root route uses `shellComponent` to wrap the entire app in SSR mode.

## Vite Plugins (in load order)

1. `nitroV2Plugin()` - Nitro v2 for server-side rendering
2. `viteTsConfigPaths()` - Path alias resolution
3. `tailwindcss()` - Tailwind CSS v4
4. `tanstackStart()` - TanStack Start integration
5. `viteReact()` - React plugin

## Common Pitfalls

- Don't edit `src/routeTree.gen.ts` - it's auto-generated
- Use `bun --bun` prefix for commands when you need native Bun mode
- Run `bun check` frequently (Ping-Pong Check Technique)
- Use `@/` imports, not relative paths like `../../`
- Remember this is SSR - not all browser APIs are available in loaders

---

## Detailed Implementation Reference

For comprehensive implementation details, see the reference documentation in `.claude/ref/`:

### Core Documentation

1. **[Architecture Overview](./.claude/ref/01-architecture-overview.md)** - Complete project architecture, tech stack, and structural patterns
2. **[Routing System](./.claude/ref/02-routing-system.md)** - Detailed routing patterns, navigation, and SSR integration
3. **[Data Fetching](./.claude/ref/03-data-fetching.md)** - TanStack Query patterns, server functions, and cache management
4. **[Components](./.claude/ref/04-components.md)** - Component architecture, UI library, and styling conventions
5. **[Redmine Integration](./.claude/ref/05-redmine-integration.md)** - API integration, types, data transformation, and environment setup
6. **[Development Guide](./.claude/ref/06-development-guide.md)** - Development workflows, debugging, and best practices

### Quick Start

For a comprehensive quick start guide and navigation through all documentation, see **[.claude/ref/README.md](./.claude/ref/README.md)**.

### When to Consult Reference Docs

- **Architecture Overview**: Understanding overall project structure, adding major features
- **Routing System**: Creating new pages, debugging routing issues, working with loaders
- **Data Fetching**: Implementing queries/mutations, working with Redmine API
- **Components**: Building UI, using shadcn/ui components, styling patterns
- **Redmine Integration**: Working with time entries/issues, API troubleshooting
- **Development Guide**: Daily development tasks, debugging, troubleshooting common issues
