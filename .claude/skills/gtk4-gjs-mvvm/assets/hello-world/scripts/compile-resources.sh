#!/bin/bash
# Compile GResource bundle

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Copy UI files to resources directory
mkdir -p "$PROJECT_ROOT/resources/ui"

# Find all .ui files under src/ and copy them to resources/ui/
find "$PROJECT_ROOT/src" -name "*.ui" -type f | while read -r ui_file; do
  cp "$ui_file" "$PROJECT_ROOT/resources/ui/"
  echo "Copied: $(basename "$ui_file")"
done

# Compile GResource
glib-compile-resources \
  --sourcedir="$PROJECT_ROOT/resources" \
  --target="$PROJECT_ROOT/resources/helloworld.gresource" \
  "$PROJECT_ROOT/resources/helloworld.gresource.xml"

echo "✓ GResource compiled successfully"
