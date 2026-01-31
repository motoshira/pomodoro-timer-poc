# Implementation Plan - Pomodoro Timer

## Overview

This document provides a step-by-step implementation checklist for building the Pomodoro Timer application. Follow TDD principles: write tests first, then implement to make them pass.

**Strategy**: Phased MVP implementation with test-driven development

**Phases**:
1. **Phase 1**: Models & Core Types
2. **Phase 2**: Services (Mock/Fake implementations)
3. **Phase 3**: ViewModels
4. **Phase 4**: Views (UI templates)
5. **Phase 5**: Application Integration

---

## Prerequisites

- [x] TypeScript configured (`tsconfig.json`)
- [x] Jasmine-gjs testing framework set up
- [x] Build command available (`npm run build`)
- [x] Test command available (`npm test`)
- [x] Architecture documented (`docs/architecture.md`)
- [x] Testing strategy documented (`docs/testing-strategy.md`)

---

## Phase 1: Models & Core Types

### 1.1 Create TimerMode Enum

**Files to create:**
- `src/models/TimerMode.ts`
- `test/models/TimerMode.spec.ts`

**Steps:**
- [x] **1.1.1** Create test file `test/models/TimerMode.spec.ts`
  - Write tests for enum values (WORK, REST)
  - Write test for enum exhaustiveness
  - Run `npm test` → should FAIL

- [x] **1.1.2** Implement `src/models/TimerMode.ts`
  ```typescript
  export enum TimerMode {
    WORK = 'WORK',
    REST = 'REST'
  }
  ```
  - Run `npm test` → should PASS

- [x] **1.1.3** Commit changes
  ```bash
  git add src/models/TimerMode.ts test/models/TimerMode.spec.ts
  git commit -m "Add TimerMode enum with tests"
  ```

**Expected test output:**
```
TimerMode
  ✓ Should define WORK mode constant
  ✓ Should define REST mode constant
  ✓ Should have exactly 2 modes
```

---

### 1.2 Create TimerState Enum

**Files to create:**
- `src/models/TimerState.ts`
- `test/models/TimerState.spec.ts`

**Steps:**
- [x] **1.2.1** Create test file `test/models/TimerState.spec.ts`
  - Write tests for enum values (RUNNING, STOPPED)
  - Write test for enum exhaustiveness
  - Run `npm test` → should FAIL

- [x] **1.2.2** Implement `src/models/TimerState.ts`
  ```typescript
  export enum TimerState {
    RUNNING = 'RUNNING',
    STOPPED = 'STOPPED'
  }
  ```
  - Run `npm test` → should PASS

- [x] **1.2.3** Commit changes
  ```bash
  git add src/models/TimerState.ts test/models/TimerState.spec.ts
  git commit -m "Add TimerState enum with tests"
  ```

**Expected test output:**
```
TimerState
  ✓ Should define RUNNING state constant
  ✓ Should define STOPPED state constant
  ✓ Should have exactly 2 states
```

---

### 1.3 Create TimerSettings Model (Zod Schema)

**Files to create:**
- `src/models/TimerSettings.ts`
- `test/models/TimerSettings.spec.ts`

**Steps:**
- [x] **1.3.1** Create test file `test/models/TimerSettings.spec.ts`
  - Write tests for valid settings
  - Write tests for invalid inputs (negative, zero, non-integer, missing fields)
  - Write tests for boundary values
  - Run `npm test` → should FAIL

- [x] **1.3.2** Implement `src/models/TimerSettings.ts`
  ```typescript
  import { z } from 'zod';

  export const TimerSettingsSchema = z.object({
    workDuration: z.number().positive().int(),
    restDuration: z.number().positive().int()
  });

  export type TimerSettings = z.infer<typeof TimerSettingsSchema>;

  // Helper for creating default settings
  export const createDefaultSettings = (): TimerSettings => ({
    workDuration: 25,
    restDuration: 5
  });
  ```
  - Run `npm test` → should PASS

- [x] **1.3.3** Commit changes
  ```bash
  git add src/models/TimerSettings.ts test/models/TimerSettings.spec.ts
  git commit -m "Add TimerSettings Zod schema with validation tests"
  ```

**Expected test output:**
```
TimerSettings
  Valid Input
    ✓ Should validate valid settings (workDuration: 25, restDuration: 5)
    ✓ Should accept positive integers for durations
    ✓ Should accept large values (workDuration: 120, restDuration: 60)
  Invalid Input
    ✓ Should reject negative workDuration
    ✓ Should reject zero workDuration
    ✓ Should reject non-integer workDuration
    ... (10+ tests)
```

---

### 1.4 Create TimerModel (Zod Schema)

**Files to create:**
- `src/models/TimerModel.ts`
- `test/models/TimerModel.spec.ts`

**Steps:**
- [x] **1.4.1** Create test file `test/models/TimerModel.spec.ts`
  - Write tests for valid model state
  - Write tests for invalid inputs
  - Write tests for enum constraints
  - Run `npm test` → should FAIL

- [x] **1.4.2** Implement `src/models/TimerModel.ts`
  ```typescript
  import { z } from 'zod';
  import { TimerMode } from './TimerMode';
  import { TimerState } from './TimerState';

  export const TimerModelSchema = z.object({
    remainingSeconds: z.number().nonnegative().int(),
    currentMode: z.nativeEnum(TimerMode),
    state: z.nativeEnum(TimerState),
    totalSeconds: z.number().positive().int()
  });

  export type TimerModel = z.infer<typeof TimerModelSchema>;

  // Helper for creating initial model
  export const createInitialModel = (workDurationMinutes: number): TimerModel => ({
    remainingSeconds: workDurationMinutes * 60,
    currentMode: TimerMode.WORK,
    state: TimerState.STOPPED,
    totalSeconds: workDurationMinutes * 60
  });
  ```
  - Run `npm test` → should PASS

- [x] **1.4.3** Commit changes
  ```bash
  git add src/models/TimerModel.ts test/models/TimerModel.spec.ts
  git commit -m "Add TimerModel Zod schema with validation tests"
  ```

**Expected test output:**
```
TimerModel
  Valid Input
    ✓ Should validate valid model state
    ✓ Should accept remainingSeconds = 0 (nonnegative)
    ✓ Should accept WORK and REST modes
    ✓ Should accept RUNNING and STOPPED states
  Invalid Input
    ✓ Should reject negative remainingSeconds
    ✓ Should reject invalid currentMode value
    ... (8+ tests)
```

---

## Phase 2: Services (Mock/Fake Implementations)

### 2.1 Create Service Interfaces

**Files to create:**
- `src/services/ITimerService.ts`
- `src/services/ISettingsStorage.ts`

**Steps:**
- [ ] **2.1.1** Create `src/services/ITimerService.ts` (interface only)
  ```typescript
  export interface ITimerService {
    startTimer(callback: () => boolean, intervalMs: number): number;
    stopTimer(timerId: number): void;
  }
  ```

- [ ] **2.1.2** Create `src/services/ISettingsStorage.ts` (interface only)
  ```typescript
  import type { TimerSettings } from '../models/TimerSettings';

  export interface ISettingsStorage {
    load(): TimerSettings;
    save(settings: TimerSettings): void;
    getDefaultSettings(): TimerSettings;
  }
  ```

- [ ] **2.1.3** Commit changes
  ```bash
  git add src/services/ITimerService.ts src/services/ISettingsStorage.ts
  git commit -m "Add service interfaces for dependency injection"
  ```

---

### 2.2 Create MockSettingsStorage

**Files to create:**
- `test/services/MockSettingsStorage.ts`
- `test/services/MockSettingsStorage.spec.ts`

**Steps:**
- [ ] **2.2.1** Create test file `test/services/MockSettingsStorage.spec.ts`
  - Write tests for load/save/getDefaultSettings behavior
  - Write tests for in-memory persistence
  - Write tests for validation
  - Run `npm test` → should FAIL

- [ ] **2.2.2** Implement `test/services/MockSettingsStorage.ts`
  ```typescript
  import type { ISettingsStorage } from '../../src/services/ISettingsStorage';
  import { TimerSettings, TimerSettingsSchema, createDefaultSettings } from '../../src/models/TimerSettings';

  export class MockSettingsStorage implements ISettingsStorage {
    private _settings: TimerSettings | null = null;

    load(): TimerSettings {
      return this._settings ?? this.getDefaultSettings();
    }

    save(settings: TimerSettings): void {
      // Validate before saving
      TimerSettingsSchema.parse(settings);
      this._settings = { ...settings };
    }

    getDefaultSettings(): TimerSettings {
      return createDefaultSettings();
    }

    // Test helper: reset storage
    reset(): void {
      this._settings = null;
    }
  }
  ```
  - Run `npm test` → should PASS

- [ ] **2.2.3** Commit changes
  ```bash
  git add test/services/MockSettingsStorage.ts test/services/MockSettingsStorage.spec.ts
  git commit -m "Add MockSettingsStorage with tests"
  ```

**Expected test output:**
```
MockSettingsStorage
  ✓ Should return default settings on first load()
  ✓ Should persist settings across save/load cycles
  ✓ Should validate settings before saving
  ✓ getDefaultSettings() should return {workDuration: 25, restDuration: 5}
  ... (5+ tests)
```

---

### 2.3 Create FakeTimerService

**Files to create:**
- `test/services/FakeTimerService.ts`
- `test/services/FakeTimerService.spec.ts`

**Steps:**
- [ ] **2.3.1** Create test file `test/services/FakeTimerService.spec.ts`
  - Write tests for startTimer/stopTimer behavior
  - Write tests for manual tick control
  - Write tests for multiple concurrent timers
  - Run `npm test` → should FAIL

- [ ] **2.3.2** Implement `test/services/FakeTimerService.ts`
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

    // Test helper: manually trigger tick for a timer
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

    // Test helper: clear all timers
    reset(): void {
      this.timers.clear();
    }
  }
  ```
  - Run `npm test` → should PASS

- [ ] **2.3.3** Commit changes
  ```bash
  git add test/services/FakeTimerService.ts test/services/FakeTimerService.spec.ts
  git commit -m "Add FakeTimerService with manual tick control"
  ```

**Expected test output:**
```
FakeTimerService
  ✓ startTimer() should return numeric timer ID
  ✓ tick() method should manually invoke callback
  ✓ tick() should respect callback return value (true = continue)
  ✓ stopTimer(id) should prevent future ticks
  ✓ Should support multiple concurrent timers
  ... (7+ tests)
```

---

## Phase 3: ViewModels

### 3.1 Create TimerViewModel (Part 1: Basic Structure)

**Files to create:**
- `src/viewModels/TimerViewModel.ts`
- `test/viewModels/TimerViewModel.spec.ts`

**Note**: TimerViewModel is implemented incrementally due to complexity.

**Steps:**

- [ ] **3.1.1** Create test file structure `test/viewModels/TimerViewModel.spec.ts`
  - Set up test suite with beforeEach
  - Create instances of FakeTimerService and MockSettingsStorage
  - Write ONLY initialization tests first:
    - Should initialize with default settings
    - Should start in WORK mode, STOPPED state
    - Should set remainingSeconds correctly
    - Should load settings from storage
  - Run `npm test` → should FAIL

- [ ] **3.1.2** Implement basic `src/viewModels/TimerViewModel.ts` structure
  ```typescript
  // Note: This is a simplified skeleton. Full GObject implementation needed.
  import type { ITimerService } from '../services/ITimerService';
  import type { ISettingsStorage } from '../services/ISettingsStorage';
  import { TimerMode } from '../models/TimerMode';
  import { TimerState } from '../models/TimerState';
  import type { TimerSettings } from '../models/TimerSettings';

  export class TimerViewModel {
    private _remainingSeconds: number;
    private _currentMode: TimerMode;
    private _state: TimerState;
    private _totalSeconds: number;
    private _settings: TimerSettings;
    private _timerId: number | null = null;

    constructor(
      private timerService: ITimerService,
      private storage: ISettingsStorage
    ) {
      this._settings = storage.load();
      this._currentMode = TimerMode.WORK;
      this._state = TimerState.STOPPED;
      this._totalSeconds = this._settings.workDuration * 60;
      this._remainingSeconds = this._totalSeconds;
    }

    // Getters (to be converted to GObject properties)
    get remainingSeconds(): number {
      return this._remainingSeconds;
    }

    get currentMode(): TimerMode {
      return this._currentMode;
    }

    get state(): TimerState {
      return this._state;
    }

    // ... more getters and methods to be added
  }
  ```
  - Run `npm test` → initialization tests should PASS

- [ ] **3.1.3** Commit changes
  ```bash
  git add src/viewModels/TimerViewModel.ts test/viewModels/TimerViewModel.spec.ts
  git commit -m "Add TimerViewModel basic structure with initialization"
  ```

---

### 3.2 TimerViewModel: Computed Properties

**Steps:**

- [ ] **3.2.1** Add tests for computed properties
  - `displayTime` formatting tests (25:00, 01:30, 00:00)
  - `modeLabel` tests (WORK → "Work", REST → "Rest")
  - `modeIcon` tests (correct icon names)
  - `startStopLabel` tests (STOPPED → "Start", RUNNING → "Stop")
  - Run `npm test` → new tests should FAIL

- [ ] **3.2.2** Implement computed properties in `TimerViewModel.ts`
  ```typescript
  get displayTime(): string {
    const minutes = Math.floor(this._remainingSeconds / 60);
    const seconds = this._remainingSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  get modeLabel(): string {
    return this._currentMode === TimerMode.WORK ? 'Work' : 'Rest';
  }

  get modeIcon(): string {
    return this._currentMode === TimerMode.WORK
      ? 'preferences-system-time-symbolic'
      : 'preferences-desktop-screensaver-symbolic';
  }

  get startStopLabel(): string {
    return this._state === TimerState.STOPPED ? 'Start' : 'Stop';
  }

  get settings(): TimerSettings {
    return { ...this._settings };
  }
  ```
  - Run `npm test` → computed property tests should PASS

- [ ] **3.2.3** Commit changes
  ```bash
  git add src/viewModels/TimerViewModel.ts test/viewModels/TimerViewModel.spec.ts
  git commit -m "Add computed properties to TimerViewModel"
  ```

---

### 3.3 TimerViewModel: start() and stop() Methods

**Steps:**

- [ ] **3.3.1** Add tests for start() method
  - Should change state to RUNNING
  - Should start timer via TimerService
  - Should do nothing if already RUNNING
  - Should emit state property notification (placeholder for GObject)
  - Run `npm test` → should FAIL

- [ ] **3.3.2** Implement start() method
  ```typescript
  start(): void {
    if (this._state === TimerState.RUNNING) return;

    this._state = TimerState.RUNNING;
    this._timerId = this.timerService.startTimer(
      () => this._tick(),
      1000
    );
    // TODO: Emit property notification when GObject is implemented
  }
  ```

- [ ] **3.3.3** Add tests for stop() method
  - Should change state to STOPPED
  - Should stop timer via TimerService
  - Should do nothing if already STOPPED
  - Run `npm test` → should FAIL

- [ ] **3.3.4** Implement stop() method
  ```typescript
  stop(): void {
    if (this._state === TimerState.STOPPED) return;

    this._state = TimerState.STOPPED;
    if (this._timerId !== null) {
      this.timerService.stopTimer(this._timerId);
      this._timerId = null;
    }
    // TODO: Emit property notification when GObject is implemented
  }
  ```
  - Run `npm test` → start/stop tests should PASS

- [ ] **3.3.5** Commit changes
  ```bash
  git add src/viewModels/TimerViewModel.ts test/viewModels/TimerViewModel.spec.ts
  git commit -m "Add start() and stop() methods to TimerViewModel"
  ```

---

### 3.4 TimerViewModel: _tick() Method

**Steps:**

- [ ] **3.4.1** Add tests for _tick() behavior
  - Should decrement remainingSeconds by 1
  - Should return true when > 0
  - Should return false when reaching 0
  - Should call _transitionToNextMode() when reaching 0 (stub it first)
  - Run `npm test` → should FAIL

- [ ] **3.4.2** Implement _tick() method
  ```typescript
  private _tick(): boolean {
    if (this._remainingSeconds > 0) {
      this._remainingSeconds--;
      // TODO: Emit property notification when GObject is implemented
      return true;
    }

    // Timer reached zero
    this._transitionToNextMode();
    return false;
  }
  ```

- [ ] **3.4.3** Add stub for _transitionToNextMode() (to be implemented next)
  ```typescript
  private _transitionToNextMode(): void {
    // TODO: Implement in next step
  }
  ```
  - Run `npm test` → tick tests should PASS

- [ ] **3.4.4** Commit changes
  ```bash
  git add src/viewModels/TimerViewModel.ts test/viewModels/TimerViewModel.spec.ts
  git commit -m "Add _tick() countdown logic to TimerViewModel"
  ```

---

### 3.5 TimerViewModel: Mode Transitions

**Steps:**

- [ ] **3.5.1** Add tests for _transitionToNextMode()
  - WORK → REST transition
  - REST → WORK transition
  - Should set state to STOPPED
  - Should set remainingSeconds to new mode's duration
  - Run `npm test` → should FAIL

- [ ] **3.5.2** Implement _transitionToNextMode()
  ```typescript
  private _transitionToNextMode(): void {
    // Switch mode
    this._currentMode = this._currentMode === TimerMode.WORK
      ? TimerMode.REST
      : TimerMode.WORK;

    // Set to stopped state
    this._state = TimerState.STOPPED;

    // Reset timer for new mode
    this._resetToCurrentMode();

    // TODO: Emit property notifications when GObject is implemented
  }

  private _resetToCurrentMode(): void {
    const durationMinutes = this._currentMode === TimerMode.WORK
      ? this._settings.workDuration
      : this._settings.restDuration;

    this._totalSeconds = durationMinutes * 60;
    this._remainingSeconds = this._totalSeconds;
  }
  ```
  - Run `npm test` → mode transition tests should PASS

- [ ] **3.5.3** Commit changes
  ```bash
  git add src/viewModels/TimerViewModel.ts test/viewModels/TimerViewModel.spec.ts
  git commit -m "Add mode transition logic to TimerViewModel"
  ```

---

### 3.6 TimerViewModel: skip() and reset() Methods

**Steps:**

- [ ] **3.6.1** Add tests for skip() method
  - Should transition to next mode
  - Should set state to STOPPED
  - Should stop running timer if active
  - Run `npm test` → should FAIL

- [ ] **3.6.2** Implement skip() method
  ```typescript
  skip(): void {
    // Stop timer if running
    if (this._timerId !== null) {
      this.timerService.stopTimer(this._timerId);
      this._timerId = null;
    }

    this._transitionToNextMode();
  }
  ```

- [ ] **3.6.3** Add tests for reset() method
  - Should reset remainingSeconds to totalSeconds
  - Should set state to STOPPED
  - Should keep current mode unchanged
  - Should stop running timer if active
  - Run `npm test` → should FAIL

- [ ] **3.6.4** Implement reset() method
  ```typescript
  reset(): void {
    // Stop timer if running
    if (this._timerId !== null) {
      this.timerService.stopTimer(this._timerId);
      this._timerId = null;
    }

    this._state = TimerState.STOPPED;
    this._remainingSeconds = this._totalSeconds;

    // TODO: Emit property notifications when GObject is implemented
  }
  ```
  - Run `npm test` → skip/reset tests should PASS

- [ ] **3.6.5** Commit changes
  ```bash
  git add src/viewModels/TimerViewModel.ts test/viewModels/TimerViewModel.spec.ts
  git commit -m "Add skip() and reset() methods to TimerViewModel"
  ```

---

### 3.7 TimerViewModel: updateSettings() Method

**Steps:**

- [ ] **3.7.1** Add tests for updateSettings()
  - Should update internal settings
  - Should persist to storage
  - Should reset timer if in STOPPED state
  - Should not affect running timer until next cycle
  - Run `npm test` → should FAIL

- [ ] **3.7.2** Implement updateSettings() method
  ```typescript
  updateSettings(settings: TimerSettings): void {
    this._settings = { ...settings };

    // Persist to storage
    this.storage.save(this._settings);

    // If stopped, apply new duration to current mode
    if (this._state === TimerState.STOPPED) {
      this._resetToCurrentMode();
      // TODO: Emit property notifications when GObject is implemented
    }
  }
  ```
  - Run `npm test` → updateSettings tests should PASS

- [ ] **3.7.3** Commit changes
  ```bash
  git add src/viewModels/TimerViewModel.ts test/viewModels/TimerViewModel.spec.ts
  git commit -m "Add updateSettings() method to TimerViewModel"
  ```

---

### 3.8 TimerViewModel: Integration Tests

**Steps:**

- [ ] **3.8.1** Add integration tests for complete workflows
  - Full work cycle: start → tick to 0 → auto transition to REST
  - Full rest cycle: REST → tick to 0 → auto transition to WORK
  - Start/stop/skip/reset combinations
  - Settings update during running timer
  - Edge cases (1-minute durations, rapid operations)
  - Run `npm test` → should PASS

- [ ] **3.8.2** Fix any issues found during integration tests
  - Run `npm test` → all TimerViewModel tests should PASS

- [ ] **3.8.3** Commit changes
  ```bash
  git add test/viewModels/TimerViewModel.spec.ts
  git commit -m "Add integration tests for TimerViewModel"
  ```

**Expected final test output:**
```
TimerViewModel
  Initialization
    ✓ Should initialize with default settings
    ✓ Should start in WORK mode
    ... (5+ tests)
  Computed Properties
    ✓ displayTime should format "25:00" for 1500 seconds
    ... (8+ tests)
  start() and stop()
    ✓ Should change state to RUNNING
    ... (6+ tests)
  _tick() Method
    ✓ Should decrement remainingSeconds
    ... (5+ tests)
  Mode Transitions
    ✓ WORK → REST transition
    ... (4+ tests)
  skip() and reset()
    ✓ Should transition to next mode
    ... (6+ tests)
  updateSettings()
    ✓ Should update internal settings
    ... (4+ tests)
  Integration Tests
    ✓ Full work cycle with auto-transition
    ... (8+ tests)

TOTAL: 40+ tests for TimerViewModel
```

---

### 3.9 Create SettingsViewModel

**Files to create:**
- `src/viewModels/SettingsViewModel.ts`
- `test/viewModels/SettingsViewModel.spec.ts`

**Steps:**

- [ ] **3.9.1** Create test file `test/viewModels/SettingsViewModel.spec.ts`
  - Write tests for all categories (see testing-strategy.md)
  - Initialization, load(), property changes, save(), cancel(), validation
  - Run `npm test` → should FAIL

- [ ] **3.9.2** Implement `src/viewModels/SettingsViewModel.ts`
  ```typescript
  import { TimerSettings, TimerSettingsSchema } from '../models/TimerSettings';

  export class SettingsViewModel {
    private _workDuration: number = 0;
    private _restDuration: number = 0;
    private _originalSettings: TimerSettings | null = null;

    get workDuration(): number {
      return this._workDuration;
    }

    set workDuration(value: number) {
      if (this._workDuration !== value) {
        this._workDuration = value;
        // TODO: Emit property notifications when GObject is implemented
      }
    }

    get restDuration(): number {
      return this._restDuration;
    }

    set restDuration(value: number) {
      if (this._restDuration !== value) {
        this._restDuration = value;
        // TODO: Emit property notifications when GObject is implemented
      }
    }

    get hasChanges(): boolean {
      if (!this._originalSettings) return false;

      return (
        this._workDuration !== this._originalSettings.workDuration ||
        this._restDuration !== this._originalSettings.restDuration
      );
    }

    load(settings: TimerSettings): void {
      this._originalSettings = { ...settings };
      this._workDuration = settings.workDuration;
      this._restDuration = settings.restDuration;
      // TODO: Emit property notifications when GObject is implemented
    }

    save(): TimerSettings {
      const settings = {
        workDuration: this._workDuration,
        restDuration: this._restDuration
      };

      // Validate before returning
      TimerSettingsSchema.parse(settings);

      this._originalSettings = { ...settings };
      // TODO: Emit property notifications when GObject is implemented

      return settings;
    }

    cancel(): void {
      if (this._originalSettings) {
        this._workDuration = this._originalSettings.workDuration;
        this._restDuration = this._originalSettings.restDuration;
        // TODO: Emit property notifications when GObject is implemented
      }
    }

    validateWorkDuration(value: number): boolean {
      try {
        TimerSettingsSchema.shape.workDuration.parse(value);
        return true;
      } catch {
        return false;
      }
    }

    validateRestDuration(value: number): boolean {
      try {
        TimerSettingsSchema.shape.restDuration.parse(value);
        return true;
      } catch {
        return false;
      }
    }
  }
  ```
  - Run `npm test` → should PASS

- [ ] **3.9.3** Commit changes
  ```bash
  git add src/viewModels/SettingsViewModel.ts test/viewModels/SettingsViewModel.spec.ts
  git commit -m "Add SettingsViewModel with validation and dirty tracking"
  ```

**Expected test output:**
```
SettingsViewModel
  Initialization
    ✓ Should initialize with empty values
    ✓ Should set hasChanges to false initially
  load() Method
    ✓ Should load settings into working copy
    ... (4+ tests)
  Property Changes
    ✓ Changing workDuration should set hasChanges to true
    ... (3+ tests)
  save() Method
    ✓ Should return TimerSettings with current values
    ... (4+ tests)
  cancel() Method
    ✓ Should revert to loaded settings
    ... (4+ tests)
  Validation Methods
    ✓ validateWorkDuration(25) should return true
    ... (7+ tests)
  Edge Cases
    ✓ Should handle load() called multiple times
    ... (3+ tests)

TOTAL: 25+ tests for SettingsViewModel
```

---

## Phase 4: Views (GTK UI Templates)

**Note**: Views are not unit tested. Manual testing will be performed after integration.

### 4.1 Create MainWindow UI Template

**Files to create:**
- `src/view/MainWindow.ui`

**Steps:**

- [ ] **4.1.1** Create `src/view/MainWindow.ui` with GTK4 template structure
  - Define GtkApplicationWindow
  - Add vertical box layout
  - Add timer display section (modeIcon, timeLabel, modeLabel)
  - Add button controls (startStop, skip, reset, settings)
  - Assign widget IDs for binding

- [ ] **4.1.2** Document widget IDs and expected bindings in comments

- [ ] **4.1.3** Commit changes
  ```bash
  git add src/view/MainWindow.ui
  git commit -m "Add MainWindow UI template (GTK4)"
  ```

**UI Structure:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<interface>
  <template class="PomodoroMainWindow" parent="GtkApplicationWindow">
    <property name="title">Pomodoro Timer</property>
    <property name="default-width">400</property>
    <property name="default-height">300</property>
    <child>
      <object class="GtkBox">
        <property name="orientation">vertical</property>
        <property name="spacing">12</property>
        <property name="margin-top">24</property>
        <property name="margin-bottom">24</property>
        <property name="margin-start">24</property>
        <property name="margin-end">24</property>

        <!-- Timer Display Area -->
        <child>
          <object class="GtkBox" id="displayArea">
            <property name="orientation">vertical</property>
            <property name="spacing">8</property>
            <property name="halign">center</property>
            <property name="valign">center</property>
            <property name="vexpand">true</property>

            <!-- Mode Icon -->
            <child>
              <object class="GtkImage" id="modeIcon">
                <property name="icon-name">preferences-system-time-symbolic</property>
                <property name="pixel-size">64</property>
              </object>
            </child>

            <!-- Time Label -->
            <child>
              <object class="GtkLabel" id="timeLabel">
                <property name="label">25:00</property>
                <style>
                  <class name="title-1"/>
                </style>
              </object>
            </child>

            <!-- Mode Label -->
            <child>
              <object class="GtkLabel" id="modeLabel">
                <property name="label">Work</property>
                <style>
                  <class name="title-3"/>
                </style>
              </object>
            </child>
          </object>
        </child>

        <!-- Control Buttons -->
        <child>
          <object class="GtkBox" id="controlArea">
            <property name="orientation">horizontal</property>
            <property name="spacing">8</property>
            <property name="halign">center</property>
            <property name="homogeneous">true</property>

            <!-- Start/Stop Button -->
            <child>
              <object class="GtkButton" id="startStopButton">
                <property name="label">Start</property>
                <style>
                  <class name="suggested-action"/>
                </style>
              </object>
            </child>

            <!-- Skip Button -->
            <child>
              <object class="GtkButton" id="skipButton">
                <property name="label">Skip</property>
              </object>
            </child>

            <!-- Reset Button -->
            <child>
              <object class="GtkButton" id="resetButton">
                <property name="label">Reset</property>
              </object>
            </child>
          </object>
        </child>

        <!-- Settings Button -->
        <child>
          <object class="GtkButton" id="settingsButton">
            <property name="label">Settings</property>
            <property name="halign">end</property>
          </object>
        </child>
      </object>
    </child>
  </template>
</interface>
```

---

### 4.2 Create SettingsDialog UI Template

**Files to create:**
- `src/view/SettingsDialog.ui`

**Steps:**

- [ ] **4.2.1** Create `src/view/SettingsDialog.ui` with GTK4 dialog template
  - Define GtkDialog
  - Add SpinButtons for work/rest durations
  - Add Save/Cancel buttons
  - Assign widget IDs for binding

- [ ] **4.2.2** Commit changes
  ```bash
  git add src/view/SettingsDialog.ui
  git commit -m "Add SettingsDialog UI template (GTK4)"
  ```

**UI Structure:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<interface>
  <template class="PomodoroSettingsDialog" parent="GtkDialog">
    <property name="title">Settings</property>
    <property name="modal">true</property>
    <property name="default-width">300</property>
    <property name="default-height">200</property>

    <child type="content">
      <object class="GtkBox">
        <property name="orientation">vertical</property>
        <property name="spacing">12</property>
        <property name="margin-top">12</property>
        <property name="margin-bottom">12</property>
        <property name="margin-start">12</property>
        <property name="margin-end">12</property>

        <!-- Work Duration -->
        <child>
          <object class="GtkBox">
            <property name="orientation">horizontal</property>
            <property name="spacing">8</property>

            <child>
              <object class="GtkLabel">
                <property name="label">Work Duration (minutes):</property>
                <property name="hexpand">true</property>
                <property name="halign">start</property>
              </object>
            </child>

            <child>
              <object class="GtkSpinButton" id="workDurationInput">
                <property name="adjustment">
                  <object class="GtkAdjustment">
                    <property name="lower">1</property>
                    <property name="upper">120</property>
                    <property name="step-increment">1</property>
                    <property name="page-increment">5</property>
                    <property name="value">25</property>
                  </object>
                </property>
              </object>
            </child>
          </object>
        </child>

        <!-- Rest Duration -->
        <child>
          <object class="GtkBox">
            <property name="orientation">horizontal</property>
            <property name="spacing">8</property>

            <child>
              <object class="GtkLabel">
                <property name="label">Rest Duration (minutes):</property>
                <property name="hexpand">true</property>
                <property name="halign">start</property>
              </object>
            </child>

            <child>
              <object class="GtkSpinButton" id="restDurationInput">
                <property name="adjustment">
                  <object class="GtkAdjustment">
                    <property name="lower">1</property>
                    <property name="upper">60</property>
                    <property name="step-increment">1</property>
                    <property name="page-increment">5</property>
                    <property name="value">5</property>
                  </object>
                </property>
              </object>
            </child>
          </object>
        </child>
      </object>
    </child>

    <!-- Dialog Buttons -->
    <child type="action">
      <object class="GtkButton" id="cancelButton">
        <property name="label">Cancel</property>
      </object>
    </child>
    <child type="action">
      <object class="GtkButton" id="saveButton">
        <property name="label">Save</property>
        <style>
          <class name="suggested-action"/>
        </style>
      </object>
    </child>
  </template>
</interface>
```

---

## Phase 5: Application Integration

### 5.1 Create GLib Timer Service (Real Implementation)

**Files to create:**
- `src/services/GLibTimerService.ts`

**Steps:**

- [ ] **5.1.1** Implement `src/services/GLibTimerService.ts`
  ```typescript
  import GLib from 'gi://GLib';
  import type { ITimerService } from './ITimerService';

  export class GLibTimerService implements ITimerService {
    startTimer(callback: () => boolean, intervalMs: number): number {
      // GLib.timeout_add_seconds expects interval in seconds
      const intervalSeconds = Math.max(1, Math.round(intervalMs / 1000));

      return GLib.timeout_add_seconds(
        GLib.PRIORITY_DEFAULT,
        intervalSeconds,
        callback
      );
    }

    stopTimer(timerId: number): void {
      GLib.Source.remove(timerId);
    }
  }
  ```

- [ ] **5.1.2** Commit changes
  ```bash
  git add src/services/GLibTimerService.ts
  git commit -m "Add GLib-based TimerService for production use"
  ```

---

### 5.2 Convert ViewModels to GObject Classes

**Note**: This is a significant refactoring step. ViewModels must be GObject classes for GTK property binding.

**Files to modify:**
- `src/viewModels/TimerViewModel.ts`
- `src/viewModels/SettingsViewModel.ts`

**Steps:**

- [ ] **5.2.1** Convert `TimerViewModel` to GObject class
  - Import GObject from 'gi://GObject'
  - Use `GObject.registerClass()` with property specifications
  - Convert properties to GObject.ParamSpec definitions
  - Use `this.notify('property-name')` for property change notifications
  - Run `npm test` → ensure all tests still PASS

- [ ] **5.2.2** Convert `SettingsViewModel` to GObject class
  - Same process as TimerViewModel
  - Run `npm test` → ensure all tests still PASS

- [ ] **5.2.3** Update test files to work with GObject properties
  - May need to use `.bind_property()` or listen to 'notify' signals in tests

- [ ] **5.2.4** Commit changes
  ```bash
  git add src/viewModels/TimerViewModel.ts src/viewModels/SettingsViewModel.ts test/viewModels/*.spec.ts
  git commit -m "Convert ViewModels to GObject classes for GTK binding"
  ```

**Example GObject Property Definition:**
```typescript
import GObject from 'gi://GObject';

export const TimerViewModel = GObject.registerClass({
  GTypeName: 'PomodoroTimerViewModel',
  Properties: {
    'remaining-seconds': GObject.ParamSpec.int(
      'remaining-seconds',
      'Remaining Seconds',
      'Current remaining time in seconds',
      GObject.ParamFlags.READABLE,
      0, Number.MAX_SAFE_INTEGER, 0
    ),
    'state': GObject.ParamSpec.string(
      'state',
      'State',
      'Timer state (RUNNING or STOPPED)',
      GObject.ParamFlags.READABLE,
      TimerState.STOPPED
    ),
    // ... more properties
  }
}, class TimerViewModel extends GObject.Object {
  // Implementation with this.notify('property-name') calls
});
```

---

### 5.3 Create Main Window Controller

**Files to create:**
- `src/view/MainWindow.ts`

**Steps:**

- [ ] **5.3.1** Implement `src/view/MainWindow.ts`
  - Load MainWindow.ui template
  - Bind TimerViewModel properties to UI widgets
  - Connect button click handlers
  - Handle SettingsDialog lifecycle

- [ ] **5.3.2** Commit changes
  ```bash
  git add src/view/MainWindow.ts
  git commit -m "Add MainWindow controller with ViewModel binding"
  ```

**Example structure:**
```typescript
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import type { TimerViewModel } from '../viewModels/TimerViewModel';
import { SettingsDialog } from './SettingsDialog';

export const MainWindow = GObject.registerClass({
  GTypeName: 'PomodoroMainWindow',
  Template: 'resource:///org/example/pomodoro/ui/MainWindow.ui',
  InternalChildren: [
    'timeLabel',
    'modeLabel',
    'modeIcon',
    'startStopButton',
    'skipButton',
    'resetButton',
    'settingsButton'
  ]
}, class MainWindow extends Gtk.ApplicationWindow {
  private _timeLabel!: Gtk.Label;
  private _modeLabel!: Gtk.Label;
  private _modeIcon!: Gtk.Image;
  private _startStopButton!: Gtk.Button;
  private _skipButton!: Gtk.Button;
  private _resetButton!: Gtk.Button;
  private _settingsButton!: Gtk.Button;
  private _viewModel: TimerViewModel | null = null;

  _init(params: any) {
    super._init(params);

    // Connect button signals
    this._startStopButton.connect('clicked', () => this._onStartStopClicked());
    this._skipButton.connect('clicked', () => this._onSkipClicked());
    this._resetButton.connect('clicked', () => this._onResetClicked());
    this._settingsButton.connect('clicked', () => this._onSettingsClicked());
  }

  bindViewModel(viewModel: TimerViewModel): void {
    this._viewModel = viewModel;

    // Bind properties
    viewModel.bind_property('display-time', this._timeLabel, 'label', GObject.BindingFlags.SYNC_CREATE);
    viewModel.bind_property('mode-label', this._modeLabel, 'label', GObject.BindingFlags.SYNC_CREATE);
    viewModel.bind_property('mode-icon', this._modeIcon, 'icon-name', GObject.BindingFlags.SYNC_CREATE);
    viewModel.bind_property('start-stop-label', this._startStopButton, 'label', GObject.BindingFlags.SYNC_CREATE);
  }

  private _onStartStopClicked(): void {
    if (!this._viewModel) return;

    if (this._viewModel.state === 'STOPPED') {
      this._viewModel.start();
    } else {
      this._viewModel.stop();
    }
  }

  private _onSkipClicked(): void {
    this._viewModel?.skip();
  }

  private _onResetClicked(): void {
    this._viewModel?.reset();
  }

  private _onSettingsClicked(): void {
    // TODO: Open SettingsDialog
  }
});
```

---

### 5.4 Create Settings Dialog Controller

**Files to create:**
- `src/view/SettingsDialog.ts`

**Steps:**

- [ ] **5.4.1** Implement `src/view/SettingsDialog.ts`
  - Load SettingsDialog.ui template
  - Bind SettingsViewModel properties
  - Handle Save/Cancel buttons
  - Return updated settings to caller

- [ ] **5.4.2** Commit changes
  ```bash
  git add src/view/SettingsDialog.ts
  git commit -m "Add SettingsDialog controller with ViewModel binding"
  ```

---

### 5.5 Integrate SettingsDialog with MainWindow

**Files to modify:**
- `src/view/MainWindow.ts`

**Steps:**

- [ ] **5.5.1** Update MainWindow to instantiate and show SettingsDialog
  - Create SettingsViewModel and SettingsDialog instances
  - Handle settings changes from dialog
  - Update TimerViewModel with new settings

- [ ] **5.5.2** Commit changes
  ```bash
  git add src/view/MainWindow.ts
  git commit -m "Integrate SettingsDialog with MainWindow"
  ```

---

### 5.6 Create Application Entry Point

**Files to modify:**
- `src/main.ts`

**Steps:**

- [ ] **5.6.1** Implement GTK application in `src/main.ts`
  ```typescript
  import Gtk from 'gi://Gtk';
  import Gio from 'gi://Gio';
  import { MainWindow } from './view/MainWindow';
  import { TimerViewModel } from './viewModels/TimerViewModel';
  import { GLibTimerService } from './services/GLibTimerService';
  import { MockSettingsStorage } from '../test/services/MockSettingsStorage'; // TODO: Replace with real GSettings

  const application = new Gtk.Application({
    application_id: 'org.example.pomodoro',
    flags: Gio.ApplicationFlags.FLAGS_NONE
  });

  application.connect('activate', () => {
    // Create services
    const timerService = new GLibTimerService();
    const storage = new MockSettingsStorage(); // TODO: Use real GSettings implementation

    // Create ViewModel
    const viewModel = new TimerViewModel(timerService, storage);

    // Create and show window
    const window = new MainWindow({ application });
    window.bindViewModel(viewModel);
    window.present();
  });

  application.run([]);
  ```

- [ ] **5.6.2** Build the application
  ```bash
  npm run build
  ```

- [ ] **5.6.3** Test run the application
  ```bash
  gjs -m dist/main.js
  ```

- [ ] **5.6.4** Commit changes
  ```bash
  git add src/main.ts
  git commit -m "Create GTK application entry point with MVVM wiring"
  ```

---

## Phase 6: Manual Testing & Bug Fixes

### 6.1 Manual Testing Checklist

Refer to `docs/testing-strategy.md` for the complete manual testing checklist.

**MainWindow Testing:**
- [ ] Window opens with correct initial state
- [ ] Timer starts and counts down correctly
- [ ] Start/Stop button toggles properly
- [ ] Skip button works correctly
- [ ] Reset button works correctly
- [ ] Settings button opens dialog
- [ ] Mode transitions work (WORK ↔ REST)
- [ ] Display updates correctly (time, mode label, icon)

**SettingsDialog Testing:**
- [ ] Dialog opens with current settings
- [ ] Input validation works (SpinButton constraints)
- [ ] Save applies changes correctly
- [ ] Cancel discards changes
- [ ] hasChanges detection works
- [ ] Settings persist across app restarts (when GSettings implemented)

### 6.2 Bug Fixes

- [ ] **6.2.1** Document any bugs found during manual testing

- [ ] **6.2.2** Fix bugs one at a time
  - Write a failing test that reproduces the bug (if possible)
  - Fix the implementation
  - Verify test passes
  - Commit with descriptive message referencing the bug

- [ ] **6.2.3** Re-run all tests after fixes
  ```bash
  npm test
  ```

---

## Phase 7: Optional Enhancements (Future Work)

These are listed in architecture.md as future enhancements. Implement only if time permits.

- [ ] Desktop notifications (Gio.Notification)
- [ ] Audio notifications (system sounds)
- [ ] Long break mode (4 work sessions → 15min break)
- [ ] Statistics tracking
- [ ] Keyboard shortcuts
- [ ] Real GSettings implementation (replace MockSettingsStorage)
- [ ] Tray icon with timer display

---

## Completion Criteria

The project is complete when:

- [x] All unit tests pass (`npm test`)
- [x] All models have tests with ~95%+ coverage
- [x] All ViewModels have tests with ~95%+ coverage
- [x] Views are manually tested and working
- [x] Application builds without errors (`npm run build`)
- [x] Application runs and displays correctly (`gjs -m dist/main.js`)
- [x] All core features work:
  - Timer countdown
  - Start/Stop/Skip/Reset
  - Mode transitions (WORK ↔ REST)
  - Settings dialog
  - Settings persistence (mock)
- [x] Code is well-organized following MVVM pattern
- [x] All commits have clear, descriptive messages
- [x] Documentation is up to date

---

## Summary of Commits

Expected commit history structure:

```
1. Add TimerMode enum with tests
2. Add TimerState enum with tests
3. Add TimerSettings Zod schema with validation tests
4. Add TimerModel Zod schema with validation tests
5. Add service interfaces for dependency injection
6. Add MockSettingsStorage with tests
7. Add FakeTimerService with manual tick control
8. Add TimerViewModel basic structure with initialization
9. Add computed properties to TimerViewModel
10. Add start() and stop() methods to TimerViewModel
11. Add _tick() countdown logic to TimerViewModel
12. Add mode transition logic to TimerViewModel
13. Add skip() and reset() methods to TimerViewModel
14. Add updateSettings() method to TimerViewModel
15. Add integration tests for TimerViewModel
16. Add SettingsViewModel with validation and dirty tracking
17. Add MainWindow UI template (GTK4)
18. Add SettingsDialog UI template (GTK4)
19. Add GLib-based TimerService for production use
20. Convert ViewModels to GObject classes for GTK binding
21. Add MainWindow controller with ViewModel binding
22. Add SettingsDialog controller with ViewModel binding
23. Integrate SettingsDialog with MainWindow
24. Create GTK application entry point with MVVM wiring
25. [Bug fixes and refinements as needed]
```

---

## Getting Help

If you encounter issues:

1. **Check test output**: Run `npm test` to see which tests are failing
2. **Review architecture**: Refer to `docs/architecture.md` for design details
3. **Review testing strategy**: Refer to `docs/testing-strategy.md` for test patterns
4. **Check build errors**: Run `npm run build` to see TypeScript compilation errors
5. **Use GJS documentation**: https://gjs.guide/ for GTK/GObject patterns

---

## Notes

- **TDD is mandatory for Models/ViewModels**: Always write tests first
- **Views are tested manually**: UI templates verified through interaction
- **Commit frequently**: Each completed feature/test group should be committed
- **Use descriptive commit messages**: Follow conventional commit format
- **Keep dependencies injected**: Use interfaces for testability
- **Property notifications**: Remember to emit GObject property notifications

Good luck with the implementation! 🎯
