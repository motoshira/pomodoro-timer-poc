# MVVM Pattern Guide for GTK4+GJS

This guide describes the MVVM (Model-View-ViewModel) architecture pattern for GTK4+GJS applications with TypeScript.

## Table of Contents

- [Overview](#overview)
- [Model Layer](#model-layer)
- [Domain Layer](#domain-layer)
- [ViewModel Layer](#viewmodel-layer)
- [View Layer](#view-layer)
- [Service Layer](#service-layer)
- [Util Layer](#util-layer)

## Overview

The MVVM pattern separates concerns into distinct layers:

- **Model**: Pure data structures and business logic
- **Domain**: Cross-model business logic
- **ViewModel**: UI state and behavior (GObject-based)
- **View**: GTK UI templates and controllers
- **Service**: External interactions (network, timers, storage)
- **Util**: Reusable utilities

## Model Layer

### Purpose

Models represent the core data structures and business logic. They are pure, immutable, and testable.

### Guidelines

- Define models using Zod schemas with `.brand()` for type safety
- Export both schema and TypeScript type
- Implement pure functions for all operations
- Keep models immutable (return new instances)
- No side effects (no I/O, no mutations)

### Testing Strategy

- **Schema tests**: Only needed for complex validation (superRefine, transform)
- **Pure function tests**: Write comprehensive tests for all pure functions
- Test edge cases and boundary conditions
- Test immutability (original objects unchanged)

### Example

```typescript
import * as z from 'zod';

// Define schema with brand
export const TimerSettingsSchema = z
  .object({
    workDuration: z.number().positive().int(),
    restDuration: z.number().positive().int(),
  })
  .brand<'TimerSettings'>();

// Export type
export type TimerSettings = z.infer<typeof TimerSettingsSchema>;

// Factory function
export const createDefaultSettings = (): TimerSettings => {
  return TimerSettingsSchema.parse({
    workDuration: 25,
    restDuration: 5,
  });
};

// Pure update function
export const updateSettings = (
  settings: TimerSettings,
  updates: Partial<{ workDuration: number; restDuration: number }>,
): TimerSettings | null => {
  const updated = { ...settings, ...updates };
  const result = TimerSettingsSchema.safeParse(updated);
  return result.success ? result.data : null;
};
```

### Common Patterns

**Simple enumeration models:**
```typescript
export const TimerModeSchema = z.enum(['WORK', 'REST']).brand<'TimerMode'>();
export type TimerMode = z.infer<typeof TimerModeSchema>;
```

**Models with helper functions:**
```typescript
export const calculateDurationSeconds = (
  settings: TimerSettings,
  mode: TimerMode
): number => {
  const durationMinutes = mode === 'WORK'
    ? settings.workDuration
    : settings.restDuration;
  return durationMinutes * 60;
};
```

**Models with validation:**
```typescript
// Only test if using superRefine or transform
export const ComplexModelSchema = z
  .object({
    start: z.number(),
    end: z.number(),
  })
  .superRefine((data, ctx) => {
    if (data.end <= data.start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End must be after start',
      });
    }
  })
  .brand<'ComplexModel'>();
```

## Domain Layer

### Purpose

Domain layer contains pure business logic that spans multiple models. This keeps cross-cutting concerns separate from individual models.

### Guidelines

- Place in `src/domain/` directory
- Implement as pure functions
- No dependencies on ViewModel, View, or Service layers
- Can depend on multiple Model types
- Should be highly testable

### Testing Strategy

- Write comprehensive tests for all domain functions
- Test edge cases and business rule violations
- Test interactions between multiple models

### Example

```typescript
// src/domain/TimerCycle.ts
import type { TimerModel } from '../models/TimerModel';
import type { TimerSettings } from '../models/TimerSettings';
import { calculateDurationSeconds } from '../models/TimerModel';

// Calculate remaining cycles in a work session
export const calculateRemainingCycles = (
  model: TimerModel,
  settings: TimerSettings,
  targetCycles: number,
): number => {
  // Business logic involving multiple models
  // ...
};

// Determine if break should be long or short
export const shouldTakeLongBreak = (
  completedCycles: number,
  longBreakInterval: number,
): boolean => {
  return completedCycles > 0 && completedCycles % longBreakInterval === 0;
};
```

## ViewModel Layer

### Purpose

ViewModels manage UI state, expose properties for data binding, and handle UI interactions. They bridge Models and Views using GObject.

### Guidelines

- Extend `GObject.Object`
- Store pure model internally (private `_model` field)
- Expose GObject properties for binding
- Implement `_syncFromModel()` to sync model to properties
- Call `this.notify('property-name')` when properties change
- Register with `GObject.registerClass`
- Provide factory function for instantiation
- Inject services via factory function or initialize method

### Testing Strategy

- Test property initialization
- Test that methods trigger expected state changes
- Test that `notify` signals are emitted
- Do NOT test detailed business logic (delegate to Model tests)
- Use Fake/Mock services for dependencies

### Example

```typescript
import GObject from 'gi://GObject';
import type { TimerModel } from '../../models/TimerModel';
import {
  createInitialModel,
  start as startModel,
  tick as tickModel,
} from '../../models/TimerModel';

class _TimerViewModel extends GObject.Object {
  private _model!: TimerModel;
  private _remainingSeconds!: number;
  private _state!: TimerState;

  _init(params?: Partial<GObject.Object.ConstructorProps>) {
    super._init(params);
    this._model = createInitialModel(settings);
    this._syncFromModel();
  }

  // Sync GObject property fields from model
  private _syncFromModel(): void {
    this._remainingSeconds = this._model.remainingSeconds;
    this._state = this._model.state;
  }

  // Getters for GObject properties
  get remainingSeconds(): number {
    return this._remainingSeconds;
  }

  get state(): TimerState {
    return this._state;
  }

  // Computed properties
  get displayTime(): string {
    const minutes = Math.floor(this._remainingSeconds / 60);
    const seconds = this._remainingSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // Commands
  start(): void {
    const { result, hasChanged } = startModel(this._model);
    if (!hasChanged) return;

    this._model = result;
    this._syncFromModel();
    this.notify('state');
  }

  private _tick(): boolean {
    if (this._remainingSeconds > 0) {
      this._model = tickModel(this._model);
      this._syncFromModel();
      this.notify('remaining-seconds');
      this.notify('display-time');
      return true;
    }
    return false;
  }
}

// Register as GObject
const TimerViewModelClass = GObject.registerClass(
  {
    GTypeName: 'PomodoroTimerViewModel',
    Properties: {
      'remaining-seconds': GObject.ParamSpec.int(
        'remaining-seconds',
        'Remaining Seconds',
        'Current remaining time in seconds',
        GObject.ParamFlags.READABLE,
        0,
        2147483647,
        0,
      ),
      state: GObject.ParamSpec.string(
        'state',
        'State',
        'Timer state (RUNNING or STOPPED)',
        GObject.ParamFlags.READABLE,
        'STOPPED',
      ),
      'display-time': GObject.ParamSpec.string(
        'display-time',
        'Display Time',
        'Formatted time display (MM:SS)',
        GObject.ParamFlags.READABLE,
        '00:00',
      ),
    },
  },
  _TimerViewModel,
);

// Type alias
export type TimerViewModel = InstanceType<typeof TimerViewModelClass>;

// Factory function
export function createTimerViewModel(
  timerService: ITimerService,
  storage: ISettingsStorage,
): TimerViewModel {
  const vm = new TimerViewModelClass();
  vm.initialize(timerService, storage);
  return vm;
}

export { TimerViewModelClass };
```

### Property Definition Patterns

**Read-only properties:**
```typescript
Properties: {
  'my-property': GObject.ParamSpec.string(
    'my-property',
    'My Property',
    'Description',
    GObject.ParamFlags.READABLE,
    'default-value',
  ),
}
```

**Read-write properties:**
```typescript
Properties: {
  'my-property': GObject.ParamSpec.string(
    'my-property',
    'My Property',
    'Description',
    GObject.ParamFlags.READWRITE,
    'default-value',
  ),
}
```

**Numeric properties:**
```typescript
Properties: {
  count: GObject.ParamSpec.int(
    'count',
    'Count',
    'Description',
    GObject.ParamFlags.READABLE,
    -2147483648, // G_MININT32
    2147483647,  // G_MAXINT32
    0,           // default
  ),
}
```

## View Layer

### Purpose

Views render UI using GTK templates and handle user interactions. Controllers bind ViewModels to UI elements.

### Guidelines

**Controller (TypeScript):**
- Extend appropriate GTK widget (e.g., `Gtk.ApplicationWindow`)
- Register with `GObject.registerClass`
- Specify `Template` path (GResource)
- Define `InternalChildren` for UI elements
- Implement `bindViewModel()` method
- Keep logic minimal - delegate to ViewModel
- **IMPORTANT**: View creates child Views, not ViewModel

**Template (UI file):**
- Use GTK XML format
- Define UI hierarchy and properties
- Use `id` for elements referenced in controller
- Validate with `gtk4-builder-tool validate`
- Simplify with `gtk4-builder-tool simplify`

### Testing Strategy

- Views are tested manually
- UI validation via `gtk4-builder-tool validate`
- Test ViewModel separately (unit tests)
- Integration testing by running the app

### Example Controller

```typescript
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import type { TimerViewModel } from './TimerViewModel';

class _MainWindow extends Gtk.ApplicationWindow {
  private _timeLabel!: Gtk.Label;
  private _startStopButton!: Gtk.Button;
  private _viewModel: TimerViewModel | null = null;

  _init(params?: Partial<Gtk.ApplicationWindow.ConstructorProps>) {
    super._init(params);

    // Connect signals
    this._startStopButton.connect('clicked', () => this._onStartStopClicked());
  }

  bindViewModel(viewModel: TimerViewModel): void {
    this._viewModel = viewModel;

    // Bind ViewModel properties to UI
    viewModel.bind_property(
      'display-time',
      this._timeLabel,
      'label',
      GObject.BindingFlags.SYNC_CREATE,
    );

    viewModel.bind_property(
      'start-stop-label',
      this._startStopButton,
      'label',
      GObject.BindingFlags.SYNC_CREATE,
    );
  }

  private _onStartStopClicked(): void {
    if (!this._viewModel) return;

    if (this._viewModel.state === 'STOPPED') {
      this._viewModel.start();
    } else {
      this._viewModel.stop();
    }
  }

  // View creates child views, not ViewModel
  private _onSettingsClicked(): void {
    const settingsViewModel = createSettingsViewModel();
    settingsViewModel.load(this._viewModel.settings);

    const dialog = new SettingsDialog({
      transient_for: this,
      modal: true
    });
    dialog.bindViewModel(settingsViewModel);
    dialog.show();
  }
}

export const MainWindow = GObject.registerClass(
  {
    GTypeName: 'PomodoroMainWindow',
    Template: 'resource:///org/example/pomodoro/ui/MainWindow.ui',
    InternalChildren: ['timeLabel', 'startStopButton'],
  },
  _MainWindow,
);
```

### Example UI Template

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
        <child>
          <object class="GtkLabel" id="timeLabel">
            <property name="label">25:00</property>
            <style>
              <class name="title-1"/>
            </style>
          </object>
        </child>
        <child>
          <object class="GtkButton" id="startStopButton">
            <property name="label">Start</property>
            <style>
              <class name="suggested-action"/>
            </style>
          </object>
        </child>
      </object>
    </child>
  </template>
</interface>
```

## Service Layer

### Purpose

Services handle external interactions like network requests, timers, file I/O, and system APIs.

### Guidelines

- Define interface and implementation separately
- Place interfaces in `src/services/IServiceName.ts`
- Place implementations in `src/services/ServiceName.ts`
- Keep services stateless when possible
- Inject services into ViewModels via factory functions

### Testing Strategy

- **Service tests**: Not required (tested via integration)
- **In ViewModel tests**: Always use Fake/Mock implementations
- Create test helpers in `test/services/`

### Example Interface

```typescript
// src/services/ITimerService.ts
export interface ITimerService {
  startTimer(callback: () => boolean, intervalMs: number): number;
  stopTimer(timerId: number): void;
}
```

### Example Implementation

```typescript
// src/services/GLibTimerService.ts
import GLib from 'gi://GLib';
import type { ITimerService } from './ITimerService';

export class GLibTimerService implements ITimerService {
  startTimer(callback: () => boolean, intervalMs: number): number {
    return GLib.timeout_add(GLib.PRIORITY_DEFAULT, intervalMs, callback);
  }

  stopTimer(timerId: number): void {
    GLib.Source.remove(timerId);
  }
}
```

### Example Test Helper (Fake)

```typescript
// test/services/FakeTimerService.ts
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

  // Test helper: get active timer count
  getActiveCount(): number {
    return this.timers.size;
  }
}
```

## Util Layer

### Purpose

Utilities provide reusable helper functions for common operations.

### Guidelines

- Place in `src/utils/` directory
- Keep utilities pure when possible
- Group related utilities in files (e.g., `dateUtils.ts`, `arrayUtils.ts`)
- Document parameters and return types

### Testing Strategy

- Test utility functions based on complexity
- Simple utilities (array helpers): tests optional
- Complex utilities (parsing, formatting): write tests
- Use judgment for each utility

### Example

```typescript
// src/utils/formatUtils.ts

/**
 * Format seconds as MM:SS
 */
export const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Parse MM:SS format to seconds
 */
export const parseTime = (timeString: string): number | null => {
  const match = timeString.match(/^(\d+):(\d{2})$/);
  if (!match) return null;

  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);

  if (seconds >= 60) return null;
  return minutes * 60 + seconds;
};
```

## Summary

| Layer | Purpose | Testing | Key Points |
|-------|---------|---------|------------|
| **Model** | Pure data & logic | Test pure functions | Zod schemas, immutable, no side effects |
| **Domain** | Cross-model logic | Test thoroughly | Pure functions, business rules |
| **ViewModel** | UI state & behavior | Test properties & signals | GObject, notify on changes |
| **View** | UI rendering | Manual testing | GTK templates, minimal logic |
| **Service** | External interactions | Mock in tests | Interface + implementation |
| **Util** | Reusable helpers | Test if complex | Pure when possible |

## Development Workflow (Inside-Out)

1. **Model Layer**: Define schemas and pure functions → Write tests
2. **Domain Layer** (if needed): Cross-model logic → Write tests
3. **ViewModel Layer**: GObject properties and commands → Write tests
4. **View Layer**: GTK templates and controllers → Manual testing
5. **Integration**: Wire everything together in main.ts

This approach ensures solid foundations (Models) before building higher layers (ViewModels, Views).
