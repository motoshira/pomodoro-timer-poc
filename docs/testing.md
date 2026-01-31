# Testing Guide

## Overview

This project uses **jasmine-gjs** as the testing framework for GJS/GTK applications. Since GJS cannot directly import npm packages, we use **esbuild** to bundle test files with their dependencies (like Zod).

## Prerequisites

### System Requirements

Install jasmine-gjs on your system:

**Arch Linux:**
```bash
# From AUR
yay -S jasmine-gjs
# or
paru -S jasmine-gjs
```

**Other distributions:**
Check your package manager or build from source: https://github.com/ptomato/jasmine-gjs

### NPM Dependencies

Already included in `package.json`:
- `jasmine-gjs` - Type definitions and package reference
- `@types/jasmine` - TypeScript type definitions
- `esbuild` - Test bundler
- `glob` - File globbing for build script

## Running Tests

### Run all tests
```bash
npm test
```

This command:
1. Compiles TypeScript (`tsc`)
2. Bundles test files with dependencies (`esbuild`)
3. Runs jasmine-gjs

### Run tests in watch mode
```bash
npm run test:watch
```

**Note:** Watch mode does not automatically rebuild/bundle. You need to run `npm run build && npm run bundle:tests` in another terminal when files change.

## Writing Tests

### Directory Structure

```
spec/
├── models/           # Tests for Zod schemas
├── viewModels/       # Tests for GObject ViewModels
└── services/         # Tests for service utilities
```

### Test File Naming

Test files should follow the pattern: `*.spec.ts`

Example:
- `spec/models/TimerSettings.spec.ts`
- `spec/viewModels/TimerViewModel.spec.ts`

### Example Test (with npm package)

```typescript
// spec/models/TimerSettings.spec.ts
import { z } from 'zod';

describe('TimerSettings', () => {
  const TimerSettingsSchema = z.object({
    workDuration: z.number().positive().int(),
    restDuration: z.number().positive().int()
  });

  describe('Schema Validation', () => {
    it('should accept valid settings', () => {
      const validSettings = {
        workDuration: 25,
        restDuration: 5
      };

      const result = TimerSettingsSchema.safeParse(validSettings);
      expect(result.success).toBe(true);
    });

    it('should reject negative values', () => {
      const invalidSettings = {
        workDuration: -5,
        restDuration: 5
      };

      const result = TimerSettingsSchema.safeParse(invalidSettings);
      expect(result.success).toBe(false);
    });
  });
});
```

### Example Test (GJS/GTK only)

```typescript
// spec/services/TimerService.spec.ts
import GLib from 'gi://GLib';

describe('TimerService', () => {
  it('should create a timeout', (done) => {
    let called = false;

    GLib.timeout_add(GLib.PRIORITY_DEFAULT, 10, () => {
      called = true;
      expect(called).toBe(true);
      done();
      return GLib.SOURCE_REMOVE;
    });
  });
});
```

## How It Works

### Build Process

1. **TypeScript Compilation**
   - Source files: `spec/**/*.spec.ts`
   - Output: `dist/spec/**/*.spec.js`

2. **Test Bundling**
   - Script: `scripts/bundle-tests.js`
   - Input: `dist/spec/**/*.spec.js`
   - Output: `dist/spec-bundled/**/*.spec.js`
   - Process: Bundles each test file with npm dependencies (Zod, etc.)

3. **Test Execution**
   - jasmine-gjs runs bundled tests from `dist/spec-bundled/`
   - Configuration: `jasmine.json`

### Why Bundling?

GJS runs in a GNOME environment, not Node.js. It cannot resolve npm packages using `node_modules`. Bundling with esbuild:
- Includes all npm dependencies (Zod) directly in test files
- Preserves GJS-specific imports (`gi://`, `resource://`)
- Produces ES modules that GJS can execute

## Configuration Files

### jasmine.json
```json
{
  "spec_files": [
    "dist/spec-bundled"
  ]
}
```

Tells jasmine-gjs where to find bundled test files.

### scripts/bundle-tests.js

Node.js script that:
- Finds all `*.spec.js` files in `dist/spec/`
- Bundles each with esbuild
- Outputs to `dist/spec-bundled/`

## Jasmine API Reference

### Test Structure
```typescript
describe('Test Suite Name', () => {
  it('should do something', () => {
    expect(actual).toBe(expected);
  });
});
```

### Common Matchers
```typescript
expect(value).toBe(expected);           // ===
expect(value).toEqual(expected);        // deep equality
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(array).toContain(item);
expect(fn).toThrow();
expect(fn).toThrowError('message');
```

### Async Tests
```typescript
it('should handle async', (done) => {
  asyncFunction().then(result => {
    expect(result).toBe(expected);
    done();
  });
});
```

### Setup/Teardown
```typescript
describe('Suite', () => {
  beforeEach(() => {
    // Runs before each test
  });

  afterEach(() => {
    // Runs after each test
  });

  beforeAll(() => {
    // Runs once before all tests
  });

  afterAll(() => {
    // Runs once after all tests
  });
});
```

## Troubleshooting

### jasmine command not found

Make sure jasmine-gjs is installed system-wide:
```bash
which jasmine
# Should output: /usr/bin/jasmine
```

### Import errors with npm packages

Ensure you're running `npm test` (not just `jasmine`), which includes the bundling step.

### GJS warnings

Warnings like "Gio.UnixOutputStream has been moved..." are safe to ignore. They're deprecation warnings from GJS itself.

### Tests not found

Check that:
1. Test files end with `.spec.ts`
2. Tests are in the `spec/` directory
3. TypeScript compiled successfully (`npm run build`)
4. Bundling completed (`npm run bundle:tests`)

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install system dependencies
        run: |
          sudo apt-get update
          sudo apt-get install -y gjs jasmine-gjs

      - name: Install npm dependencies
        run: npm ci

      - name: Run tests
        run: npm test
```

## Best Practices

1. **Keep tests focused**: One assertion per test when possible
2. **Use descriptive names**: Test names should clearly describe what they test
3. **Test edge cases**: Don't just test the happy path
4. **Avoid GJS-specific code in model tests**: Keep models pure TypeScript/Zod
5. **Mock GObject dependencies**: Use spies/mocks for GTK components
6. **Run tests frequently**: Make `npm test` part of your workflow

## Future Enhancements

- Add code coverage reporting
- Implement visual regression testing for GTK widgets
- Create test helpers for common GObject patterns
- Add integration tests for full application flow
