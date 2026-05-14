#!/bin/bash
set -euo pipefail

# Get version from package.json
if command -v jq &> /dev/null; then
    VERSION=$(jq -r '.version' package.json)
else
    VERSION=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
fi

if [ -z "$VERSION" ]; then
    echo "Error: Could not read version from package.json"
    exit 1
fi

# Validate semver format
if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "Error: Version must be in semver format (e.g., 1.2.0)"
    exit 1
fi

# Check if CHANGELOG.md has entry for this version
if ! grep -q "## \[$VERSION\]" CHANGELOG.md; then
    echo "Error: CHANGELOG.md does not contain an entry for version $VERSION"
    echo "Please add a changelog entry before releasing."
    exit 1
fi

echo "Building version: $VERSION"

# Commit version bump if there are changes
git add package.json CHANGELOG.md src/lib/changelog-data.ts
if ! git diff --cached --quiet -- package.json CHANGELOG.md src/lib/changelog-data.ts; then
    git commit -m "chore: release v$VERSION"
else
    echo "No release files changed; skipping commit."
fi

git push

echo "Building and pushing Docker image..."
docker buildx build \
    --platform linux/amd64 \
    -t dockerregistry.naseljsemslupkuodbananu.com/redmine-time:$VERSION \
    --push \
    .

echo "Successfully released version $VERSION"
