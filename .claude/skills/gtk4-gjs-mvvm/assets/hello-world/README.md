# GTK4+GJS Hello World - MVVM Pattern

A minimal GTK4+GJS application demonstrating the MVVM (Model-View-ViewModel) pattern with TypeScript.

This template provides a simple counter application that follows best practices for GTK4+GJS development.

## Prerequisites

- Node.js 22.x
- GJS (GNOME JavaScript bindings)
- GTK 4.0
- GLib development tools (`glib-compile-resources`, `glib-compile-schemas`)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build and run:
   ```bash
   npm start
   ```

3. Run tests:
   ```bash
   npm test
   ```

## Project Structure

```
.
├── src/
│   ├── models/          # Pure data models with Zod schemas
│   ├── views/           # View components (Controller + ViewModel + UI template)
│   ├── services/        # External services (interface + implementation)
│   └── init-resources.ts # GResource initialization
├── test/                # Test files
│   ├── models/          # Model tests
│   ├── views/           # ViewModel tests (matches src/ structure)
│   └── services/        # Service test helpers (Fakes/Mocks)
├── resources/           # GTK resources (generated)
├── scripts/             # Build scripts
├── main.ts              # Application entry point
├── package.json         # NPM dependencies
├── tsconfig.json        # TypeScript configuration
└── biome.json           # Linting configuration
```

## Development Workflow

### MVVM Pattern (Inside-Out Approach)

1. **Model**: Define pure data models with Zod schemas
   - Write tests for pure functions
   - Keep models immutable

2. **ViewModel**: Create GObject-based ViewModels
   - Test property bindings and state changes
   - Emit signals on state changes

3. **View**: Build UI with GTK templates
   - Bind ViewModel properties to UI
   - Manual testing

### Available Commands

- `npm run build` - Build the application
- `npm start` - Build and run the application
- `npm test` - Run tests
- `npm run typecheck` - Type check without building
- `npm run lint` - Lint and format code
- `npm run ui:validate` - Validate GTK UI files
- `npm run ui:simplify` - Simplify GTK UI files

## Key Conventions

### Model Layer
- Use Zod schemas with `.brand()` for type safety
- Implement pure functions (no side effects)
- Test pure functions thoroughly
- Schema tests only needed for complex validation (superRefine, transform)

### ViewModel Layer
- Extend `GObject.Object`
- Register with `GObject.registerClass`
- Define properties with `GObject.ParamSpec`
- Call `notify()` on property changes
- Test properties and state changes

### View Layer
- Separate Controller (.ts) and Template (.ui)
- Use `GObject.registerClass` with Template path
- Define `InternalChildren` for UI elements
- Bind ViewModel with `bind_property()`
- Keep logic minimal, delegate to ViewModel

### Service Layer
- Define interface and implementation separately
- Mock/Fake in tests
- No need for service tests (tested via integration)

## Learn More

See the gtk4-gjs-mvvm skill documentation for detailed guidelines and best practices.
