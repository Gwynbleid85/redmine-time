# Routing System

## Overview

The application uses **TanStack Router** with file-based routing. Routes are automatically discovered from the `src/routes/` directory and compiled into a type-safe route tree.

## File-Based Routing

### Route Discovery

Routes are files in `src/routes/` that export a `Route` object created with TanStack Router's `createFileRoute` or `createRootRouteWithContext`.

### Route Naming Convention

| File Pattern | URL Pattern | Description |
|--------------|-------------|-------------|
| `index.tsx` | `/` | Home page |
| `calendar.tsx` | `/calendar` | Calendar page |
| `about.tsx` | `/about` | About page |
| `__root.tsx` | n/a | Root layout (wraps all routes) |
| `api.*.ts` | n/a | Server functions (not routes) |
| `demo.*.tsx` | `/demo/*` | Demo routes (can be deleted) |

### Current Routes

```
src/routes/
├── __root.tsx              # Root layout with shell
├── index.tsx               # Home page (/)
├── calendar.tsx            # Calendar page (/calendar)
├── demo.start.api-request.tsx       # Demo: API requests
├── demo.start.server-funcs.tsx      # Demo: Server functions
├── demo.tanstack-query.tsx          # Demo: TanStack Query
├── api.demo-names.ts                # Server function
└── api.demo-tq-todos.ts             # Server function
```

## Root Route (`__root.tsx`)

**Location:** `src/routes/__root.tsx`

The root route defines the application shell and provides context to all child routes.

### Key Features

```tsx
interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [/* metadata */],
    links: [/* stylesheets */]
  }),
  shellComponent: RootDocument,
});
```

#### Shell Component

The `RootDocument` component wraps the entire application:

```tsx
function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        {children}
        <TanStackDevtools /* devtools config */ />
        <Scripts />
      </body>
    </html>
  );
}
```

**Elements:**
- `<HeadContent />` - Injects meta tags and links
- `<Header />` - Global navigation header
- `{children}` - Rendered route content
- `<TanStackDevtools />` - Devtools panel (dev only)
- `<Scripts />` - Client-side scripts

### Context Propagation

The root route provides `QueryClient` in context, making it available to all routes:

```tsx
// In router.tsx
const router = createRouter({
  routeTree,
  context: { queryClient },
  // ...
});
```

## Route Configuration (`router.tsx`)

**Location:** `src/router.tsx`

### Router Setup

```tsx
export const getRouter = () => {
  const rqContext = TanstackQuery.getContext();

  const router = createRouter({
    routeTree,                    // Auto-generated from routes/
    context: { ...rqContext },    // QueryClient context
    defaultPreload: "intent",     // Preload on hover/focus
    Wrap: (props) => (            // Wrap with Query provider
      <TanstackQuery.Provider {...rqContext}>
        {props.children}
      </TanstackQuery.Provider>
    ),
  });

  // Setup SSR integration
  setupRouterSsrQueryIntegration({
    router,
    queryClient: rqContext.queryClient,
  });

  return router;
};
```

### Key Configuration Options

| Option | Value | Description |
|--------|-------|-------------|
| `routeTree` | Auto-generated | Route tree from `routeTree.gen.ts` |
| `context` | `{ queryClient }` | Context available to all routes |
| `defaultPreload` | `"intent"` | Preload routes on hover/focus |
| `Wrap` | Query Provider | Wraps app with TanStack Query provider |

## Route Components

### Creating a New Route

**Example:** `src/routes/about.tsx`

```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div>
      <h1>About Us</h1>
      <p>Welcome to our application!</p>
    </div>
  );
}
```

**Steps:**
1. Create file in `src/routes/` (e.g., `about.tsx`)
2. Export `Route` using `createFileRoute`
3. Define component function
4. Router auto-generates route configuration

### Route with Loader

**Example:** Data fetching on the server

```tsx
export const Route = createFileRoute('/calendar')({
  loader: async ({ context }) => {
    // Runs on server during SSR
    const data = await fetch('/api/data');
    return data.json();
  },
  component: () => {
    const data = Route.useLoaderData();
    return <div>{data}</div>;
  }
});
```

### Route with Context

Access context in components:

```tsx
function MyComponent() {
  const { queryClient } = Route.useRouteContext();
  // Use queryClient...
}
```

## Navigation

### Link Component

```tsx
import { Link } from '@tanstack/react-router';

<Link to="/calendar">Go to Calendar</Link>
```

### Programmatic Navigation

```tsx
import { useNavigate } from '@tanstack/react-router';

function MyComponent() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate({ to: '/calendar' });
  };

  return <button onClick={handleClick}>Go</button>;
}
```

## Auto-Generated Route Tree

**Location:** `src/routeTree.gen.ts`

This file is **auto-generated** by TanStack Router and should **never be edited manually**.

### Generation

The route tree is regenerated when:
- Dev server starts
- Routes are added/modified
- Build process runs

### Structure

```tsx
// Auto-generated
const rootRoute = RootRoute
const indexRoute = IndexRoute.update({ /* ... */ })
const calendarRoute = CalendarRoute.update({ /* ... */ })

export const routeTree = rootRoute.addChildren([
  indexRoute,
  calendarRoute,
  // ...
])
```

## Server Functions (API Routes)

**Pattern:** `api.*.ts` files in `src/routes/`

These are **not routes** but server-side functions exposed as API endpoints.

### Example: `api.demo-names.ts`

```tsx
import { createServerFn } from '@tanstack/react-start';

export const getNames = createServerFn({ method: 'GET' })
  .handler(async () => {
    return ['Alice', 'Bob', 'Charlie'];
  });
```

**Usage in Components:**

```tsx
const { data } = useQuery({
  queryKey: ['names'],
  queryFn: () => getNames()
});
```

## SSR Integration

### Router-Query Integration

**Location:** `src/router.tsx`

```tsx
setupRouterSsrQueryIntegration({
  router,
  queryClient: rqContext.queryClient,
});
```

This enables:
1. **Server-side data prefetching** - Queries run during SSR
2. **Automatic hydration** - Client picks up server state
3. **Deduplication** - No duplicate requests on hydration

### How It Works

```
Server (SSR):
1. Route loader runs → fetches data
2. QueryClient caches data
3. HTML rendered with data
4. Dehydrated state sent to client

Client (Hydration):
1. Router mounts
2. QueryClient rehydrates from server state
3. No duplicate requests
4. UI interactive immediately
```

## Route Loading States

### Pending Navigation

```tsx
import { useRouterState } from '@tanstack/react-router';

function LoadingIndicator() {
  const { status } = useRouterState();

  if (status === 'pending') {
    return <div>Loading...</div>;
  }

  return null;
}
```

## Devtools

### Router Devtools

Located in `__root.tsx`:

```tsx
<TanStackDevtools
  config={{ position: "bottom-left" }}
  plugins={[
    {
      name: "Tanstack Router",
      render: <TanStackRouterDevtoolsPanel />,
    },
    // ...
  ]}
/>
```

**Features:**
- Inspect current route
- View route tree
- See matched routes
- Debug route params

## Best Practices

### 1. Use File-Based Routing
✅ Create new files for new routes
❌ Don't manually edit `routeTree.gen.ts`

### 2. Loaders for SSR Data
✅ Use loaders for critical data
❌ Don't fetch in component mount

### 3. Type-Safe Navigation
✅ Use `<Link to="/calendar" />` (type-checked)
❌ Avoid string-based navigation

### 4. Context Access
✅ Access context via `useRouteContext()`
❌ Don't prop-drill `queryClient`

### 5. Server Functions
✅ Use server functions for API calls
❌ Don't call external APIs from client

## Common Patterns

### Protected Routes

```tsx
export const Route = createFileRoute('/dashboard')({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: DashboardPage,
});
```

### Route with Search Params

```tsx
export const Route = createFileRoute('/search')({
  validateSearch: (search) => ({
    query: search.query ?? '',
    page: search.page ?? 1,
  }),
  component: () => {
    const { query, page } = Route.useSearch();
    return <div>Search: {query}, Page: {page}</div>;
  }
});
```

## Troubleshooting

### Route Not Found
- Check file is in `src/routes/`
- Restart dev server to regenerate route tree
- Verify export statement

### Context Undefined
- Ensure `MyRouterContext` interface matches context object
- Check root route defines context correctly
- Verify router wrapper includes Query provider

### SSR Hydration Mismatch
- Ensure server and client render same initial state
- Check data is properly dehydrated/rehydrated
- Verify no client-only code in SSR path
