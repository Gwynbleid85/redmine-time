# Requirements Specification: Changelog Feature

## Problem Statement
Users need to be informed about new features and changes when a new version of the application is released. Currently, there is no mechanism to communicate updates to users or track which version they've seen.

## Solution Overview
Implement a changelog system that:
1. Displays a dialog with release notes when users log in after a new version is deployed
2. Tracks per-user which version's changelog they've seen in the database
3. Shows the current version in the page footer (clickable to view full history)
4. Updates `build_and_push.sh` to handle version management and validation

---

## Functional Requirements

### FR1: Changelog Dialog
- **FR1.1**: Display a dialog automatically when an authenticated user hasn't seen the current version's changelog
- **FR1.2**: Dialog shows the changelog content for the current version (parsed from CHANGELOG.md)
- **FR1.3**: Render changelog content with markdown support using `@uiw/react-markdown-preview`
- **FR1.4**: Automatically mark the version as "seen" when the dialog is closed
- **FR1.5**: Dialog should have a clear title showing the version number (e.g., "What's New in v1.2.0")

### FR2: Changelog History
- **FR2.1**: Users can access full changelog history by clicking the version number in the footer
- **FR2.2**: History dialog shows all versions with their release notes
- **FR2.3**: Each version entry shows version number, date, and changes

### FR3: Version Display
- **FR3.1**: Display current app version in the page footer
- **FR3.2**: Version number is clickable and opens the changelog history dialog
- **FR3.3**: Version is read from `package.json` at build time

### FR4: Database Tracking
- **FR4.1**: Store `lastSeenVersion` per user in the database
- **FR4.2**: Compare user's `lastSeenVersion` with current app version to determine if dialog should show
- **FR4.3**: Update `lastSeenVersion` when user closes the changelog dialog

### FR5: Build Script
- **FR5.1**: Accept version as a script parameter (e.g., `./build_and_push.sh 1.2.0`)
- **FR5.2**: Validate version follows semantic versioning format (x.y.z)
- **FR5.3**: Validate CHANGELOG.md contains an entry for the specified version
- **FR5.4**: Update `package.json` with the new version
- **FR5.5**: Create a git commit with the version bump
- **FR5.6**: Build and push Docker image with the version tag

---

## Technical Requirements

### TR1: Database Schema
Add to `src/lib/db/schema.ts`:
```typescript
// Add lastSeenVersion column to user table
lastSeenVersion: text("last_seen_version"),
```

### TR2: New Dependencies
```bash
bun add @uiw/react-markdown-preview
```

### TR3: New Files to Create

| File | Purpose |
|------|---------|
| `src/lib/server/changelog.ts` | Server functions for getting/updating changelog seen status |
| `src/components/features/changelog/changelog-dialog.tsx` | Changelog dialog component |
| `src/components/features/changelog/changelog-history-dialog.tsx` | Full history dialog component |
| `src/components/features/changelog/index.ts` | Barrel export |
| `src/hooks/useChangelog.ts` | Hook for changelog state and mutations |
| `src/lib/changelog-data.ts` | Parsed changelog data (generated at build time) |
| `CHANGELOG.md` | Changelog content file |

### TR4: Files to Modify

| File | Changes |
|------|---------|
| `src/lib/db/schema.ts` | Add `lastSeenVersion` to user table |
| `src/routes/__root.tsx` | Add version to footer, integrate changelog dialogs |
| `package.json` | Add `version` field (e.g., "1.0.0") |
| `build_and_push.sh` | Add version validation, package.json update, git commit |
| `vite.config.ts` | Add build-time changelog parsing (if needed) |

### TR5: Server Functions Pattern
Follow existing pattern in `src/lib/server/custom-issues.ts`:
- `getChangelogStatusFn` - Get user's last seen version
- `markChangelogSeenFn` - Update user's last seen version

### TR6: CHANGELOG.md Format
Use standard Keep a Changelog format:
```markdown
# Changelog

## [1.1.0] - 2025-12-17
### Added
- New feature description

### Fixed
- Bug fix description

## [1.0.0] - 2025-12-01
### Added
- Initial release
```

### TR7: Build Script Logic
```bash
#!/bin/bash
VERSION=$1

# 1. Validate version format (semver)
# 2. Validate CHANGELOG.md has entry for version
# 3. Update package.json version
# 4. Git commit with message "chore: bump version to $VERSION"
# 5. Build Docker image
# 6. Tag and push to registry
```

---

## Implementation Hints

### Changelog Parsing
Parse CHANGELOG.md at build time using a Vite plugin or build script:
- Extract version entries with regex: `/## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})/`
- Store as JSON object with version as key

### Version Access
Import version from package.json:
```typescript
import packageJson from "../../package.json";
const APP_VERSION = packageJson.version;
```

### Dialog Trigger Logic
In `__root.tsx` or a layout component:
1. Check if user is authenticated
2. Fetch user's `lastSeenVersion` from server
3. Compare with current `APP_VERSION`
4. If different (or null), show changelog dialog
5. On dialog close, call `markChangelogSeenFn`

---

## Acceptance Criteria

- [ ] New users see changelog dialog on first login after feature deployment
- [ ] Returning users see changelog dialog only when version changes
- [ ] Dialog automatically marks version as seen on close
- [ ] Version displays in footer and is clickable
- [ ] Clicking footer version opens full changelog history
- [ ] Changelog renders markdown formatting correctly
- [ ] `./build_and_push.sh 1.2.0` validates version exists in CHANGELOG.md
- [ ] Build script updates package.json and creates git commit
- [ ] Docker image is tagged with version number

---

## Assumptions
- The app will start at version 1.0.0
- Only authenticated users see the changelog (public/guest users do not)
- The changelog dialog appears after successful authentication, not blocking login
- Version comparison is simple string comparison (semver ordering not required)
