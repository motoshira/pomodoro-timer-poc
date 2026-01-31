import type { TimerMode } from '../models/TimerMode';
import type { TimerSettings } from '../models/TimerSettings';
import type { TimerState } from '../models/TimerState';
import type { ISettingsStorage } from '../services/ISettingsStorage';
import type { ITimerService } from '../services/ITimerService';

export class TimerViewModel {
  private _remainingSeconds: number;
  private _currentMode: TimerMode;
  private _state: TimerState;
  private _totalSeconds: number;
  private _settings: TimerSettings;
  private _timerId: number | null = null;

  constructor(
    private timerService: ITimerService,
    private storage: ISettingsStorage,
  ) {
    this._settings = storage.load();
    this._currentMode = 'WORK';
    this._state = 'STOPPED';
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
    // TODO: Emit property notification when GObject is implemented
  }

  stop(): void {
    if (this._state === 'STOPPED') return;

    this._state = 'STOPPED';
    if (this._timerId !== null) {
      this.timerService.stopTimer(this._timerId);
      this._timerId = null;
    }
    // TODO: Emit property notification when GObject is implemented
  }

  private _tick(): boolean {
    if (this._remainingSeconds > 0) {
      this._remainingSeconds--;
      // TODO: Emit property notification when GObject is implemented

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

    // Reset timer for new mode
    this._resetToCurrentMode();

    // TODO: Emit property notifications when GObject is implemented
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

    // TODO: Emit property notifications when GObject is implemented
  }
}
