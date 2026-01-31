import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import type { TimerMode } from '../models/TimerMode';
import type { TimerSettings } from '../models/TimerSettings';
import type { TimerState } from '../models/TimerState';
import type { ISettingsStorage } from '../services/ISettingsStorage';
import type { ITimerService } from '../services/ITimerService';

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
  class TimerViewModel extends GObject.Object {
    private _remainingSeconds!: number;
    private _currentMode!: TimerMode;
    private _state!: TimerState;
    private _totalSeconds!: number;
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
      this._currentMode = 'WORK';
      this._state = 'STOPPED';
      this._totalSeconds = this._settings.workDuration * 60;
      this._remainingSeconds = this._totalSeconds;
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

    start(): void {
      if (this._state === 'RUNNING') return;

      this._state = 'RUNNING';
      this._timerId = this.timerService.startTimer(() => this._tick(), 1000);
      this.notify('state');
      this.notify('start-stop-label');
    }

    stop(): void {
      if (this._state === 'STOPPED') return;

      this._state = 'STOPPED';
      if (this._timerId !== null) {
        this.timerService.stopTimer(this._timerId);
        this._timerId = null;
      }
      this.notify('state');
      this.notify('start-stop-label');
    }

    private _tick(): boolean {
      if (this._remainingSeconds > 0) {
        this._remainingSeconds--;
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
      // Switch mode
      this._currentMode = this._currentMode === 'WORK' ? 'REST' : 'WORK';

      // Set to stopped state
      this._state = 'STOPPED';

      // Clear timer ID (timer already stopped by returning false from _tick)
      this._timerId = null;

      // Reset timer for new mode
      this._resetToCurrentMode();

      // Emit property notifications
      this.notify('current-mode');
      this.notify('mode-label');
      this.notify('mode-icon');
      this.notify('state');
      this.notify('start-stop-label');
      this.notify('remaining-seconds');
      this.notify('display-time');
    }

    private _resetToCurrentMode(): void {
      const durationMinutes =
        this._currentMode === 'WORK' ? this._settings.workDuration : this._settings.restDuration;

      this._totalSeconds = durationMinutes * 60;
      this._remainingSeconds = this._totalSeconds;
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

      this._state = 'STOPPED';
      this._remainingSeconds = this._totalSeconds;

      // Emit property notifications
      this.notify('state');
      this.notify('start-stop-label');
      this.notify('remaining-seconds');
      this.notify('display-time');
    }

    updateSettings(settings: TimerSettings): void {
      this._settings = { ...settings };

      // Persist to storage
      this.storage.save(this._settings);

      // If stopped, apply new duration to current mode
      if (this._state === 'STOPPED') {
        this._resetToCurrentMode();
        // Emit property notifications
        this.notify('remaining-seconds');
        this.notify('display-time');
      }
    }

    vfunc_dispose(): void {
      // Clean up timer if running
      // Use GLib.Source.remove directly to avoid JS callback during GC
      if (this._timerId !== null) {
        GLib.Source.remove(this._timerId);
        this._timerId = null;
      }

      super.vfunc_dispose();
    }
  },
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
