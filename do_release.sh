#!/bin/bash
set -euo pipefail

CURR_VERSION="$(node -e "console.log(require('./package.json').version)")"
echo "Current version: $CURR_VERSION"
echo "What's the new version number?"
read -r VERSION
echo "Great! Building the new version $VERSION"
sed -e "s/\"version\": \"$CURR_VERSION\"/\"version\": \"$VERSION\"/" -i '' package.json
echo "Creating git commit for version $VERSION"
git add package.json
git commit -m "Bump version $VERSION"
git tag "$VERSION"
echo "Done! Don't forget to push the commit and the tag!"