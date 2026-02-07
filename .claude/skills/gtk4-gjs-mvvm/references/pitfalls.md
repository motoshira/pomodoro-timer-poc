# Common Pitfalls in GTK4+GJS Development

This guide documents common issues, their causes, and solutions when developing GTK4+GJS applications with TypeScript.

## Table of Contents

- [TypeScript Configuration](#typescript-configuration)
- [esbuild Configuration](#esbuild-configuration)
- [GResource Management](#gresource-management)
- [GObject Property Definition](#gobject-property-definition)
- [Import/Export Patterns](#importexport-patterns)
- [GTK UI Templates](#gtk-ui-templates)
- [Runtime Errors](#runtime-errors)

## TypeScript Configuration

### Pitfall: Class Fields Not Working with GObject

**Problem:**
```typescript
class MyViewModel extends GObject.Object {
  private count = 0; // ❌ This doesn't work properly
}
```

**Error:**
```
TypeError: Cannot redefine property: count
```

**Why:**
TypeScript's `useDefineForClassFields: true` (default in ES2022) conflicts with GObject's property system. GObject defines properties on the prototype, but TypeScript tries to define them as own properties.

**Solution:**
Set `useDefineForClassFields: false` in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "useDefineForClassFields": false,
    "target": "ES2022"
  }
}
```

**Alternative:**
Use `declare` for GObject-managed fields:

```typescript
class MyViewModel extends GObject.Object {
  declare private count: number;

  _init() {
    super._init();
    this.count = 0; // Set in _init instead
  }
}
```

---

### Pitfall: Wrong Module Resolution

**Problem:**
```
Cannot find module 'gi://Gtk'
```

**Why:**
The wrong `moduleResolution` setting in tsconfig.json.

**Solution:**
Use `bundler` module resolution:

```json
{
  "compilerOptions": {
    "module": "ES2022",
    "moduleResolution": "bundler"
  }
}
```

---

### Pitfall: Missing Type Definitions

**Problem:**
```
Cannot find name 'Gtk'
Cannot find name 'GObject'
```

**Why:**
GJS type definitions are not included in tsconfig.

**Solution:**
Install and reference type definitions:

```bash
npm install --save-dev @girs/gjs @girs/gtk-4.0 @girs/gio-2.0 @girs/glib-2.0
```

```json
{
  "compilerOptions": {
    "types": [
      "@girs/gjs",
      "@girs/gtk-4.0",
      "@girs/gio-2.0",
      "@girs/glib-2.0"
    ]
  }
}
```

## esbuild Configuration

### Pitfall: Class Fields Break at Runtime

**Problem:**
Code compiles but crashes at runtime:
```
TypeError: Cannot redefine property: _model
```

**Why:**
esbuild transforms class fields by default, conflicting with GObject.

**Solution:**
Disable class field support in esbuild:

```json
{
  "scripts": {
    "build:ts": "esbuild main.ts --bundle --supported:class-field=false --outfile=dist/main.js"
  }
}
```

---

### Pitfall: GJS Modules Bundled into Output

**Problem:**
```
Error: Cannot load native module gi://Gtk
```

**Why:**
esbuild tries to bundle GJS native modules, which can't be bundled.

**Solution:**
Mark GJS imports as external:

```json
{
  "scripts": {
    "build:ts": "esbuild main.ts --external:gi://* --bundle --outfile=dist/main.js"
  }
}
```

---

### Pitfall: Module Format Mismatch

**Problem:**
```
ReferenceError: exports is not defined
```

**Why:**
Wrong output format for GJS.

**Solution:**
Use ES module format:

```json
{
  "scripts": {
    "build:ts": "esbuild main.ts --format=esm --bundle --outfile=dist/main.js"
  }
}
```

Run with `-m` flag:
```bash
gjs -m dist/main.js
```

---

### Pitfall: Missing Resource Initialization

**Problem:**
```
Gtk-WARNING: Could not find resource file
```

**Why:**
GResource not initialized before GTK widgets try to load templates.

**Solution:**
Use `--inject` to ensure resources are loaded first:

```json
{
  "scripts": {
    "build:ts": "esbuild main.ts --inject:src/init-resources.ts --bundle --outfile=dist/main.js"
  }
}
```

**src/init-resources.ts:**
```typescript
import Gio from 'gi://Gio';

const resource = Gio.Resource.load('resources/myapp.gresource');
Gio.resources_register(resource);
```

## GResource Management

### Pitfall: UI Template Not Found

**Problem:**
```
Gtk-CRITICAL: gtk_builder_extend_with_template: assertion 'GTK_IS_BUILDER (builder)' failed
```

**Why:**
GResource not compiled, or wrong resource path in code.

**Solution:**

1. Ensure build order is correct:
```json
{
  "scripts": {
    "build": "npm run build:schemas && npm run generate:gresource && npm run build:resources && npm run build:ts"
  }
}
```

2. Check resource path matches:
```typescript
// MainWindow.ts
Template: 'resource:///org/example/myapp/ui/MainWindow.ui'
```

```xml
<!-- myapp.gresource.xml -->
<gresource prefix="/org/example/myapp">
  <file>ui/MainWindow.ui</file>
</gresource>
```

---

### Pitfall: UI Files Not Copied

**Problem:**
GResource compilation fails with "file not found".

**Why:**
UI files in `src/views/` are not copied to `resources/ui/` before compilation.

**Solution:**
Copy UI files in build script:

```bash
#!/bin/bash
# scripts/compile-resources.sh

mkdir -p resources/ui

find src -name "*.ui" -type f | while read -r ui_file; do
  cp "$ui_file" resources/ui/
done

glib-compile-resources \
  --sourcedir=resources \
  --target=resources/myapp.gresource \
  resources/myapp.gresource.xml
```

---

### Pitfall: Hardcoded UI File List

**Problem:**
Must manually update `gresource.xml` every time a UI file is added.

**Why:**
Static gresource.xml file.

**Solution:**
Generate gresource.xml from Mustache template:

**resources/myapp.gresource.xml.mustache:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/org/example/myapp">
    {{#uiFiles}}
    <file>ui/{{name}}</file>
    {{/uiFiles}}
  </gresource>
</gresources>
```

**scripts/generate-gresource-xml.mjs:**
```javascript
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import Mustache from 'mustache';

const template = readFileSync('resources/myapp.gresource.xml.mustache', 'utf-8');
const uiFiles = readdirSync('resources/ui')
  .filter(f => f.endsWith('.ui'))
  .sort()
  .map(name => ({ name }));

const output = Mustache.render(template, { uiFiles });
writeFileSync('resources/myapp.gresource.xml', output);
```

## GObject Property Definition

### Pitfall: Property Not Updating UI

**Problem:**
UI doesn't update when ViewModel property changes.

**Why:**
Forgot to call `notify()` or wrong BindingFlags.

**Solution:**

1. Call `notify()` after changing property:
```typescript
increment(): void {
  this._count++;
  this.notify('count'); // ✅ Emit signal
}
```

2. Use correct binding flags:
```typescript
viewModel.bind_property(
  'count',
  label,
  'label',
  GObject.BindingFlags.SYNC_CREATE, // ✅ Sync immediately
);
```

---

### Pitfall: Wrong Property Type

**Problem:**
```
TypeError: Expected type 'gchararray' but got 'gint'
```

**Why:**
Property type mismatch between definition and usage.

**Solution:**
Match types correctly:

```typescript
// If property is number, use int or double
Properties: {
  count: GObject.ParamSpec.int(
    'count',
    'Count',
    'Counter value',
    GObject.ParamFlags.READABLE,
    -2147483648, // G_MININT32
    2147483647,  // G_MAXINT32
    0,
  ),
}

// If property is string, use string
Properties: {
  label: GObject.ParamSpec.string(
    'label',
    'Label',
    'Label text',
    GObject.ParamFlags.READABLE,
    'default',
  ),
}
```

---

### Pitfall: Property Name Mismatch

**Problem:**
Property binding silently fails.

**Why:**
Property name in ParamSpec doesn't match getter name.

**Solution:**
Use kebab-case in ParamSpec, match in binding:

```typescript
Properties: {
  'display-text': GObject.ParamSpec.string(...), // ✅ kebab-case
}

get displayText(): string { // camelCase in TS
  return this._displayText;
}

// Binding uses kebab-case
viewModel.bind_property('display-text', label, 'label', ...);
```

---

### Pitfall: Missing GTypeName

**Problem:**
```
Error: Invalid GType
```

**Why:**
`GTypeName` not specified in `registerClass`.

**Solution:**
Always provide unique GTypeName:

```typescript
const MyViewModelClass = GObject.registerClass(
  {
    GTypeName: 'MyAppMyViewModel', // ✅ Unique name
    Properties: { ... },
  },
  _MyViewModel,
);
```

## Import/Export Patterns

### Pitfall: Circular Dependencies

**Problem:**
```
ReferenceError: Cannot access 'X' before initialization
```

**Why:**
Circular imports between modules.

**Solution:**

1. Use type-only imports when possible:
```typescript
import type { TimerViewModel } from './TimerViewModel'; // ✅ Type-only
```

2. Refactor to remove circular dependency:
```
Model → ViewModel → View  (✅ Unidirectional)
Model ↔ ViewModel         (❌ Circular)
```

---

### Pitfall: Default Export of GObject Class

**Problem:**
Type errors when using the class.

**Why:**
GObject classes should be named exports.

**Solution:**
Export both class and type:

```typescript
// ❌ Don't use default export
export default MainWindow;

// ✅ Use named exports
export const MainWindow = GObject.registerClass(...);
export type MainWindow = InstanceType<typeof MainWindow>;
```

## GTK UI Templates

### Pitfall: Invalid UI XML

**Problem:**
```
Gtk-CRITICAL: Error parsing template
```

**Why:**
Syntax error in UI file.

**Solution:**
Validate UI files with gtk4-builder-tool:

```bash
gtk4-builder-tool validate src/views/MainWindow/MainWindow.ui
```

Add to package.json:
```json
{
  "scripts": {
    "ui:validate": "sh -c 'for file in src/views/*/*.ui; do gtk4-builder-tool validate \"$file\" || exit 1; done'"
  }
}
```

---

### Pitfall: InternalChildren Not Found

**Problem:**
```
TypeError: this._myButton is undefined
```

**Why:**
Widget ID in UI template doesn't match InternalChildren.

**Solution:**
Match IDs exactly:

```xml
<!-- MainWindow.ui -->
<object class="GtkButton" id="myButton">
```

```typescript
// MainWindow.ts
export const MainWindow = GObject.registerClass(
  {
    InternalChildren: ['myButton'], // ✅ Match id from UI
  },
  _MainWindow,
);

class _MainWindow extends Gtk.ApplicationWindow {
  private _myButton!: Gtk.Button; // ✅ Prefix with underscore
}
```

---

### Pitfall: Template Class Name Mismatch

**Problem:**
Template not loaded.

**Why:**
Class name in template doesn't match GTypeName.

**Solution:**
Match names exactly:

```xml
<!-- UI template -->
<template class="MyAppMainWindow" parent="GtkApplicationWindow">
```

```typescript
// TypeScript
const MainWindow = GObject.registerClass(
  {
    GTypeName: 'MyAppMainWindow', // ✅ Must match template class
    Template: 'resource:///org/example/myapp/ui/MainWindow.ui',
  },
  _MainWindow,
);
```

## Runtime Errors

### Pitfall: Signal Connection Before Initialization

**Problem:**
```
TypeError: this._button is undefined
```

**Why:**
Trying to connect signals before `_init()` completes.

**Solution:**
Connect signals in `_init()`:

```typescript
class _MainWindow extends Gtk.ApplicationWindow {
  private _button!: Gtk.Button;

  _init(params?: Partial<Gtk.ApplicationWindow.ConstructorProps>) {
    super._init(params);

    // ✅ Connect after super._init()
    this._button.connect('clicked', () => this._onButtonClicked());
  }

  private _onButtonClicked(): void {
    // Handle click
  }
}
```

---

### Pitfall: Forgot to Run GJS with -m Flag

**Problem:**
```
SyntaxError: import declarations may only appear at top level of a module
```

**Why:**
GJS needs `-m` flag for ES module support.

**Solution:**
Always use `-m` flag:

```bash
gjs -m dist/main.js  # ✅ Correct
gjs dist/main.js     # ❌ Wrong
```

---

### Pitfall: Application Not Exiting

**Problem:**
Application window closes but process doesn't exit.

**Why:**
Active timers or event listeners not cleaned up.

**Solution:**

1. Clean up timers:
```typescript
class _TimerViewModel extends GObject.Object {
  private _timerId: number | null = null;

  stop(): void {
    if (this._timerId !== null) {
      GLib.Source.remove(this._timerId);
      this._timerId = null;
    }
  }
}
```

2. Handle window close:
```typescript
window.connect('close-request', () => {
  viewModel.stop(); // Clean up
  return false; // Allow close
});
```

## Debugging Tips

### Enable Verbose Logging

```bash
G_MESSAGES_DEBUG=all gjs -m dist/main.js
```

### Check GResource Contents

```bash
glib-compile-resources --generate-dependencies resources/myapp.gresource.xml
```

### Inspect GObject Properties

```typescript
console.log(Object.getOwnPropertyNames(viewModel));
console.log(viewModel.constructor.$gtype.name);
```

### Type Check Without Running

```bash
npm run typecheck
```

### Validate UI Files

```bash
npm run ui:validate
```

## Summary Checklist

Before building, ensure:

- [ ] `useDefineForClassFields: false` in tsconfig.json
- [ ] `--supported:class-field=false` in esbuild command
- [ ] `--external:gi://*` in esbuild command
- [ ] `--inject:src/init-resources.ts` in esbuild command
- [ ] GResource build happens before TypeScript build
- [ ] UI files copied to resources/ui/ before glib-compile-resources
- [ ] All UI templates validated with gtk4-builder-tool
- [ ] GTypeName matches template class name
- [ ] InternalChildren IDs match UI element IDs
- [ ] Run with `gjs -m` flag

Following these guidelines will help avoid most common pitfalls in GTK4+GJS development!
