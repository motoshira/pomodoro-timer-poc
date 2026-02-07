# Testing Strategy for GTK4+GJS Applications

This guide describes testing strategies for GTK4+GJS applications using jasmine-gjs.

## Table of Contents

- [Overview](#overview)
- [Test Setup](#test-setup)
- [Model Layer Testing](#model-layer-testing)
- [Domain Layer Testing](#domain-layer-testing)
- [ViewModel Layer Testing](#viewmodel-layer-testing)
- [Service Test Helpers](#service-test-helpers)
- [Test Organization](#test-organization)
- [Best Practices](#best-practices)

## Overview

### Testing Philosophy

- **Model/Domain**: Comprehensive unit tests (pure functions are easy to test)
- **ViewModel**: Integration tests with fake services
- **View**: Manual testing (UI validation with gtk4-builder-tool)
- **Service**: No tests (mock in other layers)

### Test Framework

We use **jasmine-gjs** - a Jasmine test runner designed for GJS environments.

## Test Setup

### Configuration

**package.json:**
```json
{
  "scripts": {
    "test": "esbuild test/index.ts --bundle --format=esm --platform=neutral --external:gi://* --outfile=dist/test-bundle.js && jasmine --module dist/test-bundle.js",
    "test:watch": "jasmine --watch"
  },
  "devDependencies": {
    "@types/jasmine": "^6.0.0",
    "jasmine-gjs": "^2.6.7"
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "types": ["@girs/gjs", "@girs/gtk-4.0", "jasmine"]
  }
}
```

### Test Entry Point

**test/index.ts:**
```typescript
import 'jasmine';

// Import all test files
import './models/TimerSettings.spec';
import './models/TimerModel.spec';
import './views/TimerViewModel.spec';
```

## Model Layer Testing

### What to Test

- ✅ Pure functions (all of them)
- ✅ Edge cases and boundary conditions
- ✅ Complex validation (superRefine, transform)
- ❌ Simple schema definitions (no custom validation)

### Example: Testing Pure Functions

```typescript
import {
  createInitialModel,
  start,
  stop,
  tick,
  reset,
} from '../../src/models/TimerModel';
import { createDefaultSettings } from '../../src/models/TimerSettings';

describe('TimerModel', () => {
  describe('createInitialModel()', () => {
    it('Should create initial model with correct remainingSeconds', () => {
      const settings = createDefaultSettings();
      const model = createInitialModel(settings);

      expect(model.remainingSeconds).toBe(1500); // 25 min * 60
    });

    it('Should start in WORK mode', () => {
      const settings = createDefaultSettings();
      const model = createInitialModel(settings);

      expect(model.currentMode).toBe('WORK');
    });

    it('Should start in STOPPED state', () => {
      const settings = createDefaultSettings();
      const model = createInitialModel(settings);

      expect(model.state).toBe('STOPPED');
    });
  });

  describe('start()', () => {
    it('Should change state from STOPPED to RUNNING', () => {
      const model = createInitialModel(createDefaultSettings());
      const { result, hasChanged } = start(model);

      expect(result.state).toBe('RUNNING');
      expect(hasChanged).toBe(true);
    });

    it('Should not change when already RUNNING', () => {
      const model = {
        ...createInitialModel(createDefaultSettings()),
        state: 'RUNNING'
      } as TimerModel;
      const { result, hasChanged } = start(model);

      expect(result.state).toBe('RUNNING');
      expect(hasChanged).toBe(false);
    });

    it('Should preserve other fields when starting', () => {
      const model = createInitialModel(createDefaultSettings());
      const { result } = start(model);

      expect(result.remainingSeconds).toBe(model.remainingSeconds);
      expect(result.currentMode).toBe(model.currentMode);
    });
  });

  describe('tick()', () => {
    it('Should decrement remainingSeconds by 1', () => {
      const model = createInitialModel(createDefaultSettings());
      const result = tick(model);

      expect(result.remainingSeconds).toBe(1499);
    });

    it('Should not change when remainingSeconds is 0', () => {
      const model = {
        ...createInitialModel(createDefaultSettings()),
        remainingSeconds: 0,
      } as TimerModel;
      const result = tick(model);

      expect(result.remainingSeconds).toBe(0);
    });

    it('Should not mutate original model', () => {
      const model = createInitialModel(createDefaultSettings());
      const original = model.remainingSeconds;

      tick(model);

      expect(model.remainingSeconds).toBe(original);
    });

    it('Should handle multiple ticks', () => {
      let model = createInitialModel(createDefaultSettings());

      model = tick(model);
      expect(model.remainingSeconds).toBe(1499);

      model = tick(model);
      expect(model.remainingSeconds).toBe(1498);

      model = tick(model);
      expect(model.remainingSeconds).toBe(1497);
    });
  });
});
```

### Testing Patterns

**Helper factory for test data:**
```typescript
const createSettings = (workDuration: number, restDuration = 5) => {
  const defaults = createDefaultSettings();
  const settings = updateSettings(defaults, { workDuration, restDuration });
  if (!settings) {
    throw new Error('Failed to create settings');
  }
  return settings;
};

it('Should handle different work durations', () => {
  const model = createInitialModel(createSettings(50));
  expect(model.remainingSeconds).toBe(3000);
});
```

**Testing immutability:**
```typescript
it('Should not mutate original counter', () => {
  const counter = createInitialCounter();
  const originalCount = counter.count;

  increment(counter);

  expect(counter.count).toBe(originalCount);
});
```

**Testing return values with metadata:**
```typescript
it('Should return hasChanged flag', () => {
  const model = createInitialModel(settings);
  const { result, hasChanged } = start(model);

  expect(hasChanged).toBe(true);
});
```

## Domain Layer Testing

### What to Test

- ✅ All domain functions
- ✅ Cross-model interactions
- ✅ Business rule enforcement
- ✅ Edge cases

### Example

```typescript
import { calculateRemainingCycles, shouldTakeLongBreak } from '../../src/domain/TimerCycle';

describe('TimerCycle Domain Logic', () => {
  describe('shouldTakeLongBreak()', () => {
    it('Should return true after 4 cycles', () => {
      expect(shouldTakeLongBreak(4, 4)).toBe(true);
    });

    it('Should return false after 3 cycles', () => {
      expect(shouldTakeLongBreak(3, 4)).toBe(false);
    });

    it('Should return true after 8 cycles (second interval)', () => {
      expect(shouldTakeLongBreak(8, 4)).toBe(true);
    });

    it('Should handle edge case of 0 cycles', () => {
      expect(shouldTakeLongBreak(0, 4)).toBe(false);
    });
  });
});
```

## ViewModel Layer Testing

### What to Test

- ✅ Property initialization
- ✅ Property getters return correct values
- ✅ Methods trigger expected state changes
- ✅ `notify` signals are emitted on changes
- ❌ Detailed business logic (already tested in Model)

### Setup Pattern

```typescript
import { createTimerViewModel, type TimerViewModel } from '../../src/views/MainWindow/TimerViewModel';
import { FakeTimerService } from '../services/FakeTimerService';
import { MockSettingsStorage } from '../services/MockSettingsStorage';

describe('TimerViewModel', () => {
  let timerService: FakeTimerService;
  let storage: MockSettingsStorage;
  let viewModel: TimerViewModel;

  beforeEach(() => {
    timerService = new FakeTimerService();
    storage = new MockSettingsStorage();
    viewModel = createTimerViewModel(timerService, storage);
  });

  // Tests...
});
```

### Testing Initialization

```typescript
describe('Initialization', () => {
  it('Should initialize with default settings', () => {
    const defaultSettings = storage.getDefaultSettings();
    expect(viewModel.settings.workDuration).toBe(defaultSettings.workDuration);
    expect(viewModel.settings.restDuration).toBe(defaultSettings.restDuration);
  });

  it('Should start in WORK mode', () => {
    expect(viewModel.currentMode).toBe('WORK');
  });

  it('Should start in STOPPED state', () => {
    expect(viewModel.state).toBe('STOPPED');
  });

  it('Should set remainingSeconds correctly', () => {
    const defaultSettings = storage.getDefaultSettings();
    const expectedSeconds = defaultSettings.workDuration * 60;
    expect(viewModel.remainingSeconds).toBe(expectedSeconds);
  });
});
```

### Testing Computed Properties

```typescript
describe('Computed Properties', () => {
  describe('displayTime', () => {
    it('Should format "25:00" for 1500 seconds', () => {
      expect(viewModel.displayTime).toBe('25:00');
    });

    it('Should format "01:30" for 90 seconds', () => {
      // Manually set internal state for testing
      // biome-ignore lint/suspicious/noExplicitAny: test helper
      (viewModel as any)._model = {
        ...(viewModel as any)._model,
        remainingSeconds: 90
      };
      // biome-ignore lint/suspicious/noExplicitAny: test helper
      (viewModel as any)._syncFromModel();

      expect(viewModel.displayTime).toBe('01:30');
    });

    it('Should pad single digits with zeros', () => {
      // biome-ignore lint/suspicious/noExplicitAny: test helper
      (viewModel as any)._model = {
        ...(viewModel as any)._model,
        remainingSeconds: 65
      };
      // biome-ignore lint/suspicious/noExplicitAny: test helper
      (viewModel as any)._syncFromModel();

      expect(viewModel.displayTime).toBe('01:05');
    });
  });
});
```

### Testing State Changes

```typescript
describe('State Changes', () => {
  describe('start()', () => {
    it('Should change state to RUNNING', () => {
      viewModel.start();
      expect(viewModel.state).toBe('RUNNING');
    });

    it('Should start timer via TimerService', () => {
      viewModel.start();
      expect(timerService.getActiveCount()).toBe(1);
    });

    it('Should do nothing if already RUNNING', () => {
      viewModel.start();
      const firstCount = timerService.getActiveCount();

      viewModel.start(); // Try again

      expect(timerService.getActiveCount()).toBe(firstCount);
    });
  });

  describe('stop()', () => {
    it('Should change state to STOPPED', () => {
      viewModel.start();
      viewModel.stop();
      expect(viewModel.state).toBe('STOPPED');
    });

    it('Should stop timer via TimerService', () => {
      viewModel.start();
      expect(timerService.getActiveCount()).toBe(1);

      viewModel.stop();
      expect(timerService.getActiveCount()).toBe(0);
    });
  });
});
```

### Testing Signal Emission

```typescript
describe('Signal Emission', () => {
  it('Should emit notify::count on increment', () => {
    const countSpy = jasmine.createSpy('count-notify');
    viewModel.connect('notify::count', countSpy);

    viewModel.increment();

    expect(countSpy).toHaveBeenCalled();
  });

  it('Should emit notify::display-text on increment', () => {
    const displayTextSpy = jasmine.createSpy('display-text-notify');
    viewModel.connect('notify::display-text', displayTextSpy);

    viewModel.increment();

    expect(displayTextSpy).toHaveBeenCalled();
  });

  it('Should emit multiple signals on reset', () => {
    const countSpy = jasmine.createSpy('count-notify');
    const displayTextSpy = jasmine.createSpy('display-text-notify');

    viewModel.increment();

    viewModel.connect('notify::count', countSpy);
    viewModel.connect('notify::display-text', displayTextSpy);

    viewModel.reset();

    expect(countSpy).toHaveBeenCalled();
    expect(displayTextSpy).toHaveBeenCalled();
  });
});
```

### Testing with Fake Services

```typescript
describe('Timer Integration', () => {
  it('Should decrement on tick', () => {
    const initialSeconds = viewModel.remainingSeconds;
    viewModel.start();

    const timerId = 1;
    timerService.tick(timerId);

    expect(viewModel.remainingSeconds).toBe(initialSeconds - 1);
  });

  it('Should continue ticking while remainingSeconds > 0', () => {
    viewModel.start();
    const timerId = 1;

    const result = timerService.tick(timerId);

    expect(result).toBe(true);
    expect(timerService.isActive(timerId)).toBe(true);
  });

  it('Should stop ticking when reaching 0', () => {
    // Set to 1 second remaining
    // biome-ignore lint/suspicious/noExplicitAny: test helper
    (viewModel as any)._model = {
      ...(viewModel as any)._model,
      remainingSeconds: 1
    };
    // biome-ignore lint/suspicious/noExplicitAny: test helper
    (viewModel as any)._syncFromModel();

    viewModel.start();
    const timerId = 1;

    const result = timerService.tick(timerId);

    expect(result).toBe(false);
    expect(timerService.isActive(timerId)).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe('Integration Tests', () => {
  describe('Full Cycles', () => {
    it('Full work cycle: start → tick to 0 → auto transition to REST', () => {
      // Set to 3 seconds for quick test
      // biome-ignore lint/suspicious/noExplicitAny: test helper
      (viewModel as any)._model = {
        ...(viewModel as any)._model,
        remainingSeconds: 3,
      };
      // biome-ignore lint/suspicious/noExplicitAny: test helper
      (viewModel as any)._syncFromModel();

      viewModel.start();
      expect(viewModel.state).toBe('RUNNING');
      expect(viewModel.currentMode).toBe('WORK');

      // Tick down to 0
      timerService.tick(1); // 2 seconds
      expect(viewModel.remainingSeconds).toBe(2);

      timerService.tick(1); // 1 second
      expect(viewModel.remainingSeconds).toBe(1);

      timerService.tick(1); // 0 seconds - should transition

      // Should auto-transition to REST and STOPPED
      expect(viewModel.currentMode).toBe('REST');
      expect(viewModel.state).toBe('STOPPED');
      expect(viewModel.remainingSeconds).toBe(5 * 60); // Default rest duration
    });
  });

  describe('Operation Combinations', () => {
    it('Start/Stop/Start sequence', () => {
      viewModel.start();
      expect(viewModel.state).toBe('RUNNING');

      timerService.tick(1);
      const remainingAfterTick = viewModel.remainingSeconds;

      viewModel.stop();
      expect(viewModel.state).toBe('STOPPED');
      expect(viewModel.remainingSeconds).toBe(remainingAfterTick);

      // Start again - should continue from where it stopped
      viewModel.start();
      expect(viewModel.state).toBe('RUNNING');
      timerService.tick(2); // New timer ID
      expect(viewModel.remainingSeconds).toBe(remainingAfterTick - 1);
    });
  });
});
```

## Service Test Helpers

### Fake Services

Create fake implementations in `test/services/` for use in ViewModel tests.

**Example: FakeTimerService**
```typescript
import type { ITimerService } from '../../src/services/ITimerService';

export class FakeTimerService implements ITimerService {
  private timers = new Map<number, () => boolean>();
  private nextId = 1;

  startTimer(callback: () => boolean, _intervalMs: number): number {
    const id = this.nextId++;
    this.timers.set(id, callback);
    return id;
  }

  stopTimer(timerId: number): void {
    this.timers.delete(timerId);
  }

  // Test helper: manually trigger tick
  tick(timerId: number): boolean {
    const callback = this.timers.get(timerId);
    if (!callback) return false;

    const shouldContinue = callback();
    if (!shouldContinue) {
      this.timers.delete(timerId);
    }
    return shouldContinue;
  }

  // Test helper: check if timer is active
  isActive(timerId: number): boolean {
    return this.timers.has(timerId);
  }

  // Test helper: get count of active timers
  getActiveCount(): number {
    return this.timers.size;
  }
}
```

**Example: MockSettingsStorage**
```typescript
import type { ISettingsStorage } from '../../src/services/ISettingsStorage';
import { createDefaultSettings, type TimerSettings } from '../../src/models/TimerSettings';

export class MockSettingsStorage implements ISettingsStorage {
  private settings: TimerSettings;

  constructor() {
    this.settings = createDefaultSettings();
  }

  load(): TimerSettings {
    return { ...this.settings };
  }

  save(settings: TimerSettings): void {
    this.settings = settings;
  }

  // Test helper
  getDefaultSettings(): TimerSettings {
    return createDefaultSettings();
  }
}
```

### Testing Fake Services

Even fake services should have basic tests to ensure correctness:

```typescript
describe('FakeTimerService', () => {
  let service: FakeTimerService;

  beforeEach(() => {
    service = new FakeTimerService();
  });

  it('Should start a timer and return ID', () => {
    const callback = jasmine.createSpy('callback').and.returnValue(true);
    const id = service.startTimer(callback, 1000);

    expect(id).toBeGreaterThan(0);
  });

  it('Should execute callback on tick', () => {
    const callback = jasmine.createSpy('callback').and.returnValue(true);
    const id = service.startTimer(callback, 1000);

    service.tick(id);

    expect(callback).toHaveBeenCalled();
  });

  it('Should remove timer when callback returns false', () => {
    const callback = jasmine.createSpy('callback').and.returnValue(false);
    const id = service.startTimer(callback, 1000);

    service.tick(id);

    expect(service.isActive(id)).toBe(false);
  });
});
```

## Test Organization

### Directory Structure

```
test/
├── index.ts              # Test entry point
├── models/               # Model tests
│   ├── Counter.spec.ts
│   └── TimerModel.spec.ts
├── domain/               # Domain tests (if applicable)
│   └── TimerCycle.spec.ts
├── views/                # ViewModel tests (matches src/ structure)
│   └── CounterViewModel.spec.ts
└── services/             # Service test helpers
    ├── FakeTimerService.ts
    ├── FakeTimerService.spec.ts
    ├── MockSettingsStorage.ts
    └── MockSettingsStorage.spec.ts
```

### Naming Conventions

- Test files: `*.spec.ts`
- Test helpers: No `.spec` suffix
- Describe blocks: Use the entity name (e.g., `describe('TimerModel', ...)`)
- Test names: Should be descriptive sentences starting with "Should"

## Best Practices

### DO

- ✅ Test one thing per test
- ✅ Use descriptive test names
- ✅ Test edge cases and boundary conditions
- ✅ Use `beforeEach` for common setup
- ✅ Keep tests independent (no shared mutable state)
- ✅ Use fake/mock services in ViewModel tests
- ✅ Test that signals are emitted
- ✅ Verify immutability in Model tests

### DON'T

- ❌ Test implementation details
- ❌ Test third-party libraries (Zod, GTK)
- ❌ Write tests for simple getters/setters
- ❌ Test UI rendering (use manual testing)
- ❌ Test Services directly (mock them)
- ❌ Share state between tests
- ❌ Access private fields except for test setup

### Common Patterns

**Accessing private fields for test setup (use sparingly):**
```typescript
// biome-ignore lint/suspicious/noExplicitAny: test helper to access private member
(viewModel as any)._model = { ...(viewModel as any)._model, count: 5 };
// biome-ignore lint/suspicious/noExplicitAny: test helper to access private member
(viewModel as any)._syncFromModel();
```

**Testing with spies:**
```typescript
const spy = jasmine.createSpy('callback').and.returnValue(true);
viewModel.connect('notify::count', spy);
viewModel.increment();
expect(spy).toHaveBeenCalled();
```

**Testing method calls on services:**
```typescript
const startTimerSpy = spyOn(timerService, 'startTimer').and.callThrough();
viewModel.start();
expect(startTimerSpy).toHaveBeenCalledWith(jasmine.any(Function), 1000);
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Type check without running tests
npm run typecheck
```

## Summary

| Layer | Testing Approach | Tools |
|-------|-----------------|-------|
| **Model** | Unit tests for pure functions | jasmine-gjs |
| **Domain** | Unit tests for business logic | jasmine-gjs |
| **ViewModel** | Integration tests with fakes | jasmine-gjs + Fake services |
| **View** | Manual testing + UI validation | gtk4-builder-tool |
| **Service** | No tests (mocked) | N/A |

This strategy ensures comprehensive coverage where it matters most (business logic) while avoiding brittle tests for UI and external dependencies.
