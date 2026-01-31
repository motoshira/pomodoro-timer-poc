import type { ITimerService } from '../services/ITimerService';
import type { ISettingsStorage } from '../services/ISettingsStorage';
import type { TimerMode } from '../models/TimerMode';
import type { TimerState } from '../models/TimerState';
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
}
