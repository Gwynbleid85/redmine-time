# Redmine Integration

## Overview

This application integrates with Redmine's REST API to manage time entries and issues. Server functions act as a CORS proxy, keeping API credentials secure on the server.

## Architecture

```
Client                Server                Redmine API
┌──────┐            ┌──────┐              ┌──────┐
│      │            │      │              │      │
│ React├────────────►Server├──────────────►REST  │
│ Query│  useQuery  │ Fn   │  HTTP + Key  │ API  │
│      │◄────────────┤      │◄──────────────┤      │
└──────┘  JSON      └──────┘  JSON        └──────┘
```

**Benefits:**
- No CORS issues
- API keys stay on server
- Type-safe with Zod validation
- Centralized error handling
- Data transformation in one place

## Environment Configuration

### Required Variables

**Location:** `.env` (not committed to git)

```bash
REDMINE_BASE_URL=https://your-redmine-instance.com
REDMINE_API_KEY=your_api_key_here
REDMINE_USER_ID=123
```

### Getting Credentials

1. **REDMINE_BASE_URL** - Your Redmine instance URL (without trailing slash)
2. **REDMINE_API_KEY** - Found in Redmine > My Account > API access key
3. **REDMINE_USER_ID** - Your user ID (found in URL: `/users/{id}`)

### Example `.env`

```bash
# Redmine Configuration
REDMINE_BASE_URL=https://redmine.example.com
REDMINE_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
REDMINE_USER_ID=42
```

## API Functions

**Location:** `src/lib/api.redmine.ts`

### getTimeEntries

Fetch time entries for a date range.

```tsx
export const getTimeEntries = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(GetTimeEntriesSchema))
  .handler(async ({ data }): Promise<Task[]> => { ... });
```

**Input Schema:**
```tsx
{
  userId?: string;      // Default: undefined (all users)
  projectId?: string;   // Default: undefined (all projects)
  from?: string;        // YYYY-MM-DD format
  to?: string;          // YYYY-MM-DD format
  limit?: number;       // Default: 100
  offset?: number;      // Default: 0
}
```

**Usage:**
```tsx
const { data: tasks } = useQuery({
  queryKey: ['timeEntries', from, to],
  queryFn: () => getTimeEntries({
    data: {
      userId: 'me',
      from: '2024-01-01',
      to: '2024-01-31',
      limit: 500,
    }
  }),
});
```

**Returns:** Array of `Task` objects (transformed from Redmine format)

**Redmine API Endpoint:** `GET /time_entries.json`

### createTimeEntry

Create a new time entry.

```tsx
export const createTimeEntry = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(CreateTimeEntrySchema))
  .handler(async ({ data }): Promise<Task> => { ... });
```

**Input Schema:**
```tsx
{
  issueId: number;      // Required: Issue ID
  hours: number;        // Required: Hours spent (positive)
  comments: string;     // Required: Description
  spentOn: string;      // Required: Date (YYYY-MM-DD)
  activityId: number;   // Required: Activity type ID
  userId?: number;      // Optional: User ID (defaults to current user)
}
```

**Usage:**
```tsx
const createMutation = useMutation({
  mutationFn: (params) => createTimeEntry({
    data: {
      issueId: 186933,
      hours: 8,
      comments: 'Implemented new feature',
      spentOn: '2024-01-15',
      activityId: 9,  // Development activity
    }
  }),
});
```

**Returns:** Created `Task` object

**Redmine API Endpoint:** `POST /time_entries.json`

### updateTimeEntry

Update an existing time entry.

```tsx
export const updateTimeEntry = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(UpdateTimeEntrySchema))
  .handler(async ({ data }): Promise<void> => { ... });
```

**Input Schema:**
```tsx
{
  id: number;           // Required: Time entry ID
  issueId?: number;     // Optional: New issue ID
  hours?: number;       // Optional: New hours
  comments?: string;    // Optional: New comments
  spentOn?: string;     // Optional: New date (YYYY-MM-DD)
  activityId?: number;  // Optional: New activity ID
}
```

**Usage:**
```tsx
const updateMutation = useMutation({
  mutationFn: (params) => updateTimeEntry({
    data: {
      id: 12345,
      hours: 6,
      comments: 'Updated hours',
    }
  }),
});
```

**Returns:** `void` (204 No Content)

**Redmine API Endpoint:** `PUT /time_entries/{id}.json`

### deleteTimeEntry

Delete a time entry.

```tsx
export const deleteTimeEntry = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(DeleteTimeEntrySchema))
  .handler(async ({ data }): Promise<void> => { ... });
```

**Input Schema:**
```tsx
{
  id: number;  // Required: Time entry ID
}
```

**Usage:**
```tsx
const deleteMutation = useMutation({
  mutationFn: (id) => deleteTimeEntry({ data: { id } }),
});
```

**Returns:** `void` (204 No Content)

**Redmine API Endpoint:** `DELETE /time_entries/{id}.json`

### duplicateTimeEntry

Duplicate a time entry (fetch original, create new).

```tsx
export const duplicateTimeEntry = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(DuplicateTimeEntrySchema))
  .handler(async ({ data }): Promise<Task> => { ... });
```

**Input Schema:**
```tsx
{
  id: number;  // Required: Time entry ID to duplicate
}
```

**Usage:**
```tsx
const duplicateMutation = useMutation({
  mutationFn: (id) => duplicateTimeEntry({ data: { id } }),
});
```

**How it works:**
1. Fetch original time entry via GET
2. Create new entry with same data via POST
3. Return created entry

**Returns:** Created `Task` object

**Redmine API Endpoints:**
- `GET /time_entries/{id}.json`
- `POST /time_entries.json`

### getIssuesByIds

Batch fetch issue details by IDs.

```tsx
export const getIssuesByIds = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(GetIssuesByIdsSchema))
  .handler(async ({ data }): Promise<Map<number, RedmineIssueDetail>> => { ... });
```

**Input Schema:**
```tsx
{
  issueIds: number[];  // Array of issue IDs
}
```

**Usage:**
```tsx
const { data: issuesMap } = useQuery({
  queryKey: ['issues', issueIds],
  queryFn: () => getIssuesByIds({ data: { issueIds: [123, 456, 789] } }),
  enabled: issueIds.length > 0,
});

// Access issue by ID
const issue = issuesMap.get(123);
```

**Returns:** `Map<number, RedmineIssueDetail>` for O(1) lookup

**Redmine API Endpoint:** `GET /issues.json?issue_id=123,456,789`

## Type Definitions

### Application Types

**Location:** `src/lib/types.ts`

```tsx
export type TaskType = "Epic" | "Task" | "Bug" | "Feature";

export interface Task {
  id: string;              // Format: "redmine:186933"
  title: string;           // Comments from time entry
  description: string;     // Full description
  date: Date;              // Spent on date
  duration: number;        // Hours
  type: TaskType;          // Mapped from activity
  taskId?: string;         // Format: "#186933"
  completed?: boolean;     // Status flag
  // Enriched from issues
  issueSubject?: string;   // Issue title
  issueTracker?: string;   // Bug, Feature, etc.
  issueStatus?: string;    // In Progress, Resolved, etc.
}
```

### Redmine Types

**Location:** `src/lib/redmine-types.ts`

```tsx
export interface RedmineTimeEntry {
  id: number;
  project: { id: number; name: string };
  issue?: { id: number };
  user: { id: number; name: string };
  activity: { id: number; name: string };
  hours: number;
  comments: string;
  spent_on: string;  // YYYY-MM-DD
  created_on: string;
  updated_on: string;
}

export interface RedmineTimeEntriesResponse {
  time_entries: RedmineTimeEntry[];
  total_count: number;
  offset: number;
  limit: number;
}

export interface RedmineIssueDetail {
  id: number;
  project: { id: number; name: string };
  tracker: { id: number; name: string };
  status: { id: number; name: string };
  priority: { id: number; name: string };
  author: { id: number; name: string };
  subject: string;
  description: string;
  created_on: string;
  updated_on: string;
}

export interface RedmineIssuesResponse {
  issues: RedmineIssueDetail[];
  total_count: number;
  offset: number;
  limit: number;
}

export interface CreateTimeEntryResponse {
  time_entry: RedmineTimeEntry;
}
```

## Data Transformation

**Location:** `src/lib/redmine-utils.ts`

### redmineTimeEntriesToTasks

Transforms Redmine time entries to application `Task` format.

```tsx
export function redmineTimeEntriesToTasks(
  entries: RedmineTimeEntry[]
): Task[] {
  return entries.map(entry => ({
    id: `redmine:${entry.id}`,
    title: entry.comments || 'No description',
    description: entry.comments,
    date: new Date(entry.spent_on),
    duration: entry.hours,
    type: mapActivityToTaskType(entry.activity.name),
    taskId: entry.issue ? `#${entry.issue.id}` : undefined,
    completed: false,
  }));
}
```

### extractRedmineId

Extracts numeric ID from prefixed format.

```tsx
export function extractRedmineId(id: string): number | null {
  // "redmine:186933" -> 186933
  const match = id.match(/^redmine:(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}
```

### getMonthDateRange

Generates date range for calendar month.

```tsx
export function getMonthDateRange(date: Date): {
  from: string;
  to: string;
} {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    from: formatDateYYYYMMDD(firstDay),
    to: formatDateYYYYMMDD(lastDay),
  };
}
```

### Activity ID Mapping

Common Redmine activity IDs:

| ID | Activity | Task Type |
|----|----------|-----------|
| 8 | Design | Task |
| 9 | Development | Task |
| 10 | Testing | Task |
| 11 | Support | Bug |
| 12 | Documentation | Task |

**Note:** Activity IDs may vary per Redmine instance. Check your instance's configuration.

## Error Handling

### Server Function Errors

```tsx
try {
  const response = await fetch(url, { ... });

  if (!response.ok) {
    throw new Error(`Redmine API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
} catch (error) {
  console.error('Error fetching from Redmine:', error);
  throw error;  // Propagates to React Query
}
```

### Client Error Handling

```tsx
const { data, error, isError } = useQuery({
  queryKey: ['timeEntries'],
  queryFn: getTimeEntries,
});

if (isError) {
  return (
    <div className="text-destructive">
      <p className="font-bold">Error loading time entries</p>
      <p className="text-sm">{error.message}</p>
      <p className="text-xs mt-2">
        Make sure your .env file is configured with valid Redmine credentials.
      </p>
    </div>
  );
}
```

## API Request Flow

### Fetching Time Entries

```
1. Component calls useQuery
   ↓
2. React Query checks cache
   ↓
3. If stale, calls getTimeEntries server function
   ↓
4. Server function fetches from Redmine API
   ↓
5. Server function transforms response
   ↓
6. Data returned to client
   ↓
7. React Query caches data
   ↓
8. Component renders with data
```

### Creating Time Entry

```
1. Component calls mutation.mutate()
   ↓
2. Calls createTimeEntry server function
   ↓
3. Server function validates input with Zod
   ↓
4. Server function POSTs to Redmine API
   ↓
5. Redmine creates entry, returns response
   ↓
6. Server function transforms response
   ↓
7. Returns created Task to client
   ↓
8. Mutation onSuccess fires
   ↓
9. Query invalidation triggers refetch
   ↓
10. UI updates with new data
```

## Redmine API Documentation

### Official Docs
https://www.redmine.org/projects/redmine/wiki/Rest_api

### Key Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/time_entries.json` | GET | List time entries |
| `/time_entries.json` | POST | Create time entry |
| `/time_entries/{id}.json` | GET | Get time entry |
| `/time_entries/{id}.json` | PUT | Update time entry |
| `/time_entries/{id}.json` | DELETE | Delete time entry |
| `/issues.json` | GET | List issues |

### Authentication

All requests include:
```
X-Redmine-API-Key: {api_key}
```

### Response Format

Redmine returns JSON with nested objects:

```json
{
  "time_entries": [
    {
      "id": 186933,
      "project": { "id": 123, "name": "My Project" },
      "issue": { "id": 456 },
      "user": { "id": 789, "name": "John Doe" },
      "activity": { "id": 9, "name": "Development" },
      "hours": 8,
      "comments": "Implemented feature",
      "spent_on": "2024-01-15",
      "created_on": "2024-01-15T10:00:00Z",
      "updated_on": "2024-01-15T10:00:00Z"
    }
  ],
  "total_count": 1,
  "offset": 0,
  "limit": 100
}
```

## Best Practices

### 1. Use Server Functions

✅ Call Redmine API from server functions:
```tsx
export const getTimeEntries = createServerFn({ method: 'GET' })
  .handler(async () => {
    return fetch(redmineUrl, { headers: { 'X-Redmine-API-Key': apiKey } });
  });
```

❌ Don't call from client:
```tsx
// Bad - exposes API key!
const response = await fetch(redmineUrl, {
  headers: { 'X-Redmine-API-Key': apiKey }
});
```

### 2. Validate Input

✅ Use Zod schemas:
```tsx
const Schema = z.object({
  issueId: z.number(),
  hours: z.number().positive(),
});
```

❌ Skip validation:
```tsx
// Bad - no validation
.handler(async ({ data }) => {
  return createEntry(data);
});
```

### 3. Transform Data

✅ Transform on server:
```tsx
.handler(async ({ data }) => {
  const response = await fetch(...);
  const json = await response.json();
  return redmineTimeEntriesToTasks(json.time_entries);
});
```

❌ Transform on client:
```tsx
// Bad - couples client to Redmine format
const { data } = useQuery({
  queryFn: () => getTimeEntries(),
  select: (data) => transformToTasks(data),
});
```

### 4. Handle Errors

✅ Provide context:
```tsx
if (!response.ok) {
  throw new Error(
    `Redmine API error: ${response.status} ${response.statusText}`
  );
}
```

❌ Generic errors:
```tsx
// Bad - no context
throw new Error('Failed');
```

## Common Issues

### 401 Unauthorized
- Check `REDMINE_API_KEY` is correct
- Verify API access is enabled in Redmine settings

### 403 Forbidden
- User may not have permission for the project/issue
- Check user role in Redmine

### 404 Not Found
- Verify `REDMINE_BASE_URL` is correct
- Check issue/project exists

### CORS Errors
- Should not occur (server functions bypass CORS)
- If occurring, ensure using server functions not direct fetch

### Empty Results
- Check date range includes data
- Verify user has time entries in that period
- Check project filter if applied

## Testing

### Manual Testing

```bash
# Test API connection
curl https://your-redmine.com/time_entries.json \
  -H "X-Redmine-API-Key: your_key"
```

### Integration Tests

```tsx
import { describe, it, expect, vi } from 'vitest';
import { getTimeEntries } from '@/lib/api.redmine';

describe('getTimeEntries', () => {
  it('fetches and transforms time entries', async () => {
    const result = await getTimeEntries({
      data: { userId: 'me', from: '2024-01-01', to: '2024-01-31' }
    });

    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('duration');
  });
});
```
