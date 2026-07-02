/**
 * Changelog data
 * Version and changelog entries for the application
 */

// Version is defined at build time from package.json
export const APP_VERSION = "1.0.10";

export interface ChangelogEntry {
	version: string;
	date: string;
	content: string;
}

/**
 * Changelog entries - manually maintained to ensure SSR compatibility
 * Update this array when releasing new versions
 */
export const CHANGELOG_ENTRIES: ChangelogEntry[] = [
	{
		version: "1.0.10",
		date: "2026-06-30",
		content: `### Added
- \`Sync quick\` action in the entry dialog for faster creation of sync time entries — [**[benko325](https://github.com/benko325)**]

### Changed
- \`Daily quick\` action duration reduced from 30 minutes to 15 minutes — [**[benko325](https://github.com/benko325)**]
- \`Daily quick\` action now logs time against the \`Organizační meetingy\` issue instead of \`Internal activities\` — [**[benko325](https://github.com/benko325)**]`,
	},
	{
		version: "1.0.9",
		date: "2026-05-14",
		content: `### Fixed
- Issue selector text now truncates cleanly with an ellipsis when entries are too long — [**[benko325](https://github.com/benko325)**]
- Entry forms now reset correctly when reopened — [**[benko325](https://github.com/benko325)**]`,
	},
	{
		version: "1.0.8",
		date: "2026-04-08",
		content: `### Fixed
- Issue list in the entry dialog now loads all issues from Redmine instead of only the first 100`,
	},
	{
		version: "1.0.7",
		date: "2026-03-30",
		content: `### Added
- Quick actions bar in the entry dialog with a \`Daily quick\` action for faster time entry creation`,
	},
	{
		version: "1.0.6",
		date: "2026-03-25",
		content: `### Fixed
- Fixed time entries API function to properly return up to 1000 entries instead of being limited to 100`,
	},
	{
		version: "1.0.5",
		date: "2026-02-28",
		content: `### Fixed
- Increased default API limit for time entries and issues to 1000 to ensure complete data retrieval`,
	},
	{
		version: "1.0.4",
		date: "2026-02-28",
		content: `### Added
- Custom 404 Not Found page with helpful navigation links

### Changed
- Increased time entries fetch limit from 100 to 1000 for better data loading

### Fixed
- Fixed task item click handling to prevent unintended navigation
- Comments now require a minimum length of 1 character when creating time entries`,
	},
	{
		version: "1.0.3",
		date: "2026-01-08",
		content: `### Changed
- Sickday placeholder default duration changed from 8 hours to 4:48 (4.8 hours)
- Improved dark mode scrollbar styling for consistent appearance

### Fixed
- Fixed issue where changing the issue ID when editing a time entry was not being saved
- Fixed activity ID not being updated when editing time entries
- Various accessibility improvements across UI components`,
	},
	{
		version: "1.0.2",
		date: "2026-01-06",
		content: `### Added
- Dark mode support with light/dark/system theme options
- New "Sickday" placeholder type for tracking sick leave days`,
	},
	{
		version: "1.0.1",
		date: "2025-12-18",
		content: `### Added
- New application logo combining Redmine bridge design with hourglass
- Updated GitHub README with banner, badges, and documentation`,
	},
	{
		version: "1.0.0",
		date: "2025-12-17",
		content: `### Added
- Initial release of Redmine Time application
- Calendar view for time entries with monthly navigation
- Daily view for time entries with detailed breakdown
- Time entry management (create, edit, delete, duplicate)
- Time placeholders for vacation, doctor visits, and holidays
- Custom issues management for quick access
- User authentication with Better Auth
- Redmine API integration for seamless time tracking
- Responsive design with Tailwind CSS
- Changelog feature with automatic popup for new versions
- Version display in footer (clickable to view full changelog history)
- Per-user tracking of seen changelog versions`,
	},
];

/**
 * Get changelog entry for a specific version
 */
export function getChangelogForVersion(version: string): ChangelogEntry | null {
	return CHANGELOG_ENTRIES.find((entry) => entry.version === version) ?? null;
}

/**
 * Get the latest changelog entry (current version)
 */
export function getLatestChangelog(): ChangelogEntry | null {
	return CHANGELOG_ENTRIES[0] ?? null;
}
