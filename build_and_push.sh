#!/bin/bash

VERSION=$1

echo "Building Docker image with version: $VERSION"


echo "Building Docker image..."
docker buildx build --platform linux/amd64 . -t redmine-time:$VERSION

echo "Tagging Docker image for registry..."
docker tag redmine-time:$VERSION  dockerregistry.naseljsemslupkuodbananu.com/redmine-time:$VERSION

echo "Pushing Docker image to registry..."
docker push dockerregistry.naseljsemslupkuodbananu.com/redmine-time:$VERSION