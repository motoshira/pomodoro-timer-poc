import GObject from 'gi://GObject';
import { type TimerSettings, TimerSettingsSchema } from '../../models/TimerSettings';
import type { ISettingsStorage } from '../../services/ISettingsStorage';

class _SettingsViewModel extends GObject.Object {
  private _workDuration = 0;
  private _restDuration = 0;
  private _originalSettings: TimerSettings | null = null;
  private storage!: ISettingsStorage;

  initialize(storage: ISettingsStorage, initialSettings: TimerSettings): void {
    this.storage = storage;
    this.load(initialSettings);
  }

  get workDuration(): number {
    return this._workDuration;
  }

  set workDuration(value: number) {
    if (this._workDuration !== value) {
      this._workDuration = value;
      this.notify('work-duration');
      this._saveImmediately();
    }
  }

  get restDuration(): number {
    return this._restDuration;
  }

  set restDuration(value: number) {
    if (this._restDuration !== value) {
      this._restDuration = value;
      this.notify('rest-duration');
      this._saveImmediately();
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

  private _saveImmediately(): void {
    try {
      const settings = {
        workDuration: this._workDuration,
        restDuration: this._restDuration,
      };

      // Validate
      const validated = TimerSettingsSchema.parse(settings);

      // Persist to storage
      this.storage.save(validated);

      // Update original settings
      this._originalSettings = { ...validated };
      this.notify('has-changes');

      // Emit signal (no parameters - listeners will reload from storage)
      this.emit('settings-changed');
    } catch (error) {
      // Log error but don't show dialog
      console.error('Failed to save settings:', error);
    }
  }

  validateWorkDuration(value: number): boolean {
    return TimerSettingsSchema.shape.workDuration.safeParse(value).success;
  }

  validateRestDuration(value: number): boolean {
    return TimerSettingsSchema.shape.restDuration.safeParse(value).success;
  }
}

const SettingsViewModelClass = GObject.registerClass(
  {
    GTypeName: 'PomodoroSettingsViewModel',
    Signals: {
      'settings-changed': {},
    },
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
export function createSettingsViewModel(
  storage: ISettingsStorage,
  initialSettings: TimerSettings,
): SettingsViewModel {
  const vm = new SettingsViewModelClass();
  vm.initialize(storage, initialSettings);
  return vm;
}

// Export the class for direct instantiation if needed
export { SettingsViewModelClass };
