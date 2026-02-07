#!/bin/bash
# Compile GSettings schemas

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Check if schemas directory exists and has schema files
if [ ! -d "$PROJECT_ROOT/resources/schemas" ] || [ -z "$(ls -A "$PROJECT_ROOT/resources/schemas"/*.gschema.xml 2>/dev/null)" ]; then
  echo "⚠ No GSettings schemas found. Skipping schema compilation."
  exit 0
fi

# Compile schemas
glib-compile-schemas "$PROJECT_ROOT/resources/schemas"

echo "✓ GSettings schemas compiled successfully"
