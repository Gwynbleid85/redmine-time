#!/bin/bash

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

# Commit version bump
git add package.json CHANGELOG.md src/lib/changelog-data.ts
git commit -m "chore: release v$VERSION"

echo "Building Docker image..."
docker buildx build --platform linux/amd64 . -t redmine-time:$VERSION

echo "Tagging Docker image for registry..."
docker tag redmine-time:$VERSION dockerregistry.naseljsemslupkuodbananu.com/redmine-time:$VERSION

echo "Pushing Docker image to registry..."
docker push dockerregistry.naseljsemslupkuodbananu.com/redmine-time:$VERSION

echo "Successfully released version $VERSION"
