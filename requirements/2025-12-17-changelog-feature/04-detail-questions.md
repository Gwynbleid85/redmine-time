# Detail Questions

## Q1: Should the changelog dialog have a "Don't show again for this version" checkbox, or should it automatically mark as seen when closed?
**Default if unknown:** Automatically mark as seen when closed (simpler UX, less cognitive load)

## Q2: Should the version number in the footer be clickable to open the full changelog history?
**Default if unknown:** Yes (provides easy access to changelog without cluttering UI)

## Q3: Should the CHANGELOG.md file be parsed at build time and bundled with the app, or read dynamically at runtime?
**Default if unknown:** Build time (better performance, no extra network requests)

## Q4: Should the changelog dialog support markdown formatting (headers, lists, code blocks) for richer release notes?
**Default if unknown:** Yes (markdown is standard for changelogs and allows better formatting)

## Q5: Should the build script validate that the CHANGELOG.md contains an entry for the new version before building?
**Default if unknown:** No (trust the developer to update changelog, avoid blocking builds)
