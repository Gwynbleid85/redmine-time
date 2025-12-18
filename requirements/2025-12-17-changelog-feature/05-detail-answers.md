# Detail Answers

## Q1: Should the changelog dialog have a "Don't show again for this version" checkbox, or should it automatically mark as seen when closed?
**Answer:** Automatically mark as seen when closed

## Q2: Should the version number in the footer be clickable to open the full changelog history?
**Answer:** Yes

## Q3: Should the CHANGELOG.md file be parsed at build time and bundled with the app, or read dynamically at runtime?
**Answer:** Build time

## Q4: Should the changelog dialog support markdown formatting (headers, lists, code blocks) for richer release notes?
**Answer:** Yes, use `@uiw/react-markdown-preview` for the markdown view

## Q5: Should the build script validate that the CHANGELOG.md contains an entry for the new version before building?
**Answer:** Yes
