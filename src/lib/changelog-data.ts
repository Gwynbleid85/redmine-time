/**
 * Changelog data
 * Version and changelog entries for the application
 */

// Version is defined at build time from package.json
export const APP_VERSION = "1.0.2";

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
