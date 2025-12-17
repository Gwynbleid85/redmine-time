# Architecture Overview

## Project Type
**Redmine Time Tracking Calendar Application**

This is a full-stack SSR-enabled React application built with TanStack Start that integrates with Redmine's API to provide a visual calendar interface for managing time entries.

## Technology Stack

### Core Framework
- **TanStack Start** - SSR-enabled React meta-framework
- **React 19** - Latest React version with concurrent features
- **Bun** - Fast JavaScript runtime and package manager

### Routing & Data
- **TanStack Router** - File-based routing with type-safe navigation
- **TanStack Query (React Query)** - Server state management and data fetching
- **TanStack Router SSR Query Integration** - Seamless SSR hydration

### Styling & UI
- **Tailwind CSS v4** - Utility-first CSS framework (latest major version)
- **shadcn/ui** - Accessible component library built on Radix UI
- **Radix UI** - Unstyled, accessible component primitives
- **lucide-react** - Icon library

### Forms & Validation
- **React Hook Form** - Performant form library
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Form validation integration

### Development Tools
- **Biome** - Fast linter and formatter (replaces ESLint + Prettier)
- **TypeScript 5.7** - Type safety with strict mode
- **Vitest** - Fast unit testing framework
- **Vite 7** - Build tool and dev server

### Server Integration
- **Nitro v2** - Universal server framework for SSR
- **TanStack Server Functions** - Type-safe server-side functions

## Application Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (React Components + shadcn/ui)         │
│  - Pages (routes/*.tsx)                 │
│  - Components (components/*.tsx)        │
│  - UI Components (components/ui/*.tsx)  │
└─────────────────────────────────────────┘
              ↓ TanStack Query
┌─────────────────────────────────────────┐
│           Data Layer                    │
│  (TanStack Query + Server Functions)    │
│  - Queries (useQuery hooks)             │
│  - Mutations (useMutation hooks)        │
│  - Server Functions (api.redmine.ts)    │
└─────────────────────────────────────────┘
              ↓ HTTP Requests
┌─────────────────────────────────────────┐
│         External API Layer              │
│       (Redmine REST API)                │
│  - Time Entries API                     │
│  - Issues API                           │
│  - Projects API                         │
└─────────────────────────────────────────┘
```

### Key Architectural Patterns

#### 1. Server-Side Rendering (SSR)
- Routes can have loaders that run on the server
- Initial page load is server-rendered for performance
- Automatic hydration on the client side
- Shell component wraps the entire app in SSR mode

#### 2. File-Based Routing
- Routes auto-discovered from `src/routes/` directory
- Route tree auto-generated in `src/routeTree.gen.ts`
- No manual route configuration needed

#### 3. Server Functions (CORS Proxy)
- Server functions in `src/lib/api.redmine.ts` proxy Redmine API calls
- Circumvents CORS restrictions
- Type-safe with Zod validation
- Run exclusively on the server

#### 4. Query-Router Integration
- `QueryClient` available in route context
- Seamless SSR data prefetching
- Automatic cache hydration

#### 5. Component Composition
- Presentation components separate from business logic
- Custom application components use shadcn/ui primitives
- Shared UI components in `components/ui/`

## Project Structure

```
ft2/
├── .claude/              # Claude Code configuration
│   ├── ref/             # Reference documentation (this folder)
│   └── settings.local.json
├── src/
│   ├── routes/          # File-based routes (pages)
│   │   ├── __root.tsx   # Root layout
│   │   ├── index.tsx    # Home page
│   │   └── calendar.tsx # Main calendar page
│   ├── components/      # React components
│   │   ├── ui/         # shadcn/ui components
│   │   ├── calendar-*.tsx  # Calendar components
│   │   └── task-*.tsx      # Task components
│   ├── lib/            # Utilities and API
│   │   ├── api.redmine.ts    # Server functions
│   │   ├── types.ts          # App type definitions
│   │   ├── redmine-types.ts  # Redmine API types
│   │   └── utils.ts          # Helper functions
│   ├── integrations/   # Third-party integrations
│   │   └── tanstack-query/  # Query provider setup
│   ├── hooks/          # Custom React hooks
│   ├── router.tsx      # Router configuration
│   ├── routeTree.gen.ts # Auto-generated routes
│   └── styles.css      # Global styles
├── public/             # Static assets
├── vite.config.ts      # Vite configuration
├── tsconfig.json       # TypeScript configuration
├── biome.json          # Biome linter/formatter config
├── components.json     # shadcn/ui configuration
├── package.json        # Dependencies and scripts
└── CLAUDE.md           # Project instructions
```

## Configuration Files

### Key Configuration

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite plugins, build settings, path aliases |
| `tsconfig.json` | TypeScript strict mode, path mappings |
| `biome.json` | Linting and formatting rules |
| `components.json` | shadcn/ui configuration |
| `package.json` | Dependencies and scripts |
| `.env` | Environment variables (Redmine credentials) |

## Environment Variables

Required for Redmine integration:

```bash
REDMINE_BASE_URL=https://your-redmine-instance.com
REDMINE_API_KEY=your_api_key_here
REDMINE_USER_ID=your_user_id
```

## Build & Deployment

### Development
- SSR-enabled dev server with hot reload
- Runs on port 3000
- Devtools enabled (Router + Query panels)

### Production
- Static assets bundled with Vite
- Server code bundled with Nitro
- Can deploy to:
  - Node.js servers
  - Serverless platforms (Vercel, Netlify)
  - Edge runtimes

## Key Features

1. **Calendar View** - Monthly calendar displaying time entries
2. **Time Entry CRUD** - Create, read, update, delete time entries
3. **Issue Integration** - Fetch and display issue details
4. **Duplicate Entries** - Quick duplication of time entries
5. **Real-time Updates** - Query invalidation on mutations
6. **SSR Performance** - Fast initial page loads
7. **Type Safety** - End-to-end TypeScript
8. **Responsive Design** - Mobile-friendly with Tailwind
9. **Accessible UI** - WCAG compliant with Radix UI

## Next Steps

For detailed implementation specifics, see:
- [02-routing-system.md](./02-routing-system.md) - Routing architecture
- [03-data-fetching.md](./03-data-fetching.md) - Data layer patterns
- [04-components.md](./04-components.md) - Component structure
- [05-redmine-integration.md](./05-redmine-integration.md) - API integration
