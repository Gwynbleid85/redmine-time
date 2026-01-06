# Add Changelog Entry

Generate a changelog entry for version: $ARGUMENTS

## Instructions

1. First, get the git diff to understand what changed since the last release:
   - Run `git log --oneline -20` to see recent commits
   - Run `git diff HEAD~10 --stat` to see changed files (adjust number as needed based on commits since last release)

2. Read the current `CHANGELOG.md` to understand the format and see the last version

3. Analyze the changes and categorize them into:
   - **Added** - New features
   - **Changed** - Changes to existing functionality
   - **Fixed** - Bug fixes
   - **Removed** - Removed features
   - **Security** - Security improvements

4. Generate a new changelog entry in Keep a Changelog format:
   ```markdown
   ## [$ARGUMENTS] - YYYY-MM-DD

   ### Added
   - Feature description

   ### Changed
   - Change description

   ### Fixed
   - Fix description
   ```

5. Insert the new entry at the top of the changelog (after the header, before the previous version)

6. Also update `src/lib/changelog-data.ts`:
   - Update `APP_VERSION` to the new version
   - Add a new entry to `CHANGELOG_ENTRIES` array at the beginning

7. Show the user what was added and ask for confirmation before saving

8. After you saved the changelog, update the `package.json` version to match the new version

## Important
- Use today's date in YYYY-MM-DD format
- Only include categories that have actual changes
- Write clear, user-friendly descriptions (not technical commit messages)
- Focus on what the user will notice, not internal refactoring
