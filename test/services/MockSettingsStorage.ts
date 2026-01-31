import {
  createDefaultSettings,
  type TimerSettings,
  TimerSettingsSchema,
} from '../../src/models/TimerSettings';
import type { ISettingsStorage } from '../../src/services/ISettingsStorage';

export class MockSettingsStorage implements ISettingsStorage {
  private _settings: TimerSettings | null = null;

  load(): TimerSettings {
    if (this._settings) {
      return { ...this._settings };
    }
    return this.getDefaultSettings();
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
