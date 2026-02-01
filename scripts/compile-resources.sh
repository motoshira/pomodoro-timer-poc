#!/bin/bash
# Compile GResource bundle

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Copy UI files to resources directory
mkdir -p "$PROJECT_ROOT/resources/ui"
cp "$PROJECT_ROOT/src/views/MainWindow/MainWindow.ui" "$PROJECT_ROOT/resources/ui/"
cp "$PROJECT_ROOT/src/views/SettingsDialog/SettingsDialog.ui" "$PROJECT_ROOT/resources/ui/"

# Compile GResource
glib-compile-resources \
  --sourcedir="$PROJECT_ROOT/resources" \
  --target="$PROJECT_ROOT/resources/pomodoro.gresource" \
  "$PROJECT_ROOT/resources/pomodoro.gresource.xml"

echo "✓ GResource compiled successfully"
