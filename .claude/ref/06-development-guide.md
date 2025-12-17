# Development Guide

## Quick Start

### Prerequisites

- **Bun** - JavaScript runtime and package manager
- **Git** - Version control
- **Node.js 18+** - Required by some dependencies
- **Redmine Instance** - With API access enabled

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd ft2

# Install dependencies
bun install

# Configure environment
cp .env.example .env
# Edit .env with your Redmine credentials

# Start dev server
bun --bun run start
```

### Development Server

```bash
# Start on port 3000
bun --bun run start

# Alternative dev command
bun --bun run dev
```

Access at: http://localhost:3000

## Essential Commands

### Development

```bash
# Start dev server with hot reload
bun --bun run start

# Install new dependency
bun add <package-name>

# Install dev dependency
bun add -d <package-name>
```

### Code Quality

```bash
# Run linter + formatter + type checker
bun --bun run check

# Lint only
bun --bun run lint

# Format only
bun --bun run format

# Type check (no emit)
tsc --noEmit --skipLibCheck
```

**CRITICAL:** Run `bun check` frequently during development!

### Testing

```bash
# Run tests
bun --bun run test

# Run tests in watch mode
bun test --watch

# Run tests with coverage
bun test --coverage
```

### Build

```bash
# Production build
bun --bun run build

# Preview production build
bun --bun run serve
```

## Workflow Techniques

### Ping-Pong Check Technique

**Best for:** Debugging errors incrementally

```bash
# 1. Run check
bun check

# 2. Fix first error
# Edit code...

# 3. Run check again
bun check

# 4. Repeat until all errors fixed
```

**Benefits:**
- Catch errors early
- Fix incrementally
- Prevent error cascades
- Save debugging time

### Pre-Commit Workflow

**Before committing:**

```bash
# 1. Check code quality
bun check

# 2. Run tests
bun test

# 3. Stage changes
git add .

# 4. Commit
git commit -m "feat: add new feature"
```

### Feature Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Develop with frequent checks
# Edit code...
bun check
# Fix errors...
bun check

# 3. Test locally
bun test

# 4. Commit changes
git commit -am "feat: implement my feature"

# 5. Push branch
git push origin feature/my-feature

# 6. Create pull request
```

## Project Structure

```
ft2/
├── .claude/                 # Claude Code config
│   ├── ref/                # Reference docs
│   └── settings.local.json # Local settings
├── src/
│   ├── routes/             # Pages (file-based routing)
│   ├── components/         # React components
│   │   └── ui/            # shadcn/ui components
│   ├── lib/               # Utilities and types
│   ├── integrations/      # Third-party integrations
│   ├── hooks/             # Custom React hooks
│   ├── router.tsx         # Router setup
│   └── styles.css         # Global styles
├── public/                # Static assets
├── .env                   # Environment variables (not committed)
├── .env.example           # Example env config
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript config
├── biome.json             # Biome config
├── components.json        # shadcn/ui config
├── package.json           # Dependencies
└── CLAUDE.md              # Project documentation
```

## Adding Features

### New Page

1. Create route file:
```bash
# Create src/routes/about.tsx
touch src/routes/about.tsx
```

2. Define route:
```tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  return <div>About Us</div>;
}
```

3. Route auto-discovered on next dev server restart

### New Component

1. Create component file:
```bash
# Create src/components/my-component.tsx
touch src/components/my-component.tsx
```

2. Define component:
```tsx
interface MyComponentProps {
  title: string;
  onClick: () => void;
}

export function MyComponent({ title, onClick }: MyComponentProps) {
  return (
    <div onClick={onClick}>
      <h2>{title}</h2>
    </div>
  );
}
```

3. Import and use:
```tsx
import { MyComponent } from '@/components/my-component';

<MyComponent title="Hello" onClick={handleClick} />
```

### New shadcn/ui Component

```bash
# List available components
pnpx shadcn@latest add

# Add specific component
pnpx shadcn@latest add button

# Add multiple components
pnpx shadcn@latest add button dialog card
```

Components installed to `src/components/ui/`

### New Server Function

1. Create in `src/lib/api.redmine.ts`:
```tsx
import { createServerFn } from '@tanstack/react-start';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

const MySchema = z.object({
  param: z.string(),
});

export const myServerFn = createServerFn({ method: 'GET' })
  .inputValidator(zodValidator(MySchema))
  .handler(async ({ data }) => {
    // Server-side logic
    return result;
  });
```

2. Use in component:
```tsx
const { data } = useQuery({
  queryKey: ['myData', param],
  queryFn: () => myServerFn({ data: { param } }),
});
```

### New Hook

1. Create in `src/hooks/`:
```tsx
// src/hooks/use-my-hook.ts
import { useState, useEffect } from 'react';

export function useMyHook(initialValue: string) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    // Effect logic
  }, [value]);

  return { value, setValue };
}
```

2. Use in component:
```tsx
import { useMyHook } from '@/hooks/use-my-hook';

function MyComponent() {
  const { value, setValue } = useMyHook('initial');
  return <div>{value}</div>;
}
```

## Configuration

### TypeScript

**Location:** `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,              // Strict type checking
    "noUnusedLocals": true,      // Error on unused variables
    "noUnusedParameters": true,  // Error on unused params
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]         // Path alias
    }
  }
}
```

### Biome

**Location:** `biome.json`

```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "tab"         // Use tabs
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double"     // Double quotes
    }
  }
}
```

### Vite

**Location:** `vite.config.ts`

```tsx
export default defineConfig({
  plugins: [
    nitroV2Plugin(),           // SSR support
    viteTsConfigPaths(),       // Path aliases
    tailwindcss(),             // Tailwind CSS v4
    tanstackStart(),           // TanStack Start
    viteReact(),               // React support
  ],
});
```

## Path Aliases

Use `@/` prefix for imports:

```tsx
// Good: Absolute import
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/types';
import { useMyHook } from '@/hooks/use-my-hook';

// Bad: Relative import
import { Button } from '../../../components/ui/button';
```

## Environment Variables

### Adding New Variables

1. Add to `.env`:
```bash
MY_API_KEY=secret123
```

2. Add to `.env.example`:
```bash
MY_API_KEY=your_api_key_here
```

3. Access in server function:
```tsx
.handler(async () => {
  const apiKey = process.env.MY_API_KEY;
  if (!apiKey) {
    throw new Error('MY_API_KEY is required');
  }
  // Use apiKey...
});
```

**Note:** Environment variables are only accessible in server functions, not client components.

## Debugging

### Browser DevTools

Access TanStack Devtools (bottom-left):
- **Router** panel - Inspect routes, params, loaders
- **Query** panel - View cache, queries, mutations

### Console Logging

```tsx
// Server logs (appear in terminal)
console.log('[Server]', data);

// Client logs (appear in browser console)
console.log('[Client]', data);
```

### React DevTools

Install browser extension:
- Chrome: React Developer Tools
- Firefox: React Developer Tools

### Network Tab

Monitor API requests:
1. Open DevTools → Network tab
2. Filter by `Fetch/XHR`
3. Check requests to server functions

### Type Errors

```bash
# Check types without emitting
tsc --noEmit

# Check specific file
tsc --noEmit src/routes/calendar.tsx
```

## Common Tasks

### Update Dependencies

```bash
# Update all dependencies
bun update

# Update specific package
bun update <package-name>

# Check outdated packages
bun outdated
```

### Clear Cache

```bash
# Remove node_modules and reinstall
rm -rf node_modules
bun install

# Clear Bun cache
bun pm cache rm
```

### Fix Formatting

```bash
# Format all files
bun format --write

# Format specific files
bun format --write src/routes/*.tsx
```

### Generate Types

TanStack Router auto-generates `routeTree.gen.ts`:

```bash
# Restart dev server to regenerate
bun start
```

## Git Workflow

### Branch Naming

```bash
feature/add-calendar-view
bugfix/fix-date-parsing
refactor/improve-types
docs/update-readme
```

### Commit Messages

Follow conventional commits:

```bash
# Features
git commit -m "feat: add calendar navigation"

# Bug fixes
git commit -m "fix: resolve date timezone issue"

# Refactoring
git commit -m "refactor: extract query hooks"

# Documentation
git commit -m "docs: update API reference"

# Chores
git commit -m "chore: update dependencies"
```

### Pull Request Process

1. Create feature branch
2. Make changes with frequent commits
3. Run `bun check` and `bun test`
4. Push branch to remote
5. Create PR with description
6. Address review comments
7. Merge when approved

## Performance Optimization

### Query Optimization

```tsx
// Set appropriate stale time
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  staleTime: 1000 * 60 * 5, // 5 minutes
});
```

### Component Memoization

```tsx
import { memo } from 'react';

export const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* Expensive render */}</div>;
});
```

### Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('@/components/heavy'));

function MyPage() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

## Troubleshooting

### Dev Server Won't Start

```bash
# Check port 3000 is free
lsof -i :3000

# Kill process on port 3000
kill -9 <PID>

# Try different port
bun start --port 3001
```

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules .vinxi
bun install
bun build
```

### Type Errors

```bash
# Check TypeScript errors
tsc --noEmit

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Import Errors

```bash
# Check path alias config
cat tsconfig.json | grep paths

# Restart dev server
bun start
```

### Styles Not Updating

```bash
# Clear Tailwind cache
rm -rf .vinxi
bun start
```

## Best Practices

### Code Organization

- One component per file
- Export component as named export
- Co-locate types with components
- Group related utilities

### Naming Conventions

- Components: PascalCase (`TaskItem`)
- Files: kebab-case (`task-item.tsx`)
- Functions: camelCase (`handleClick`)
- Types: PascalCase (`TaskItemProps`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)

### Import Order

```tsx
// 1. External dependencies
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal modules
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/types';
import { getTimeEntries } from '@/lib/api.redmine';

// 3. Styles
import './styles.css';
```

### Error Handling

```tsx
// Always handle errors
const { data, error, isError } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
});

if (isError) {
  return <ErrorMessage error={error} />;
}
```

### Type Safety

```tsx
// Define prop types
interface Props {
  title: string;
  onClick: () => void;
}

// Use types in function signature
function MyComponent({ title, onClick }: Props) {
  return <button onClick={onClick}>{title}</button>;
}
```

## Resources

### Documentation

- **TanStack Router** - https://tanstack.com/router/latest
- **TanStack Query** - https://tanstack.com/query/latest
- **Tailwind CSS** - https://tailwindcss.com
- **shadcn/ui** - https://ui.shadcn.com
- **Redmine API** - https://www.redmine.org/projects/redmine/wiki/Rest_api

### Tools

- **Bun** - https://bun.sh
- **Biome** - https://biomejs.dev
- **TypeScript** - https://www.typescriptlang.org

### Community

- TanStack Discord - https://discord.gg/tanstack
- GitHub Issues - Report bugs and feature requests
