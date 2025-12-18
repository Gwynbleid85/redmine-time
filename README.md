<p align="center">
  <img src="docs/github-header-banner.png" alt="Redmine Time Banner" width="100%" />
</p>

<p align="center">
  <strong>Intuitive time entry management for Redmine</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#docker-deployment">Docker</a> •
  <a href="#development">Development</a> •
  <a href="#authors">Authors</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TanStack-Start-FF4154?style=flat" alt="TanStack Start" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Bun-Runtime-000000?style=flat&logo=bun" alt="Bun" />
</p>

---

## Features

- **Calendar View** — Monthly overview of all time entries with easy navigation
- **Daily View** — Detailed breakdown of time entries for any selected day
- **Time Entry Management** — Create, edit, delete, and duplicate time entries
- **Time Placeholders** — Track vacation, sick days, doctor visits, and holidays
- **Custom Issues** — Quick access to frequently used issues
- **Redmine Integration** — Seamless sync with your Redmine instance
- **Changelog System** — Automatic notifications for new version features
- **Responsive Design** — Works great on desktop and mobile

## Tech Stack

| Category          | Technology                                                         |
| ----------------- | ------------------------------------------------------------------ |
| **Framework**     | [TanStack Start](https://tanstack.com/start) (SSR-enabled React)   |
| **Runtime**       | [Bun](https://bun.sh)                                              |
| **UI**            | [React 19](https://react.dev) + [shadcn/ui](https://ui.shadcn.com) |
| **Styling**       | [Tailwind CSS v4](https://tailwindcss.com)                         |
| **Data Fetching** | [TanStack Query](https://tanstack.com/query)                       |
| **Routing**       | [TanStack Router](https://tanstack.com/router) (file-based)        |
| **Database**      | PostgreSQL with [Drizzle ORM](https://orm.drizzle.team)            |
| **Auth**          | [Better Auth](https://better-auth.com)                             |
| **Linting**       | [Biome](https://biomejs.dev)                                       |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.0 or later)
- [PostgreSQL](https://www.postgresql.org/) database
- [Redmine](https://www.redmine.org/) instance with API access

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/redmine_time

# Redmine
REDMINE_URL=https://your-redmine-instance.com
REDMINE_API_KEY=your-api-key

# Auth
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/redmine-time.git
cd redmine-time

# Install dependencies
bun install

# Run database migrations
bun run db:migrate

# Start development server
bun --bun run dev
```

The app will be available at `http://localhost:3000`.

## Docker Deployment

Build and run with Docker:

```bash
# Build the image
docker build -t redmine-time .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL=your-database-url \
  -e REDMINE_URL=your-redmine-url \
  -e REDMINE_API_KEY=your-api-key \
  -e BETTER_AUTH_SECRET=your-secret \
  redmine-time
```

Or use the provided build script:

```bash
./build_and_push.sh 1.0.0
```

## Development

### Available Commands

```bash
bun --bun run dev      # Start development server
bun --bun run build    # Production build
bun --bun run check    # Run linter + type checker
bun --bun run test     # Run tests
bun run db:studio      # Open Drizzle Studio
```

### Project Structure

```
src/
├── components/        # React components
│   ├── ui/           # shadcn/ui components
│   └── features/     # Feature-specific components
├── lib/              # Utilities and helpers
│   ├── db/           # Database schema and queries
│   └── server/       # Server functions
├── routes/           # File-based routes
└── styles/           # Global styles
```

### Adding shadcn Components

```bash
pnpx shadcn@latest add button
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Authors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Gwynbleid85">
        <img src="https://github.com/Gwynbleid85.png" width="80px;" alt="Milos"/><br />
        <sub><b>Gwynbleid85</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/MartinBspheroid">
        <img src="https://github.com/MartinBspheroid.png" width="80px;" alt="Martin"/><br />
        <sub><b>MartinBspheroid</b></sub>
      </a>
    </td>
  </tr>
</table>

## License

This project is private and proprietary.

---

<p align="center">
  Made with ❤️ for better time tracking
</p>
