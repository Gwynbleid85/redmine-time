#!/bin/bash

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Error: Version parameter required"
    echo "Usage: ./build_and_push.sh <version>"
    echo "Example: ./build_and_push.sh 1.2.0"
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

# Update package.json version
if command -v jq &> /dev/null; then
    jq ".version = \"$VERSION\"" package.json > package.json.tmp && mv package.json.tmp package.json
else
    sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" package.json
fi

# Commit version bump
git add package.json CHANGELOG.md
git commit -m "chore: release v$VERSION"

echo "Building Docker image..."
docker buildx build --platform linux/amd64 . -t redmine-time:$VERSION

echo "Tagging Docker image for registry..."
docker tag redmine-time:$VERSION dockerregistry.naseljsemslupkuodbananu.com/redmine-time:$VERSION

echo "Pushing Docker image to registry..."
docker push dockerregistry.naseljsemslupkuodbananu.com/redmine-time:$VERSION

echo "Successfully released version $VERSION"