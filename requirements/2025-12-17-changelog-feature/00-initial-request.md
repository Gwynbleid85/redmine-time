# Initial Request

## Original Request
Update the app so it contains the changelog feature. I need to be able to show users what changes when a new version is released. The info if the changelog was shown should be saved in DB so the data is stored per user. Also update the `build_and_push.sh` script. The info about the version should be in package.json. If I run the script, a new commit with the version bump should be created, then Docker should be built and published. The version should be shown in the page footer.

## Key Requirements Extracted
1. **Changelog Feature**: Display what changed in new versions to users
2. **Per-User Tracking**: Store in database which changelog version each user has seen
3. **Version in package.json**: Use package.json as the source of truth for version
4. **Updated build script**: Auto-increment version, commit, build Docker, push
5. **Footer version display**: Show current version in page footer

## Timestamp
2025-12-17
