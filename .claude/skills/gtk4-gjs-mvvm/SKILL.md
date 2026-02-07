---
name: gtk4-gjs-mvvm
description: "Comprehensive guide for developing GTK4+GJS applications with TypeScript using the MVVM (Model-View-ViewModel) pattern and TDD. Use when working on GTK4 desktop applications, GJS (GNOME JavaScript) projects, implementing MVVM architecture in TypeScript, setting up new GTK projects, implementing features using inside-out TDD approach, or reviewing code for MVVM pattern compliance. Triggers: GTK4, GJS, TypeScript, GNOME, desktop app, MVVM, Model-View-ViewModel, Zod, GObject, jasmine-gjs, esbuild configuration, GResource."
---

# GTK4+GJS MVVM Development Guide

## Overview

This skill provides comprehensive guidance for building GTK4+GJS desktop applications with TypeScript using the MVVM (Model-View-ViewModel) architectural pattern and Test-Driven Development (TDD).

It covers:
- Setting up new GTK4+GJS projects from scratch
- Implementing features using inside-out TDD (Model → Domain → ViewModel → View)
- Following established conventions for each architectural layer
- Avoiding common pitfalls in GJS/GTK development
- Reviewing code for pattern compliance

## When to Use This Skill

Use this skill when:
- **Setting up**: Initializing a new GTK4+GJS project with TypeScript
- **Implementing**: Building features with MVVM pattern and TDD
- **Reviewing**: Checking code for architectural compliance
- **Debugging**: Troubleshooting GJS/GTK-specific issues

## Core Workflows

### Workflow 1: Setting Up a New Project

When the user requests to create a new GTK4+GJS project:

1. **Run the initialization script:**
   ```bash
   node scripts/init-project.mjs <project-name> [target-directory]
   ```

2. **Verify setup:**
   - Check that dependencies installed successfully
   - Confirm TypeScript configuration is correct
   - Validate build scripts are executable

3. **Next steps for user:**
   - `cd <project-directory>`
   - `npm start` to verify hello-world app runs
   - Review README.md for project structure

The template includes:
- Complete package.json with all required dependencies
- Correct tsconfig.json and biome.json configurations
- Sample MVVM implementation (counter app)
- Test suite with jasmine-gjs
- Build scripts for GResource management
- Directory structure following conventions

### Workflow 2: Implementing a Feature (Inside-Out TDD)

When implementing a new feature, follow the inside-out approach:

#### Phase 1: Model Layer
1. Define data models using Zod schemas with `.brand()` type
2. Implement pure functions for all operations (immutable)
3. Write comprehensive tests for pure functions
4. Schema tests only if using `superRefine` or `transform`

**See:** [references/mvvm-pattern.md](#model-layer) for detailed Model patterns
**See:** [references/testing-strategy.md](#model-layer-testing) for testing approach

#### Phase 2: Domain Layer (if needed)
1. Identify cross-model business logic
2. Implement as pure functions in `src/domain/`
3. Write comprehensive tests

**See:** [references/mvvm-pattern.md](#domain-layer) for Domain patterns

#### Phase 3: ViewModel Layer
1. Create GObject-based ViewModel extending `GObject.Object`
2. Store pure model internally (`_model` field)
3. Define GObject properties with `GObject.ParamSpec`
4. Implement `_syncFromModel()` to sync model to properties
5. Call `this.notify('property-name')` on state changes
6. Provide factory function for instantiation
7. Write integration tests with Fake/Mock services

**See:** [references/mvvm-pattern.md](#viewmodel-layer) for ViewModel patterns
**See:** [references/testing-strategy.md](#viewmodel-layer-testing) for testing approach

#### Phase 4: View Layer
1. Create GTK UI template (`.ui` file) with XML
2. Implement controller extending appropriate GTK widget
3. Use `GObject.registerClass` with `Template` and `InternalChildren`
4. Implement `bindViewModel()` method using `bind_property()`
5. Keep controller logic minimal - delegate to ViewModel
6. Validate UI with `gtk4-builder-tool validate`
7. Manually test the application

**See:** [references/mvvm-pattern.md](#view-layer) for View patterns
**See:** [references/gjs-gtk-patterns.md](#template-binding) for GTK patterns

#### Key Principles
- **Test first**: Write tests before implementation (TDD)
- **Pure functions**: Keep business logic in Models/Domain
- **Immutability**: Models return new instances, never mutate
- **Separation**: ViewModels manage state, Views handle rendering
- **Services**: Always mock in tests, inject via factory functions

### Workflow 3: Code Review for Compliance

When reviewing code for MVVM pattern compliance:

#### Model Layer Checklist
- [ ] Uses Zod schemas with `.brand()` for type safety
- [ ] All operations are pure functions (no side effects)
- [ ] Functions return new instances (immutable)
- [ ] Tests cover all pure functions
- [ ] Schema tests only for complex validation (`superRefine`, `transform`)

#### Domain Layer Checklist
- [ ] Cross-model logic is in `src/domain/`
- [ ] Functions are pure (no side effects)
- [ ] Comprehensive tests exist

#### ViewModel Layer Checklist
- [ ] Extends `GObject.Object`
- [ ] Registered with `GObject.registerClass`
- [ ] Properties defined with `GObject.ParamSpec`
- [ ] Calls `notify()` on property changes
- [ ] Has `_syncFromModel()` method
- [ ] Factory function provided
- [ ] Tests check properties, state changes, and signal emission
- [ ] Does NOT test detailed business logic (that's in Model tests)

#### View Layer Checklist
- [ ] Controller extends appropriate GTK widget
- [ ] Uses `Template` for UI binding (from GResource)
- [ ] Defines `InternalChildren` for UI elements
- [ ] Has `bindViewModel()` method using `bind_property()`
- [ ] Logic is minimal - delegates to ViewModel
- [ ] **View creates child Views, not ViewModel**
- [ ] UI validated with `gtk4-builder-tool validate`

#### Service Layer Checklist
- [ ] Interface defined separately from implementation
- [ ] Interface in `src/services/IServiceName.ts`
- [ ] Implementation in `src/services/ServiceName.ts`
- [ ] No tests for Services (tested via mocking)
- [ ] Fake/Mock implementations in `test/services/` for testing

#### Util Layer Checklist
- [ ] Located in `src/utils/`
- [ ] Pure functions when possible
- [ ] Tests exist for complex utilities

#### Configuration Checklist
- [ ] `tsconfig.json`: `useDefineForClassFields: false`
- [ ] esbuild: `--supported:class-field=false`
- [ ] esbuild: `--external:gi://*`
- [ ] esbuild: `--inject:src/init-resources.ts`
- [ ] Build order: schemas → gresource → resources → TypeScript

**See:** [references/pitfalls.md](#summary-checklist) for complete checklist

## Common Pitfalls and Solutions

When encountering errors, consult the pitfalls reference:

**TypeScript issues:**
- Class fields not working → Set `useDefineForClassFields: false`
- Type definition errors → Check `types` in tsconfig.json

**esbuild issues:**
- Runtime crashes → Use `--supported:class-field=false`
- GJS modules bundled → Add `--external:gi://*`
- Resources not found → Use `--inject:src/init-resources.ts`

**GResource issues:**
- UI template not found → Check resource path and build order
- Files not copied → Verify `compile-resources.sh` script

**GObject issues:**
- Property not updating → Call `notify()` after changes
- Wrong property type → Match ParamSpec type to value
- Property binding fails → Use kebab-case in property names

**See:** [references/pitfalls.md](references/pitfalls.md) for comprehensive troubleshooting

## Reference Documents

This skill includes detailed reference documentation:

### [references/mvvm-pattern.md](references/mvvm-pattern.md)
Complete guide to MVVM architecture in GTK4+GJS:
- Model layer: Zod schemas, pure functions, testing
- Domain layer: Cross-model business logic
- ViewModel layer: GObject properties, binding, signals
- View layer: GTK templates, controllers
- Service layer: Interfaces, implementations, mocking
- Util layer: Reusable helpers

**Load when:** Implementing or reviewing MVVM layers

### [references/testing-strategy.md](references/testing-strategy.md)
Testing guide with jasmine-gjs:
- Model/Domain testing: Pure function tests
- ViewModel testing: Integration tests with fakes
- Creating Fake/Mock services
- Test organization and best practices

**Load when:** Writing or reviewing tests

### [references/pitfalls.md](references/pitfalls.md)
Common issues and solutions:
- TypeScript configuration pitfalls
- esbuild configuration issues
- GResource management problems
- GObject property definition errors
- Runtime errors and debugging

**Load when:** Encountering errors or setting up configuration

### [references/gjs-gtk-patterns.md](references/gjs-gtk-patterns.md)
GJS/GTK-specific patterns:
- GObject.registerClass patterns
- Property binding (bind_property)
- Signal handling (connect, emit)
- Template binding (InternalChildren)
- Common GTK widgets
- GTK UI file structure

**Load when:** Working with GJS/GTK APIs or UI templates

## Project Initialization

The skill includes a complete hello-world project template in `assets/hello-world/`.

**Initialize a new project:**
```bash
node scripts/init-project.mjs <project-name> [target-directory]
```

This creates a fully functional counter application demonstrating:
- Model: Simple counter with increment/decrement/reset
- ViewModel: GObject properties and state management
- View: GTK UI with button interactions
- Tests: Complete test suite for Model and ViewModel
- Configuration: All necessary config files
- Build scripts: GResource compilation and TypeScript bundling

**Template includes:**
- `package.json` with all dependencies
- `tsconfig.json` with correct GJS settings
- `biome.json` for linting/formatting
- `main.ts` application entry point
- `src/models/`, `src/views/`, `src/services/` structure
- `test/` with sample tests
- `scripts/` for building resources
- `resources/` for GResource management

## Quick Reference

### Command Quick Start
```bash
# Create new project
node scripts/init-project.mjs my-app

# Build and run
cd my-app
npm start

# Run tests
npm test

# Lint/format
npm run lint

# Validate UI
npm run ui:validate
```

### File Structure
```
src/
├── models/       # Zod schemas + pure functions
├── domain/       # Cross-model business logic
├── views/        # View directories (Controller + ViewModel + .ui)
├── services/     # Interfaces + implementations
├── utils/        # Reusable utilities
└── init-resources.ts  # GResource initialization

test/
├── models/       # Model tests
├── domain/       # Domain tests
├── views/        # ViewModel integration tests (matches src/ structure)
└── services/     # Fake/Mock implementations
```

### Development Cycle
1. **Model** → Write schema + pure functions → Test
2. **Domain** (if needed) → Write cross-model logic → Test
3. **ViewModel** → Write GObject ViewModel → Test
4. **View** → Write UI template + controller → Manual test
5. **Review** → Check compliance with conventions

## Resources

### scripts/
- `init-project.mjs` - Initialize new GTK4+GJS project from template

### references/
- `mvvm-pattern.md` - Complete MVVM architecture guide
- `testing-strategy.md` - Testing approach and examples
- `pitfalls.md` - Common issues and solutions
- `gjs-gtk-patterns.md` - GJS/GTK API patterns

### assets/
- `hello-world/` - Complete project template with counter app

---

**For maximum efficiency**: Follow the inside-out development workflow (Model → Domain → ViewModel → View) with TDD at each layer. This ensures solid foundations before building higher-level components.
