#!/bin/bash
# Compile GSettings schemas

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Compile schemas
glib-compile-schemas "$PROJECT_ROOT/schemas"

echo "✓ GSettings schemas compiled successfully"
