# Testing Strategy

## Overview

This document outlines the testing strategy for the Pomodoro Timer application. We follow TDD (Test-Driven Development) principles for Models and ViewModels, using Jasmine for unit testing.

## Test Framework

- **Framework**: jasmine-gjs
- **Test Runner**: `npm test`
- **Build**: Tests run against compiled JavaScript in `dist/` directory
- **Coverage**: Models and ViewModels (Views are tested manually)

## Test Approach

### General Principles

1. **Test-First Development (TDD)**
   - Write tests before implementation
   - Red → Green → Refactor cycle
   - Each test should initially fail, then pass after implementation

2. **Isolation**
   - Unit tests should be isolated and fast
   - Use dependency injection for external dependencies (GLib, GSettings)
   - Mock/Fake implementations for services

3. **Clarity**
   - Test names should describe behavior clearly
   - Use `describe` for grouping related tests
   - Use `it` for individual test cases

## Test Coverage by Component

### Phase 1: Models

#### 1.1 TimerMode (Enum)
**File**: `test/models/TimerMode.spec.ts`

**Test Cases:**
- ✓ Should define WORK mode constant
- ✓ Should define REST mode constant
- ✓ Should have exactly 2 modes

**Coverage**: 100% (simple enum validation)

---

#### 1.2 TimerState (Enum)
**File**: `test/models/TimerState.spec.ts`

**Test Cases:**
- ✓ Should define RUNNING state constant
- ✓ Should define STOPPED state constant
- ✓ Should have exactly 2 states

**Coverage**: 100% (simple enum validation)

---

#### 1.3 TimerSettings (Zod Schema)
**File**: `test/models/TimerSettings.spec.ts`

**Test Cases:**

**Valid Input:**
- ✓ Should validate valid settings (workDuration: 25, restDuration: 5)
- ✓ Should accept positive integers for durations
- ✓ Should accept large values (workDuration: 120, restDuration: 60)

**Invalid Input:**
- ✓ Should reject negative workDuration
- ✓ Should reject negative restDuration
- ✓ Should reject zero workDuration
- ✓ Should reject zero restDuration
- ✓ Should reject non-integer workDuration (25.5)
- ✓ Should reject non-integer restDuration (5.5)
- ✓ Should reject missing workDuration field
- ✓ Should reject missing restDuration field
- ✓ Should reject non-number types (string, null, undefined)

**Coverage**: Schema validation, boundary conditions, error messages

---

#### 1.4 TimerModel (Zod Schema)
**File**: `test/models/TimerModel.spec.ts`

**Test Cases:**

**Valid Input:**
- ✓ Should validate valid model state
- ✓ Should accept remainingSeconds = 0 (nonnegative)
- ✓ Should accept WORK and REST modes
- ✓ Should accept RUNNING and STOPPED states

**Invalid Input:**
- ✓ Should reject negative remainingSeconds
- ✓ Should reject invalid currentMode value
- ✓ Should reject invalid state value
- ✓ Should reject non-integer remainingSeconds
- ✓ Should reject zero or negative totalSeconds
- ✓ Should reject missing required fields

**Coverage**: Schema validation, enum constraints, type checking

---

### Phase 2: ViewModels

#### 2.1 TimerViewModel
**File**: `test/viewModels/TimerViewModel.spec.ts`

**Dependencies to Mock/Fake:**
- `TimerService` (Fake implementation with manual tick control)
- `SettingsStorage` (Mock with in-memory storage)

**Test Structure:**
```typescript
describe('TimerViewModel', () => {
  let viewModel: TimerViewModel;
  let fakeTimerService: FakeTimerService;
  let mockStorage: MockSettingsStorage;

  beforeEach(() => {
    fakeTimerService = new FakeTimerService();
    mockStorage = new MockSettingsStorage();
    viewModel = new TimerViewModel(fakeTimerService, mockStorage);
  });

  // Test cases...
});
```

**Test Categories:**

**A. Initialization**
- ✓ Should initialize with default settings (25min work, 5min rest)
- ✓ Should start in WORK mode
- ✓ Should start in STOPPED state
- ✓ Should set remainingSeconds to workDuration * 60
- ✓ Should set totalSeconds to workDuration * 60
- ✓ Should load settings from storage on creation

**B. Computed Properties**
- ✓ `displayTime` should format "25:00" for 1500 seconds
- ✓ `displayTime` should format "00:00" for 0 seconds
- ✓ `displayTime` should format "01:30" for 90 seconds
- ✓ `displayTime` should pad single digits with zeros
- ✓ `modeLabel` should return "Work" for WORK mode
- ✓ `modeLabel` should return "Rest" for REST mode
- ✓ `modeIcon` should return correct icon name for WORK
- ✓ `modeIcon` should return correct icon name for REST
- ✓ `startStopLabel` should return "Start" when STOPPED
- ✓ `startStopLabel` should return "Stop" when RUNNING

**C. start() Method**
- ✓ Should change state from STOPPED to RUNNING
- ✓ Should start timer via TimerService
- ✓ Should do nothing if already RUNNING
- ✓ Should emit state property notification

**D. stop() Method**
- ✓ Should change state from RUNNING to STOPPED
- ✓ Should stop timer via TimerService
- ✓ Should do nothing if already STOPPED
- ✓ Should emit state property notification

**E. _tick() Method (via FakeTimerService)**
- ✓ Should decrement remainingSeconds by 1
- ✓ Should emit remainingSeconds property notification
- ✓ Should update displayTime
- ✓ Should return true to continue timer (when > 0)
- ✓ Should return false when reaching 0
- ✓ Should call _transitionToNextMode() when reaching 0
- ✓ Should handle rapid successive ticks correctly

**F. skip() Method**
- ✓ Should transition to next mode (WORK → REST)
- ✓ Should transition to next mode (REST → WORK)
- ✓ Should set state to STOPPED
- ✓ Should reset remainingSeconds to new mode's totalSeconds
- ✓ Should stop running timer if active
- ✓ Should emit all relevant property notifications

**G. reset() Method**
- ✓ Should reset remainingSeconds to totalSeconds
- ✓ Should set state to STOPPED
- ✓ Should keep current mode unchanged
- ✓ Should stop running timer if active
- ✓ Should emit property notifications

**H. updateSettings() Method**
- ✓ Should update internal settings
- ✓ Should apply to next timer cycle (not current)
- ✓ Should persist to storage
- ✓ Should reset timer if in STOPPED state
- ✓ Should not affect running timer until next cycle

**I. Mode Transitions (Auto)**
- ✓ WORK timer reaches 0 → should transition to REST in STOPPED state
- ✓ REST timer reaches 0 → should transition to WORK in STOPPED state
- ✓ Should set remainingSeconds to new mode's duration
- ✓ Should emit currentMode property notification

**J. GObject Property Notifications**
- ✓ Should emit 'notify::remaining-seconds' on change
- ✓ Should emit 'notify::state' on change
- ✓ Should emit 'notify::current-mode' on change
- ✓ Should emit 'notify::display-time' on remainingSeconds change
- ✓ Should emit 'notify::start-stop-label' on state change

**K. Edge Cases**
- ✓ Should handle settings with workDuration = 1 minute
- ✓ Should handle settings with restDuration = 1 minute
- ✓ Should handle multiple start/stop cycles correctly
- ✓ Should handle skip during running timer
- ✓ Should handle reset during running timer

**Coverage**: Business logic, state transitions, property bindings, timer lifecycle

---

#### 2.2 SettingsViewModel
**File**: `test/viewModels/SettingsViewModel.spec.ts`

**Test Categories:**

**A. Initialization**
- ✓ Should initialize with empty/default values
- ✓ Should set hasChanges to false initially

**B. load() Method**
- ✓ Should load settings into working copy
- ✓ Should set workDuration property
- ✓ Should set restDuration property
- ✓ Should set hasChanges to false after load
- ✓ Should emit property notifications

**C. Property Changes**
- ✓ Changing workDuration should set hasChanges to true
- ✓ Changing restDuration should set hasChanges to true
- ✓ Setting same value should not set hasChanges to true
- ✓ Should emit 'notify::has-changes' on change

**D. save() Method**
- ✓ Should return TimerSettings with current values
- ✓ Should validate settings before returning
- ✓ Should throw on invalid workDuration
- ✓ Should throw on invalid restDuration
- ✓ Should set hasChanges to false after save
- ✓ Should return frozen/immutable object

**E. cancel() Method**
- ✓ Should revert to loaded settings
- ✓ Should restore workDuration to original
- ✓ Should restore restDuration to original
- ✓ Should set hasChanges to false
- ✓ Should emit property notifications

**F. Validation Methods**
- ✓ `validateWorkDuration(25)` should return true
- ✓ `validateWorkDuration(0)` should return false
- ✓ `validateWorkDuration(-5)` should return false
- ✓ `validateWorkDuration(25.5)` should return false
- ✓ `validateRestDuration(5)` should return true
- ✓ `validateRestDuration(0)` should return false
- ✓ `validateRestDuration(-5)` should return false
- ✓ `validateRestDuration(5.5)` should return false

**G. Edge Cases**
- ✓ Should handle load() called multiple times
- ✓ Should handle cancel() without prior load()
- ✓ Should handle save() without prior load()
- ✓ Should handle boundary values (min: 1, max: 120 for work)

**Coverage**: Form state management, validation, dirty tracking

---

### Phase 3: Services (Mock/Fake Implementations)

#### 3.1 MockSettingsStorage
**File**: `test/services/MockSettingsStorage.spec.ts`

**Test Cases:**
- ✓ Should return default settings on first load()
- ✓ Should persist settings across save/load cycles
- ✓ Should store settings in memory (not actual GSettings)
- ✓ `getDefaultSettings()` should always return {workDuration: 25, restDuration: 5}
- ✓ Should validate settings before saving (throw on invalid)
- ✓ Should be isolated per test (no shared state)

---

#### 3.2 FakeTimerService
**File**: `test/services/FakeTimerService.spec.ts`

**Test Cases:**
- ✓ `startTimer()` should return numeric timer ID
- ✓ `startTimer()` should NOT auto-execute callback (manual control)
- ✓ `tick()` method should manually invoke callback
- ✓ `tick()` should respect callback return value (true = continue, false = stop)
- ✓ `stopTimer(id)` should prevent future ticks
- ✓ Should support multiple concurrent timers with different IDs
- ✓ Should handle stopTimer() for non-existent ID gracefully

**Implementation Pattern:**
```typescript
class FakeTimerService implements ITimerService {
  private timers = new Map<number, Function>();
  private nextId = 1;

  startTimer(callback: Function, intervalMs: number): number {
    const id = this.nextId++;
    this.timers.set(id, callback);
    return id;
  }

  stopTimer(id: number): void {
    this.timers.delete(id);
  }

  // Test helper: manually trigger tick
  tick(id: number): boolean {
    const callback = this.timers.get(id);
    if (!callback) return false;

    const shouldContinue = callback();
    if (!shouldContinue) {
      this.timers.delete(id);
    }
    return shouldContinue;
  }

  // Test helper: check if timer is active
  isActive(id: number): boolean {
    return this.timers.has(id);
  }
}
```

---

## Test Utilities

### Test Helpers
**File**: `test/helpers/testHelpers.ts`

**Utilities:**
- `createDefaultSettings()`: Returns default TimerSettings
- `createTestTimerModel()`: Returns test TimerModel instance
- `waitForPropertyNotification()`: Helper for GObject property change events
- `expectPropertyNotification()`: Assert property notification was emitted

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --filter="TimerViewModel"

# Watch mode (if supported)
npm test -- --watch
```

---

## Test Checklist

Before marking a component as complete:

- [ ] All test cases pass
- [ ] Test coverage meets requirements (Models/ViewModels: ~95%+)
- [ ] No TODO/FIXME comments in test code
- [ ] Test names clearly describe behavior
- [ ] Edge cases are covered
- [ ] Property notifications are tested (for GObject ViewModels)
- [ ] Mock/Fake services behave correctly
- [ ] Tests run in isolation (no shared state)

---

## Manual Testing (Views)

Views are tested manually through UI interaction:

### MainWindow.ui Manual Test Checklist
- [ ] Window opens with correct initial state
- [ ] Time label displays "25:00" initially
- [ ] Mode label displays "Work" initially
- [ ] Start button label displays "Start" initially
- [ ] Clicking Start begins countdown
- [ ] Time label updates every second
- [ ] Stop button label changes to "Stop" when running
- [ ] Clicking Stop pauses timer
- [ ] Skip button transitions to REST mode
- [ ] Reset button resets to mode's initial time
- [ ] Settings button opens SettingsDialog
- [ ] Mode icon changes between WORK/REST

### SettingsDialog.ui Manual Test Checklist
- [ ] Dialog opens with current settings
- [ ] Work duration SpinButton shows correct value
- [ ] Rest duration SpinButton shows correct value
- [ ] Changing values enables Save button
- [ ] Save button applies changes
- [ ] Cancel button discards changes
- [ ] Invalid inputs are prevented by SpinButton constraints
- [ ] Dialog closes after Save/Cancel

---

## CI/CD Integration

GitHub Actions workflow has been configured at `.github/workflows/test.yml`.

### Automated Checks

The CI pipeline runs on every push and pull request:

1. **Linting**: `npm run lint` (Biome)
2. **Type Checking**: `npm run typecheck` (TypeScript)
3. **Build**: `npm run build` (Compile TypeScript to JavaScript)
4. **Tests**: `npm test` (Jasmine unit tests)

### System Dependencies

The CI environment installs required GTK4 and GJS dependencies:
- `gjs` - JavaScript runtime for GNOME
- `libgjs-dev` - GJS development libraries
- `gir1.2-gtk-4.0` - GTK 4.0 introspection bindings
- `libgtk-4-dev` - GTK 4 development files
- `libgirepository1.0-dev` - GObject introspection development files

### Artifacts

Test results and coverage reports are uploaded as artifacts for review (retention: 30 days).

### Local Pre-commit Hooks

Pre-commit hooks run the same checks locally before commits:
- Linting (auto-fix enabled)
- Type checking

This ensures code quality before pushing to the repository.
