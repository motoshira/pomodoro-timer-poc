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
}
