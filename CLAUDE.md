# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Pomodoro timer application built with GTK and GJS (GNOME JavaScript bindings). The codebase is written in TypeScript and compiled to JavaScript for execution with `gjs`.

## Development Workflow

### Building
```bash
# Build TypeScript to JavaScript
npm run build
# or
tsc
```

### Running the Application
```bash
# Run the compiled application
gjs -m dist/main.js
```

### Development Commands
```bash
# Watch mode for development
npm run dev
# or
tsc --watch
```

## Architecture

### Technology Stack
- **GTK**: UI framework for native GNOME desktop integration
- **GJS**: JavaScript/TypeScript bindings for GTK and GLib
- **TypeScript**: Primary development language, compiled to JavaScript

### Key Considerations

**GJS Type Definitions**: When working with GTK/GJS in TypeScript, use the appropriate type definitions for GTK 4.0, GLib, and other GNOME libraries. Import types from `gi://Gtk`, `gi://GLib`, etc.

**Module System**: GJS uses ES modules. The `-m` flag when running `gjs` enables module support, which is required for modern JavaScript/TypeScript features.

**Entry Point**: The main application entry point is `dist/main.js` (compiled from TypeScript source). This should contain the GTK application initialization and main window setup.

**GTK Application Pattern**: Follow the standard GTK application lifecycle:
1. Create GtkApplication instance
2. Connect to 'activate' signal
3. Build UI (window, widgets)
4. Run the application main loop

**Pomodoro Timer Logic**: Implement timer state management (work/break cycles), notifications, and UI updates. Consider using GLib.timeout_add for timer intervals rather than JavaScript's setTimeout/setInterval for better GTK integration.
