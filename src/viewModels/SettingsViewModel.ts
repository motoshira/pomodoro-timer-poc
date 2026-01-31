import { type TimerSettings, TimerSettingsSchema } from '../models/TimerSettings';

export class SettingsViewModel {
  private _workDuration = 0;
  private _restDuration = 0;
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
      restDuration: this._restDuration,
    };

    // Validate and return with brand
    const validated = TimerSettingsSchema.parse(settings);

    this._originalSettings = { ...validated };
    // TODO: Emit property notifications when GObject is implemented

    return validated;
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
