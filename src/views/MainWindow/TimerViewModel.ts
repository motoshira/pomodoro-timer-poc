import GObject from 'gi://GObject';
import type { TimerMode } from '../../models/TimerMode';
import {
  calculateDurationSeconds,
  createInitialModel,
  reset as resetModel,
  start as startModel,
  stop as stopModel,
  type TimerModel,
  tick as tickModel,
  transitionToNextMode,
} from '../../models/TimerModel';
import {
  type TimerSettings,
  updateSettings as updateSettingsModel,
} from '../../models/TimerSettings';
import type { TimerState } from '../../models/TimerState';
import type { ISettingsStorage } from '../../services/ISettingsStorage';
import type { ITimerService } from '../../services/ITimerService';

class _TimerViewModel extends GObject.Object {
  private _model!: TimerModel;
  private _remainingSeconds!: number;
  private _currentMode!: TimerMode;
  private _state!: TimerState;
  private _settings!: TimerSettings;
  private _timerId: number | null = null;
  private timerService!: ITimerService;
  private storage!: ISettingsStorage;

  _init(params?: Partial<GObject.Object.ConstructorProps>) {
    super._init(params);
  }

  initialize(timerService: ITimerService, storage: ISettingsStorage): void {
    this.timerService = timerService;
    this.storage = storage;
    this._settings = storage.load();
    this._model = createInitialModel(this._settings);
    this._syncFromModel();
  }

  // Sync GObject property fields from model
  private _syncFromModel(): void {
    this._remainingSeconds = this._model.remainingSeconds;
    this._currentMode = this._model.currentMode;
    this._state = this._model.state;
  }

  // Getters for GObject properties
  get remainingSeconds(): number {
    return this._remainingSeconds;
  }

  get currentMode(): TimerMode {
    return this._currentMode;
  }

  get state(): TimerState {
    return this._state;
  }

  get settings(): TimerSettings {
    return { ...this._settings };
  }

  get displayTime(): string {
    const minutes = Math.floor(this._remainingSeconds / 60);
    const seconds = this._remainingSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  get modeLabel(): string {
    return this._currentMode === 'WORK' ? 'Work' : 'Rest';
  }

  get modeIcon(): string {
    return this._currentMode === 'WORK'
      ? 'preferences-system-time-symbolic'
      : 'preferences-desktop-screensaver-symbolic';
  }

  get startStopLabel(): string {
    return this._state === 'STOPPED' ? 'Start' : 'Stop';
  }

  toggleStartStop(): void {
    if (this._state === 'STOPPED') {
      this.start();
    } else {
      this.stop();
    }
  }

  start(): void {
    const { result, hasChanged } = startModel(this._model);
    if (!hasChanged) return;

    this._model = result;
    this._syncFromModel();
    this._timerId = this.timerService.startTimer(() => this._tick(), 1000);
    this.notify('state');
    this.notify('start-stop-label');
  }

  stop(): void {
    const { result, hasChanged } = stopModel(this._model);
    if (!hasChanged) return;

    this._model = result;
    this._syncFromModel();
    if (this._timerId !== null) {
      this.timerService.stopTimer(this._timerId);
      this._timerId = null;
    }
    this.notify('state');
    this.notify('start-stop-label');
  }

  private _tick(): boolean {
    if (this._remainingSeconds > 0) {
      this._model = tickModel(this._model);
      this._syncFromModel();
      this.notify('remaining-seconds');
      this.notify('display-time');

      // Check if we reached zero after decrementing
      if (this._remainingSeconds === 0) {
        this._transitionToNextMode();
        return false;
      }

      return true;
    }

    // Already at zero (shouldn't happen, but handle gracefully)
    return false;
  }

  private _transitionToNextMode(): void {
    // Clear timer ID (timer already stopped by returning false from _tick)
    this._timerId = null;

    // Transition to next mode
    this._model = transitionToNextMode(this._model, this._settings);
    this._syncFromModel();

    // Emit property notifications
    this.notify('current-mode');
    this.notify('mode-label');
    this.notify('mode-icon');
    this.notify('state');
    this.notify('start-stop-label');
    this.notify('remaining-seconds');
    this.notify('display-time');
  }

  skip(): void {
    // Stop timer if running
    if (this._timerId !== null) {
      this.timerService.stopTimer(this._timerId);
      this._timerId = null;
    }

    this._transitionToNextMode();
  }

  reset(): void {
    // Stop timer if running
    if (this._timerId !== null) {
      this.timerService.stopTimer(this._timerId);
      this._timerId = null;
    }

    this._model = resetModel(this._model, this._settings);
    this._syncFromModel();

    // Emit property notifications
    this.notify('state');
    this.notify('start-stop-label');
    this.notify('remaining-seconds');
    this.notify('display-time');
  }

  updateSettings(updates: Partial<{ workDuration: number; restDuration: number }>): void {
    const newSettings = updateSettingsModel(this._settings, updates);
    if (newSettings === null) {
      // Validation failed - do nothing
      return;
    }

    this._settings = newSettings;

    // Persist to storage
    this.storage.save(this._settings);

    // If stopped, apply new duration to current mode
    if (this._state === 'STOPPED') {
      const durationSeconds = calculateDurationSeconds(this._settings, this._model.currentMode);
      this._model = {
        ...this._model,
        remainingSeconds: durationSeconds,
      };
      this._syncFromModel();

      // Emit property notifications
      this.notify('remaining-seconds');
      this.notify('display-time');
    }
  }
}

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
        2147483647, // G_MAXINT32
        0,
      ),
      'current-mode': GObject.ParamSpec.string(
        'current-mode',
        'Current Mode',
        'Timer mode (WORK or REST)',
        GObject.ParamFlags.READABLE,
        'WORK',
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
      'mode-label': GObject.ParamSpec.string(
        'mode-label',
        'Mode Label',
        'Human-readable mode label',
        GObject.ParamFlags.READABLE,
        'Work',
      ),
      'mode-icon': GObject.ParamSpec.string(
        'mode-icon',
        'Mode Icon',
        'Icon name for current mode',
        GObject.ParamFlags.READABLE,
        'preferences-system-time-symbolic',
      ),
      'start-stop-label': GObject.ParamSpec.string(
        'start-stop-label',
        'Start/Stop Label',
        'Label for start/stop button',
        GObject.ParamFlags.READABLE,
        'Start',
      ),
    },
  },
  _TimerViewModel,
);

// Type alias for the ViewModel instance
export type TimerViewModel = InstanceType<typeof TimerViewModelClass>;

// Factory function for creating instances (for testing and application code)
export function createTimerViewModel(
  timerService: ITimerService,
  storage: ISettingsStorage,
): TimerViewModel {
  const vm = new TimerViewModelClass();
  vm.initialize(timerService, storage);
  return vm;
}

// Export the class for direct instantiation if needed
export { TimerViewModelClass };
