# Component Structure

## Overview

The application uses a three-tier component architecture:
1. **UI Components** - shadcn/ui primitives (`components/ui/`)
2. **Application Components** - Custom business logic (`components/`)
3. **Page Components** - Route-level components (`routes/`)

## shadcn/ui Components

### Installation

shadcn/ui components are installed via CLI:

```bash
pnpx shadcn@latest add button
pnpx shadcn@latest add dialog
pnpx shadcn@latest add card
```

### Configuration

**Location:** `components.json`

```json
{
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui"
  },
  "iconLibrary": "lucide"
}
```

### Available UI Components

Located in `src/components/ui/`:

| Component | Purpose | Usage |
|-----------|---------|-------|
| `button` | Buttons with variants | Primary actions, links |
| `card` | Content containers | Task items, summaries |
| `dialog` | Modal dialogs | Edit forms, confirmations |
| `input` | Text inputs | Form fields |
| `label` | Form labels | Input labels |
| `textarea` | Multi-line inputs | Comments, descriptions |
| `select` | Dropdown selects | Type selection |
| `calendar` | Date picker | Date selection |
| `badge` | Status badges | Task types, statuses |
| `tooltip` | Hover tooltips | Help text |
| `popover` | Popover menus | Context menus |
| `separator` | Visual dividers | Section breaks |
| `alert` | Alert messages | Errors, warnings |
| `sheet` | Side panels | Slide-out menus |
| `tabs` | Tab navigation | Content sections |
| `table` | Data tables | List views |
| `empty` | Empty states | No data placeholders |

### Component Variants

Most UI components support variants via `class-variance-authority`:

```tsx
import { Button } from '@/components/ui/button';

<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">More</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
```

### Styling Utility

**Location:** `src/lib/utils.ts`

```tsx
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Usage:**

```tsx
<div className={cn("base-class", isActive && "active-class")} />
```

## Application Components

### Calendar Components

#### CalendarHeader

**Location:** `src/components/calendar-header.tsx`

Navigation controls and summary information.

```tsx
interface CalendarHeaderProps {
  currentDate: Date;
  totalHours: number;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onAddTask: () => void;
}
```

**Features:**
- Month/year display
- Previous/next navigation
- Today button
- Add task button
- Total hours summary

**Usage:**
```tsx
<CalendarHeader
  currentDate={currentDate}
  totalHours={tasks.reduce((sum, t) => sum + t.duration, 0)}
  onPreviousWeek={handlePrevMonth}
  onNextWeek={handleNextMonth}
  onToday={handleToday}
  onAddTask={() => setAddDialogOpen(true)}
/>
```

#### CalendarGrid

**Location:** `src/components/calendar-grid.tsx`

Monthly calendar grid displaying tasks.

```tsx
interface CalendarGridProps {
  currentDate: Date;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDuplicate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onDateClick: (date: Date) => void;
}
```

**Features:**
- 7-column grid (week days)
- Current month days
- Previous/next month overflow days
- Task items per day
- Click handlers for tasks and dates
- Today highlighting

**Usage:**
```tsx
<CalendarGrid
  currentDate={currentDate}
  tasks={tasks}
  onTaskClick={handleTaskClick}
  onTaskEdit={handleTaskEdit}
  onTaskDuplicate={handleTaskDuplicate}
  onTaskDelete={handleTaskDelete}
  onDateClick={handleDateClick}
/>
```

#### CalendarDay

**Location:** `src/components/calendar-day.tsx`

Individual day cell in calendar grid.

```tsx
interface CalendarDayProps {
  date: Date;
  tasks: Task[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onTaskClick: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
  onTaskDuplicate: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onDateClick: (date: Date) => void;
}
```

**Features:**
- Date number display
- Task list
- Visual state (today, different month)
- Total hours badge
- Empty state for click

### Task Components

#### TaskItem

**Location:** `src/components/task-item.tsx`

Display individual task with actions.

```tsx
interface TaskItemProps {
  task: Task;
  onClick: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDuplicate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}
```

**Features:**
- Task title (issue subject or comments)
- Duration badge
- Task ID badge
- Tracker badge (Bug, Feature, etc.)
- Context menu (Edit, Duplicate, Delete)
- Click to view details

**Usage:**
```tsx
<TaskItem
  task={task}
  onClick={handleTaskClick}
  onEdit={handleTaskEdit}
  onDuplicate={handleTaskDuplicate}
  onDelete={handleTaskDelete}
/>
```

#### TaskDialog

**Location:** `src/components/task-dialog.tsx`

Form dialog for creating/editing tasks.

```tsx
interface TaskDialogProps {
  task?: Task;
  selectedDate?: Date;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Partial<Task>) => void;
}
```

**Features:**
- Create or edit mode
- Form fields: Issue ID, hours, comments, date, type
- Form validation with React Hook Form + Zod
- Cancel/Save actions

**Form Fields:**
```tsx
{
  taskId: string;      // e.g., "#186933"
  duration: number;    // Hours (0.25 increments)
  title: string;       // Comments/description
  date: Date;          // Spent on date
  type: TaskType;      // Epic, Task, Bug, Feature
}
```

#### TaskDetailDialog

**Location:** `src/components/task-detail-dialog.tsx`

Read-only dialog showing task details.

```tsx
interface TaskDetailDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}
```

**Features:**
- Issue information (subject, tracker, status)
- Time entry details (date, hours, comments)
- Action buttons (Edit, Duplicate, Delete)

### Header Component

**Location:** `src/components/Header.tsx`

Global navigation header.

```tsx
export default function Header() {
  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            Redmine Time Tracker
          </Link>
          <div className="flex gap-4">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <Link to="/calendar" className="hover:underline">
              Calendar
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
```

## Component Patterns

### Compound Components

CalendarGrid + CalendarDay:

```tsx
function CalendarGrid({ tasks, ...handlers }) {
  return (
    <div className="grid grid-cols-7">
      {days.map(day => (
        <CalendarDay
          key={day.toString()}
          date={day}
          tasks={getTasksForDay(day)}
          {...handlers}
        />
      ))}
    </div>
  );
}
```

### Container/Presentational

```tsx
// Container (logic)
function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const { data: tasks } = useQuery(...);

  return (
    <CalendarView
      date={date}
      tasks={tasks}
      onDateChange={setDate}
    />
  );
}

// Presentational (UI)
function CalendarView({ date, tasks, onDateChange }) {
  return (
    <div>
      <CalendarHeader date={date} onDateChange={onDateChange} />
      <CalendarGrid tasks={tasks} />
    </div>
  );
}
```

### Controlled Components

```tsx
<TaskDialog
  open={isOpen}                    // Controlled
  onOpenChange={setIsOpen}         // State updater
  task={selectedTask}              // Props
  onSave={handleSave}              // Callback
/>
```

## Type Definitions

**Location:** `src/lib/types.ts`

```tsx
export type TaskType = "Epic" | "Task" | "Bug" | "Feature";

export interface Task {
  id: string;              // e.g., "redmine:186933"
  title: string;           // Comments
  description: string;     // Full description
  date: Date;              // Spent on date
  duration: number;        // Hours
  type: TaskType;          // Task type
  taskId?: string;         // e.g., "#186933"
  completed?: boolean;     // Status flag
  // Enriched from Redmine issues
  issueSubject?: string;   // Issue title
  issueTracker?: string;   // Bug, Feature, etc.
  issueStatus?: string;    // In Progress, Resolved, etc.
}

export interface CalendarDay {
  date: Date;
  tasks: Task[];
  totalHours: number;
}
```

## Styling Conventions

### Tailwind CSS

The project uses Tailwind CSS v4 for styling.

#### Common Patterns

```tsx
// Container
className="container mx-auto px-4 py-6"

// Card
className="rounded-lg border bg-card p-4"

// Button
className="px-4 py-2 rounded-md bg-primary text-primary-foreground"

// Grid
className="grid grid-cols-7 gap-2"

// Flex
className="flex items-center justify-between gap-4"
```

#### Responsive Design

```tsx
className="
  grid
  grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7
  gap-2 md:gap-4
"
```

#### Conditional Classes

```tsx
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isError && "error-classes"
)} />
```

### CSS Variables

Defined in `src/styles.css`:

```css
@theme {
  --color-background: 0 0% 100%;
  --color-foreground: 240 10% 3.9%;
  --color-primary: 240 5.9% 10%;
  --color-primary-foreground: 0 0% 98%;
  /* ... */
}
```

## Custom Hooks

**Location:** `src/hooks/`

### useMobile

```tsx
import { useMobile } from '@/hooks/use-mobile';

function MyComponent() {
  const isMobile = useMobile();

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

## Component Testing

### Vitest + React Testing Library

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Best Practices

### 1. Component Structure

✅ Separate concerns:
```tsx
// Good: Presentation component
function TaskList({ tasks, onTaskClick }) { ... }

// Good: Container component
function TaskListContainer() {
  const { data: tasks } = useQuery(...);
  return <TaskList tasks={tasks} onTaskClick={...} />;
}
```

❌ Mix concerns:
```tsx
// Bad: Mixed logic and presentation
function TaskList() {
  const { data: tasks } = useQuery(...); // Logic in presentation
  return <div>...</div>;
}
```

### 2. Props

✅ Destructure props:
```tsx
function TaskItem({ task, onClick }: TaskItemProps) { ... }
```

❌ Pass entire props object:
```tsx
function TaskItem(props: TaskItemProps) {
  return <div onClick={() => props.onClick(props.task)} />;
}
```

### 3. Event Handlers

✅ Use descriptive names:
```tsx
onTaskClick, onTaskEdit, onTaskDelete
```

❌ Generic names:
```tsx
onClick, onAction, handleClick
```

### 4. Types

✅ Define component prop types:
```tsx
interface TaskItemProps {
  task: Task;
  onClick: (task: Task) => void;
}
```

❌ Use `any`:
```tsx
function TaskItem({ task, onClick }: any) { ... }
```

### 5. Imports

✅ Use path aliases:
```tsx
import { Button } from '@/components/ui/button';
import { Task } from '@/lib/types';
```

❌ Relative imports:
```tsx
import { Button } from '../../components/ui/button';
```

## Common Issues

### Dialog Not Closing
- Check `open` prop is controlled
- Verify `onOpenChange` updates state
- Ensure mutation calls `setOpen(false)` in `onSuccess`

### Styling Not Applied
- Check `cn()` is used for conditional classes
- Verify Tailwind classes are correct
- Check for typos in class names

### Component Not Rendering
- Check conditional rendering logic
- Verify data is available
- Check loading states
