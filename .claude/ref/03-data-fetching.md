# Data Fetching & State Management

## Overview

The application uses **TanStack Query (React Query v5)** for server state management, integrated with **TanStack Router** for SSR support. Server functions proxy Redmine API calls to circumvent CORS restrictions.

## TanStack Query Setup

### Query Provider

**Location:** `src/integrations/tanstack-query/root-provider.tsx`

```tsx
export const getContext = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
      },
    },
  });

  return { queryClient };
};

export const Provider = ({ children, queryClient }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);
```

### Default Query Options

| Option | Value | Description |
|--------|-------|-------------|
| `staleTime` | 5 minutes | Data considered fresh for 5 minutes |
| `retry` | 1 | Retry failed queries once |
| `refetchOnWindowFocus` | true (default) | Refetch when window regains focus |
| `refetchOnReconnect` | true (default) | Refetch when network reconnects |

## Data Fetching Patterns

### Pattern 1: useQuery Hook

**Best for:** Fetching data in components

```tsx
import { useQuery } from '@tanstack/react-query';
import { getTimeEntries } from '@/lib/api.redmine';

function CalendarPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['timeEntries', dateRange.from, dateRange.to],
    queryFn: () => getTimeEntries({
      data: {
        userId: 'me',
        from: dateRange.from,
        to: dateRange.to,
        limit: 500,
      }
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return <CalendarView data={data} />;
}
```

### Pattern 2: Dependent Queries

**Best for:** Queries that depend on other query results

```tsx
// First query: Fetch time entries
const { data: timeEntries } = useQuery({
  queryKey: ['timeEntries', from, to],
  queryFn: () => getTimeEntries({ data: { from, to } }),
});

// Extract issue IDs from time entries
const issueIds = Array.from(new Set(
  timeEntries?.map(t => t.issueId).filter(Boolean) ?? []
));

// Second query: Fetch issue details (only runs if issueIds exist)
const { data: issuesMap } = useQuery({
  queryKey: ['issues', issueIds],
  queryFn: () => getIssuesByIds({ data: { issueIds } }),
  enabled: issueIds.length > 0, // Only run if we have IDs
  staleTime: 1000 * 60 * 10, // 10 minutes
});
```

### Pattern 3: Router Loader

**Best for:** SSR data prefetching

```tsx
export const Route = createFileRoute('/calendar')({
  loader: async ({ context }) => {
    // Runs on server during SSR
    await context.queryClient.prefetchQuery({
      queryKey: ['timeEntries'],
      queryFn: () => getTimeEntries({ data: { userId: 'me' } }),
    });
  },
  component: CalendarPage,
});
```

## Mutations

### useMutation Hook

**Best for:** Creating, updating, or deleting data

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function TaskEditor() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (params) => updateTimeEntry({ data: params }),
    onSuccess: () => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      setDialogOpen(false);
    },
    onError: (error) => {
      console.error('Failed to update:', error);
      toast.error('Update failed');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      id: 123,
      hours: 8,
      comments: 'Updated task',
    });
  };

  return (
    <button
      onClick={handleSave}
      disabled={updateMutation.isPending}
    >
      {updateMutation.isPending ? 'Saving...' : 'Save'}
    </button>
  );
}
```

### Common Mutation Patterns

#### Create

```tsx
const createMutation = useMutation({
  mutationFn: (newTask) => createTimeEntry({ data: newTask }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
  },
});
```

#### Update

```tsx
const updateMutation = useMutation({
  mutationFn: ({ id, ...updates }) =>
    updateTimeEntry({ data: { id, ...updates } }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
  },
});
```

#### Delete

```tsx
const deleteMutation = useMutation({
  mutationFn: (id) => deleteTimeEntry({ data: { id } }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
  },
});
```

#### Duplicate

```tsx
const duplicateMutation = useMutation({
  mutationFn: (id) => duplicateTimeEntry({ data: { id } }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
  },
});
```

## Query Keys

### Key Structure

Query keys are arrays that uniquely identify queries:

```tsx
// Simple key
['timeEntries']

// Key with parameters
['timeEntries', dateFrom, dateTo]

// Key with multiple parameters
['timeEntries', { userId: 'me', from: '2024-01-01', to: '2024-01-31' }]

// Issue keys
['issues', [123, 456, 789]]
```

### Key Hierarchy

```
['timeEntries']                    # All time entries
  ├── ['timeEntries', from, to]    # Specific date range
  └── ['timeEntries', userId]      # Specific user

['issues']                         # All issues
  └── ['issues', [ids]]            # Specific issues
```

### Query Invalidation

Invalidate all time entries:
```tsx
queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
```

Invalidate specific date range:
```tsx
queryClient.invalidateQueries({
  queryKey: ['timeEntries', '2024-01-01', '2024-01-31']
});
```

## Server Functions

**Location:** `src/lib/api.redmine.ts`

Server functions run exclusively on the server and proxy Redmine API calls.

### Creating a Server Function

```tsx
import { createServerFn } from '@tanstack/react-start';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

const GetTimeEntriesSchema = z.object({
  userId: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  limit: z.number().optional().default(100),
});

export const getTimeEntries = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(GetTimeEntriesSchema))
  .handler(async ({ data }) => {
    const baseUrl = process.env.REDMINE_BASE_URL;
    const apiKey = process.env.REDMINE_API_KEY;

    if (!baseUrl || !apiKey) {
      throw new Error('Redmine configuration missing');
    }

    const params = new URLSearchParams();
    if (data.userId) params.append('user_id', data.userId);
    if (data.from) params.append('from', data.from);
    if (data.to) params.append('to', data.to);

    const url = `${baseUrl}/time_entries.json?${params}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Redmine-API-Key': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Redmine API error: ${response.status}`);
    }

    const json = await response.json();
    return transformToTasks(json.time_entries);
  });
```

### Available Server Functions

| Function | Method | Purpose |
|----------|--------|---------|
| `getTimeEntries` | GET | Fetch time entries |
| `createTimeEntry` | POST | Create new time entry |
| `updateTimeEntry` | POST | Update existing time entry |
| `deleteTimeEntry` | POST | Delete time entry |
| `duplicateTimeEntry` | POST | Duplicate time entry |
| `getIssuesByIds` | POST | Batch fetch issues |

### Server Function Features

1. **Type Safety** - Input validated with Zod schemas
2. **CORS Bypass** - Run on server, no CORS issues
3. **Environment Variables** - Access secure credentials
4. **Error Handling** - Centralized error responses
5. **Transformation** - Convert Redmine format to app format

## Cache Management

### Manual Cache Updates

```tsx
// Optimistic update
queryClient.setQueryData(['timeEntries'], (oldData) => {
  return [...oldData, newEntry];
});

// Get cached data
const cachedData = queryClient.getQueryData(['timeEntries']);

// Remove from cache
queryClient.removeQueries({ queryKey: ['timeEntries'] });
```

### Automatic Invalidation

After mutations, invalidate related queries:

```tsx
onSuccess: () => {
  // Invalidates all queries starting with ['timeEntries']
  queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
}
```

## Loading States

### Query States

```tsx
const { data, status, isLoading, isError, error } = useQuery({
  queryKey: ['timeEntries'],
  queryFn: getTimeEntries,
});

if (isLoading) return <Spinner />;
if (isError) return <Error message={error.message} />;

return <div>{data.map(item => ...)}</div>;
```

### Mutation States

```tsx
const mutation = useMutation({ mutationFn: updateTask });

if (mutation.isPending) return <Spinner />;
if (mutation.isError) return <Error message={mutation.error.message} />;
if (mutation.isSuccess) return <SuccessMessage />;
```

## SSR Integration

### How It Works

```tsx
// 1. In router.tsx - Setup SSR integration
setupRouterSsrQueryIntegration({
  router,
  queryClient,
});

// 2. In route - Prefetch data during SSR
export const Route = createFileRoute('/calendar')({
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery({
      queryKey: ['timeEntries'],
      queryFn: () => getTimeEntries({ data: {} }),
    });
  },
  component: CalendarPage,
});

// 3. In component - Use prefetched data
function CalendarPage() {
  const { data } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: () => getTimeEntries({ data: {} }),
  });
  // Data is immediately available from SSR
}
```

### SSR Flow

```
Server:
1. Route loader runs
2. QueryClient prefetches data
3. Data cached in QueryClient
4. HTML rendered with data
5. QueryClient state serialized
6. Sent to client

Client:
1. React hydrates
2. QueryClient rehydrates
3. useQuery finds cached data
4. No duplicate request
5. UI interactive immediately
```

## Devtools

### Query Devtools

**Location:** `src/integrations/tanstack-query/devtools.tsx`

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const TanStackQueryDevtools = {
  name: 'TanStack Query',
  render: <ReactQueryDevtools buttonPosition="bottom-left" />,
};

export default TanStackQueryDevtools;
```

**Features:**
- Inspect query cache
- See query states
- Trigger refetch
- View query timelines
- Debug mutations

## Best Practices

### 1. Query Keys

✅ Use hierarchical keys:
```tsx
['timeEntries', userId, from, to]
```

❌ Avoid flat keys:
```tsx
['timeEntriesForUserInDateRange']
```

### 2. Stale Time

✅ Set appropriate stale time:
```tsx
staleTime: 1000 * 60 * 5, // 5 minutes
```

❌ Don't set too short:
```tsx
staleTime: 0, // Refetches too often
```

### 3. Error Handling

✅ Handle errors gracefully:
```tsx
if (error) return <ErrorMessage error={error} />;
```

❌ Don't ignore errors:
```tsx
const { data } = useQuery(...); // Missing error handling
```

### 4. Invalidation

✅ Invalidate after mutations:
```tsx
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
}
```

❌ Don't forget to invalidate:
```tsx
onSuccess: () => {
  // Missing invalidation - UI won't update
}
```

### 5. Server Functions

✅ Use server functions for external APIs:
```tsx
export const getData = createServerFn({ method: 'GET' })
  .handler(async () => {
    return fetch(externalAPI);
  });
```

❌ Don't call external APIs from client:
```tsx
// In component - exposes API keys!
const data = await fetch('https://api.example.com', {
  headers: { 'Authorization': 'secret' }
});
```

## Common Patterns

### Infinite Query

```tsx
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['timeEntries'],
  queryFn: ({ pageParam = 0 }) =>
    getTimeEntries({ data: { offset: pageParam } }),
  getNextPageParam: (lastPage, pages) =>
    lastPage.hasMore ? pages.length * 100 : undefined,
});
```

### Polling

```tsx
useQuery({
  queryKey: ['timeEntries'],
  queryFn: getTimeEntries,
  refetchInterval: 30000, // Poll every 30 seconds
});
```

### Conditional Fetch

```tsx
useQuery({
  queryKey: ['issues', issueIds],
  queryFn: () => getIssues({ data: { issueIds } }),
  enabled: issueIds.length > 0, // Only fetch if IDs exist
});
```

## Troubleshooting

### Query Not Refetching
- Check `staleTime` - data might still be fresh
- Verify `enabled` flag is not false
- Check network tab for actual requests

### SSR Hydration Mismatch
- Ensure query keys match between server and client
- Verify data transformation is consistent
- Check for client-only code in SSR path

### Mutation Not Updating UI
- Ensure `invalidateQueries` is called in `onSuccess`
- Verify query keys match between query and invalidation
- Check if component is re-rendering
