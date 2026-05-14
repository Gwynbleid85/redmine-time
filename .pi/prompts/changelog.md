---
description: Generate and insert a Keep a Changelog entry for a release
argument-hint: "<version>"
---
Generate a changelog entry for version: $ARGUMENTS

If no version was provided, ask the user for the version before making changes.

## Instructions

1. Inspect recent changes since the last release:
   - Run `git log --oneline -20` to review recent commits.
   - Run `git diff HEAD~10 --stat` to review changed files. Adjust the range if the last release is more or fewer commits back.

2. Read `CHANGELOG.md` to understand the existing format and identify the latest version.

3. Analyze the changes and categorize user-visible updates using Keep a Changelog categories:
   - **Added** - New features
   - **Changed** - Changes to existing functionality
   - **Fixed** - Bug fixes
   - **Removed** - Removed features
   - **Security** - Security improvements

4. Draft a new changelog entry using today's date:

   ```markdown
   ## [$ARGUMENTS] - YYYY-MM-DD

   ### Added
   - Feature description

   ### Changed
   - Change description

   ### Fixed
   - Fix description
   ```

5. Show the draft to the user and ask for confirmation before editing files.

6. After confirmation, update `CHANGELOG.md` by inserting the new entry after the header and before the previous version.

7. Update `src/lib/changelog-data.ts`:
   - Set `APP_VERSION` to `$ARGUMENTS`.
   - Add the new entry to the beginning of the `CHANGELOG_ENTRIES` array.

8. Update `package.json` so its `version` matches `$ARGUMENTS`.

9. Run `bun --bun run check` and fix any issues caused by the edits.

10. Summarize the files changed and the verification result.

## Constraints

- Use today's date in `YYYY-MM-DD` format.
- Only include categories that have actual changes.
- Write clear, user-friendly descriptions, not technical commit messages.
- Focus on what users will notice, not internal refactoring.
