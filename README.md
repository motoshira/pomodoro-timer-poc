# Pomodoro Timer

![Test](https://github.com/motoshira/pomodoro-timer-poc/workflows/Test/badge.svg)

A Pomodoro timer application built with GTK4 and GJS (GNOME JavaScript bindings), following the MVVM architecture pattern.

## Features

- Work/Rest timer cycles (default: 25min work, 5min rest)
- Start, Stop, Skip, and Reset controls
- Configurable work and rest durations
- Clean MVVM architecture with full test coverage
- Native GTK4 desktop integration

## Architecture

This project follows the MVVM (Model-View-ViewModel) pattern:

- **Models**: Data structures defined with Zod schemas
- **ViewModels**: GObject classes for business logic and property binding
- **Views**: GTK4 UI templates (`.ui` files)

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Development

### Prerequisites

- Node.js 20+
- GTK 4.0
- GJS (GNOME JavaScript runtime)

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Run

```bash
gjs -m dist/main.js
```

### Development Mode (Watch)

```bash
npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Run linter
npm run lint

# Run type check
npm run typecheck
```

See [docs/testing-strategy.md](docs/testing-strategy.md) for comprehensive testing documentation.

### Implementation

Follow the step-by-step implementation guide in [docs/implementation-plan.md](docs/implementation-plan.md).

## CI/CD

GitHub Actions automatically runs on every push and pull request:
- Linting (Biome)
- Type checking (TypeScript)
- Build verification
- Unit tests (Jasmine)

## Project Structure

```
pomodoro-timer-poc/
├── src/
│   ├── models/          # Zod schemas and types
│   ├── viewModels/      # GObject ViewModels
│   ├── view/            # GTK UI templates
│   ├── services/        # Service interfaces and implementations
│   └── main.ts          # Application entry point
├── test/                # Unit tests
├── docs/                # Documentation
│   ├── architecture.md        # Architecture design
│   ├── implementation-plan.md # Step-by-step implementation guide
│   └── testing-strategy.md    # Testing documentation
└── dist/                # Compiled JavaScript (gitignored)
```

## License

MIT
