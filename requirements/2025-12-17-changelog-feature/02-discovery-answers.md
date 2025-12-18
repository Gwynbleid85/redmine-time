# Discovery Answers

## Q1: Should the changelog popup appear automatically when a user logs in and hasn't seen the latest version?
**Answer:** Yes

## Q2: Should users be able to access the full changelog history from the UI (not just the latest version)?
**Answer:** Yes

## Q3: Should the changelog entries be stored in a markdown file in the repo (e.g., CHANGELOG.md)?
**Answer:** Yes

## Q4: Should the version format follow semantic versioning (major.minor.patch, e.g., 1.2.3)?
**Answer:** Yes

## Q5: Should the build script auto-increment the patch version by default (e.g., 1.0.0 -> 1.0.1)?
**Answer:** No - the version should be specified as a script parameter (e.g., `./build_and_push.sh 1.2.0`)
