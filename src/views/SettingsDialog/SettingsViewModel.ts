import GObject from 'gi://GObject';
import { type TimerSettings, TimerSettingsSchema } from '../../models/TimerSettings';

/** @todo Refactor */
class _SettingsViewModel extends GObject.Object {
  private _workDuration = 0;
  private _restDuration = 0;
  private _originalSettings: TimerSettings | null = null;

  get workDuration(): number {
    return this._workDuration;
  }

  set workDuration(value: number) {
    if (this._workDuration !== value) {
      this._workDuration = value;
      this.notify('work-duration');
      this.notify('has-changes');
    }
  }

  get restDuration(): number {
    return this._restDuration;
  }

  set restDuration(value: number) {
    if (this._restDuration !== value) {
      this._restDuration = value;
      this.notify('rest-duration');
      this.notify('has-changes');
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
    this.notify('work-duration');
    this.notify('rest-duration');
    this.notify('has-changes');
  }

  save(): TimerSettings {
    const settings = {
      workDuration: this._workDuration,
      restDuration: this._restDuration,
    };

    // Validate and return with brand
    const validated = TimerSettingsSchema.parse(settings);

    this._originalSettings = { ...validated };
    this.notify('has-changes');

    return validated;
  }

  cancel(): void {
    if (this._originalSettings) {
      this._workDuration = this._originalSettings.workDuration;
      this._restDuration = this._originalSettings.restDuration;
      this.notify('work-duration');
      this.notify('rest-duration');
      this.notify('has-changes');
    }
  }

  validateWorkDuration(value: number): boolean {
    return TimerSettingsSchema.shape.workDuration.safeParse(value).success;
  }

  validateRestDuration(value: number): boolean {
    return TimerSettingsSchema.shape.restDuration.safeParse(value).success;
  }
}

/** @todo Refactor */
const SettingsViewModelClass = GObject.registerClass(
  {
    GTypeName: 'PomodoroSettingsViewModel',
    Properties: {
      'work-duration': GObject.ParamSpec.int(
        'work-duration',
        'Work Duration',
        'Work duration in minutes',
        GObject.ParamFlags.READWRITE,
        1,
        120,
        25,
      ),
      'rest-duration': GObject.ParamSpec.int(
        'rest-duration',
        'Rest Duration',
        'Rest duration in minutes',
        GObject.ParamFlags.READWRITE,
        1,
        60,
        5,
      ),
      'has-changes': GObject.ParamSpec.boolean(
        'has-changes',
        'Has Changes',
        'Whether the settings have been modified',
        GObject.ParamFlags.READABLE,
        false,
      ),
    },
  },
  _SettingsViewModel,
);

// Type alias for the ViewModel instance
export type SettingsViewModel = InstanceType<typeof SettingsViewModelClass>;

// Factory function for creating instances (for consistency)
export function createSettingsViewModel(): SettingsViewModel {
  return new SettingsViewModelClass();
}

// Export the class for direct instantiation if needed
export { SettingsViewModelClass };
